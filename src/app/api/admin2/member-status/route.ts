import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// POST { memberId, clubStatus, leaveDate? } — clubStatus: LID | RESERVE | STOPPEND | GESTOPT | PROEF
// GESTOPT => isActive=false + leaveDate (archief); terug naar LID => leaveDate leeg.
export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Geen admin' }, { status: 403 })
  const { memberId, clubStatus, leaveDate } = await req.json()
  if (!memberId || !clubStatus) return NextResponse.json({ error: 'memberId + clubStatus nodig' }, { status: 400 })
  const valid = ['LID', 'RESERVE', 'STOPPEND', 'GESTOPT', 'PROEF']
  if (!valid.includes(clubStatus)) return NextResponse.json({ error: `Ongeldige status: ${clubStatus}` }, { status: 400 })

  const data: Record<string, unknown> = {
    clubStatus,
    isActive: clubStatus !== 'GESTOPT',
  }
  if (clubStatus === 'GESTOPT') data.leaveDate = leaveDate ? new Date(leaveDate) : new Date()
  if (clubStatus === 'LID') data.leaveDate = null

  const m = await db.member.update({ where: { id: memberId }, data })
  return NextResponse.json({ ok: true, clubStatus: m.clubStatus, isActive: m.isActive, leaveDate: m.leaveDate })
}
