import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// POST { paymentId, items?: [{omschrijving,bedrag}], note?, dueDate? }
// Bedrag van de factuur = som van items; Payment.amount blijft de som (dashboards tellen mee).
export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Geen admin' }, { status: 403 })
  const { paymentId, items, note, dueDate } = await req.json()
  if (!paymentId) return NextResponse.json({ error: 'paymentId nodig' }, { status: 400 })

  const p = await db.payment.findUnique({ where: { id: paymentId }, include: { period: true } })
  if (!p) return NextResponse.json({ error: 'Payment niet gevonden' }, { status: 404 })

  const data: Record<string, unknown> = {}
  if (Array.isArray(items)) {
    const clean = items
      .map((x: any) => ({ omschrijving: String(x.omschrijving ?? '').trim(), bedrag: Math.round((Number(x.bedrag) || 0) * 100) / 100 }))
      .filter(x => x.omschrijving || x.bedrag)
    const som = clean.reduce((s: number, x) => s + x.bedrag, 0)
    data.items = JSON.stringify(clean)
    data.amount = som
  }
  if (note !== undefined) data.note = note || null
  if (dueDate !== undefined) data.dueDate = dueDate ? new Date(dueDate) : null

  const updated = await db.payment.update({ where: { id: paymentId }, data })
  return NextResponse.json({ ok: true, amount: Number(updated.amount) })
}
