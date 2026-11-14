import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { BeltLevel, ExamStatus } from '@prisma/client'

export const dynamic = 'force-dynamic'

// POST /api/admin/examens/klaar  { memberId, groep, date: 'YYYY-MM-DD', beltLevel? }
// Iemand klaarzetten voor examen op een datum: finds/maakt automatisch de examen-zitting
// (die datum + groep) en koppelt de poging — geen handmatig bijeenkomst aanmaken nodig.
export async function POST(request: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  const { memberId, groep, date, beltLevel } = await request.json() as { memberId?: string; groep?: string; date?: string; beltLevel?: string }
  if (!memberId || !groep || !date) return NextResponse.json({ error: 'memberId, groep en date verplicht' }, { status: 400 })

  const member = await db.member.findUnique({ where: { id: memberId } })
  if (!member) return NextResponse.json({ error: 'Lid niet gevonden' }, { status: 404 })
  const doel = beltLevel as BeltLevel | null
  if (!doel) return NextResponse.json({ error: 'Geen doelband' }, { status: 400 })

  const datum = new Date(date + 'T12:00:00')
  const sitting = await db.examSitting.upsert({
    where: { date_group_type: { date: datum, group: groep, type: 'EXAMEN' } },
    create: { date: datum, group: groep, type: 'EXAMEN', title: 'Examen (automatisch aangemaakt)' },
    update: {},
  })

  // Bestaande open poging van dit lid hergebruiken (anders dubbele regels), anders aanmaken.
  const open = await db.examAttempt.findFirst({
    where: { memberId, status: ExamStatus.SCHEDULED, diploma: null },
    orderBy: { createdAt: 'desc' },
  })
  const attempt = open
    ? await db.examAttempt.update({
        where: { id: open.id },
        data: { sittingId: sitting.id, beltLevel: doel, examDate: datum, klaar: true },
      })
    : await db.examAttempt.create({
        data: { memberId, userId: member.userId, sittingId: sitting.id, beltLevel: doel, status: ExamStatus.SCHEDULED, examDate: datum, klaar: true },
      })

  return NextResponse.json({ ok: true, attemptId: attempt.id, sittingId: sitting.id })
}

// DELETE /api/admin/examens/klaar  { attemptId }  — planning terugdraaien (alleen open pogingen)
export async function DELETE(request: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  const { attemptId } = await request.json()
  const a = await db.examAttempt.findUnique({ where: { id: attemptId } })
  if (!a) return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 })
  if (a.status !== ExamStatus.SCHEDULED) return NextResponse.json({ error: 'Afgerond examen kan niet weg' }, { status: 400 })
  await db.examAttempt.delete({ where: { id: attemptId } })
  return NextResponse.json({ ok: true })
}
