import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// POST { paymentId, status }  — status: OPEN|BETAALD|HERINNERING1|HERINNERING2|VIJGESTELD
export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Geen admin' }, { status: 403 })
  const { paymentId, status } = await req.json()
  if (!paymentId || !status) return NextResponse.json({ error: 'paymentId + status nodig' }, { status: 400 })
  const valid = ['OPEN', 'BETAALD', 'HERINNERING1', 'HERINNERING2', 'VIJGESTELD']
  if (!valid.includes(status)) return NextResponse.json({ error: `Ongeldige status: ${status}` }, { status: 400 })
  const p = await db.payment.update({
    where: { id: paymentId },
    data: { status, paidAt: status === 'BETAALD' ? new Date() : null },
  })
  return NextResponse.json({ ok: true, status: p.status })
}
