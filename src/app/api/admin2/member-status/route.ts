import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// POST { memberId, clubStatus, leaveDate? } — clubStatus: LID | RESERVE | STOPPEND | GESTOPT | PROEF | VRIJGESTELD
// GESTOPT => isActive=false + leaveDate (archief); terug naar LID => leaveDate leeg.
// VRIJGESTELD => geen contributie: openstaande payments in lopende/toekomstige periodes -> VIJGESTELD.
export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Geen admin' }, { status: 403 })
  const { memberId, clubStatus, leaveDate } = await req.json()
  if (!memberId || !clubStatus) return NextResponse.json({ error: 'memberId + clubStatus nodig' }, { status: 400 })
  const valid = ['LID', 'RESERVE', 'STOPPEND', 'GESTOPT', 'PROEF', 'VRIJGESTELD']
  if (!valid.includes(clubStatus)) return NextResponse.json({ error: `Ongeldige status: ${clubStatus}` }, { status: 400 })

  const data: Record<string, unknown> = {
    clubStatus,
    isActive: clubStatus !== 'GESTOPT',
  }
  if (clubStatus === 'GESTOPT') data.leaveDate = leaveDate ? new Date(leaveDate) : new Date()
  if (clubStatus === 'LID') data.leaveDate = null

  const m = await db.member.update({ where: { id: memberId }, data })

  // Bij GESTOPT: openstaande payments in periodes die ná de uitschrijving starten
  // zijn niet meer verschuldigd -> verwijderen (gerekend vanaf leaveDate).
  if (clubStatus === 'GESTOPT') {
    const since = (data.leaveDate as Date) ?? new Date()
    const future = await db.contributionPeriod.findMany({ where: { start: { gte: since } }, select: { id: true } })
    if (future.length) {
      await db.payment.deleteMany({
        where: { memberId, periodId: { in: future.map(p => p.id) }, status: { in: ['OPEN', 'HERINNERING1', 'HERINNERING2'] } },
      })
    }
  }

  // Bij VRIJGESTELD of RESERVE: openstaande payments in lopende/toekomstige
  // periodes op VIJGESTELD — reserves betalen geen contributie.
  if (clubStatus === 'VRIJGESTELD' || clubStatus === 'RESERVE') {
    const nu = new Date(new Date().toISOString().slice(0, 10))
    const periodes = await db.contributionPeriod.findMany({ where: { end: { gte: nu } }, select: { id: true } })
    if (periodes.length) {
      await db.payment.updateMany({
        where: { memberId, periodId: { in: periodes.map(p => p.id) }, status: { in: ['OPEN', 'HERINNERING1', 'HERINNERING2'] } },
        data: { status: 'VIJGESTELD' },
      })
    }
  }
  // Terug naar LID: eerdere vrijstellingen in lopende/toekomstige periodes weer openzetten.
  if (clubStatus === 'LID') {
    const nu = new Date(new Date().toISOString().slice(0, 10))
    const periodes = await db.contributionPeriod.findMany({ where: { end: { gte: nu } }, select: { id: true } })
    if (periodes.length) {
      await db.payment.updateMany({
        where: { memberId, periodId: { in: periodes.map(p => p.id) }, status: 'VIJGESTELD' },
        data: { status: 'OPEN' },
      })
    }
  }

  return NextResponse.json({ ok: true, clubStatus: m.clubStatus, isActive: m.isActive, leaveDate: m.leaveDate })
}
