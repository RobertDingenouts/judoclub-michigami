import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth'
import { planDaysFrom } from '@/lib/lessen'

export const dynamic = 'force-dynamic'

// POST { van: 'YYYY-MM-DD', tot: 'YYYY-MM-DD' } — plan alle lesdagen in het bereik
export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Geen admin' }, { status: 403 })
  const { van, tot } = await req.json()
  if (!van || !tot) return NextResponse.json({ error: 'van + tot nodig' }, { status: 400 })
  const v = new Date(van), t = new Date(tot)
  if (isNaN(v.getTime()) || isNaN(t.getTime()) || t < v) return NextResponse.json({ error: 'Ongeldig bereik' }, { status: 400 })
  if ((t.getTime() - v.getTime()) / 864e5 > 800) return NextResponse.json({ error: 'Bereik max ~2 jaar' }, { status: 400 })
  const gemaakt = await planDaysFrom(v, t)
  return NextResponse.json({ ok: true, gemaakt })
}
