import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// POST { paymentId, items?: [{omschrijving,bedrag}], note?, dueDate?, paidAt? }
// Bedrag van de factuur = som van items; Payment.amount blijft de som (dashboards tellen mee).
export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Geen admin' }, { status: 403 })
  const { paymentId, items, note, dueDate, paidAt } = await req.json()
  if (!paymentId) return NextResponse.json({ error: 'paymentId nodig' }, { status: 400 })

  const p = await db.payment.findUnique({ where: { id: paymentId }, include: { period: true } })
  if (!p) return NextResponse.json({ error: 'Payment niet gevonden' }, { status: 404 })

  const data: Record<string, unknown> = {}
  if (Array.isArray(items)) {
    const clean = items
      .map((x: any) => ({ omschrijving: String(x.omschrijving ?? '').trim(), bedrag: Math.round((Number(x.bedrag) || 0) * 100) / 100 }))
      .filter(x => x.omschrijving || x.bedrag)
    if (clean.length === 0) {
      // herstellen: standaard contributielijn + standaardbedrag van de periode
      data.items = null
      data.amount = p.period.amount
    } else {
      const som = clean.reduce((s: number, x) => s + x.bedrag, 0)
      data.items = JSON.stringify(clean)
      data.amount = som
    }
  }
  if (note !== undefined) data.note = note || null
  if (dueDate !== undefined) data.dueDate = dueDate ? new Date(dueDate) : null
  if (paidAt !== undefined) {
    data.paidAt = paidAt ? new Date(paidAt) : null
    // Datum zetten zonder status is tegen de mei-valkuil: wie een betaaldatum
    // invult bedoelt ook betaald. Andersom: betaaldatum leeg = weer open.
    if (paidAt) data.status = 'BETAALD'
    else if (p.status === 'BETAALD') data.status = 'OPEN'
  }

  const updated = await db.payment.update({ where: { id: paymentId }, data })
  return NextResponse.json({ ok: true, amount: Number(updated.amount) })
}
