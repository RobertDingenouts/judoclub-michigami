import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// POST { memberId, clubStatus } — clubStatus: LID | RESERVE | STOPPEND | GESTOPT
export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Geen admin' }, { status: 403 })
  const { memberId, clubStatus } = await req.json()
  if (!memberId || !clubStatus) return NextResponse.json({ error: 'memberId + clubStatus nodig' }, { status: 400 })
  const valid = ['LID', 'RESERVE', 'STOPPEND', 'GESTOPT']
  if (!valid.includes(clubStatus)) return NextResponse.json({ error: `Ongeldige status: ${clubStatus}` }, { status: 400 })
  const m = await db.member.update({
    where: { id: memberId },
    data: { clubStatus, isActive: clubStatus === 'LID' || clubStatus === 'STOPPEND' },
  })
  return NextResponse.json({ ok: true, clubStatus: m.clubStatus, isActive: m.isActive })
}
