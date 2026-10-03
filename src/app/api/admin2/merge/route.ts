import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// POST { fromId, toId } — gast/proefrecord samenvoegen in een echt lidrecord.
// Verplaatst aanwezigheid, betalingen, bandgeschiedenis en wedstrijden, verwijdert daarna het bronrecord.
export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Geen admin' }, { status: 403 })
  const { fromId, toId } = await req.json()
  if (!fromId || !toId || fromId === toId) return NextResponse.json({ error: 'fromId + toId nodig' }, { status: 400 })

  const from = await db.member.findUnique({ where: { id: fromId } })
  const to = await db.member.findUnique({ where: { id: toId } })
  if (!from || !to) return NextResponse.json({ error: 'record niet gevonden' }, { status: 404 })

  // 1) aanwezigheid: conflicten (zelfde dag allebei) — bron wint niet, doel blijft staan
  const doelDagen = (await db.attendance.findMany({ where: { memberId: toId }, select: { trainingDayId: true } })).map(a => a.trainingDayId)
  await db.attendance.deleteMany({ where: { memberId: fromId, trainingDayId: { in: doelDagen } } })
  await db.attendance.updateMany({ where: { memberId: fromId }, data: { memberId: toId } })

  // 2) betalingen: per periode — als doel er al een heeft, bron verwijderen
  const doelPeriodes = (await db.payment.findMany({ where: { memberId: toId }, select: { periodId: true } })).map(p => p.periodId)
  await db.payment.deleteMany({ where: { memberId: fromId, periodId: { in: doelPeriodes } } })
  await db.payment.updateMany({ where: { memberId: fromId }, data: { memberId: toId } })

  // 3) bandgeschiedenis: zelfde band bij beide → doel houdt datum
  const doelBanden = (await db.bondHistory.findMany({ where: { memberId: toId }, select: { belt: true } })).map(b => b.belt)
  await db.bondHistory.deleteMany({ where: { memberId: fromId, belt: { in: doelBanden } } })
  await db.bondHistory.updateMany({ where: { memberId: fromId }, data: { memberId: toId } })

  // 4) wedstrijden + examens + cursusvoortgang
  await db.competition.updateMany({ where: { memberId: fromId }, data: { memberId: toId } })
  await db.examAttempt.updateMany({ where: { memberId: fromId }, data: { memberId: toId } })
  await db.courseProgress.updateMany({ where: { memberId: fromId }, data: { memberId: toId } })

  // 5) rest van de gast-gegevens overnemen als doel ze nog niet heeft
  const patch: Record<string, unknown> = {}
  if (!to.dateOfBirth && from.dateOfBirth) patch.dateOfBirth = from.dateOfBirth
  if (!to.bondsnummer && from.bondsnummer) patch.bondsnummer = from.bondsnummer
  if (!to.phone && from.phone) patch.phone = from.phone
  if (!to.email && from.email) patch.email = from.email
  if (Object.keys(patch).length) await db.member.update({ where: { id: toId }, data: patch })

  // 6) bronrecord + user verwijderen
  await db.member.delete({ where: { id: fromId } })
  await db.user.delete({ where: { id: from.userId } }).catch(() => {})

  return NextResponse.json({ ok: true, naam: `${to.firstName} ${to.lastName}` })
}
