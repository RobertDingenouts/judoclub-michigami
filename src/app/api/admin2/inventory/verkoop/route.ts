import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAdmin } from '@/lib/auth'
import { kwartaalVan } from '@/lib/admin2'

export const dynamic = 'force-dynamic'

type FactItem = { omschrijving: string; bedrag: number; artikelNr?: string; aantal?: number }

async function huidigePeriode() {
  const now = new Date()
  const lopend = await db.contributionPeriod.findFirst({
    where: { start: { lte: now }, end: { gte: now } },
    orderBy: { start: 'desc' },
  })
  if (lopend) return lopend
  // buiten elke periode (bijv. begin januari): pak de meest recente
  return db.contributionPeriod.findFirst({ orderBy: { start: 'desc' } })
}

function parseItems(raw: string | null, periodeLabel: string, periodeBedrag: number): FactItem[] {
  if (raw) {
    try { return JSON.parse(raw) as FactItem[] } catch { /* val terug op contributie */ }
  }
  return [{ omschrijving: `Contributie ${periodeLabel}`, bedrag: periodeBedrag }]
}

// GET ?memberId= → huidige factuurregels van dat lid (in de lopende periode)
export async function GET(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Geen admin' }, { status: 403 })
  const memberId = req.nextUrl.searchParams.get('memberId')
  if (!memberId) return NextResponse.json({ error: 'memberId nodig' }, { status: 400 })
  const periode = await huidigePeriode()
  if (!periode) return NextResponse.json({ error: 'geen contributieperiode gevonden' }, { status: 500 })
  const payment = await db.payment.findUnique({ where: { memberId_periodId: { memberId, periodId: periode.id } } })
  const items = parseItems(payment?.items ?? null, periode.label, Number(periode.amount))
  return NextResponse.json({
    periodeLabel: periode.label,
    paymentId: payment?.id ?? null,
    status: payment?.status ?? null,
    items,
    totaal: Math.round(items.reduce((s, x) => s + x.bedrag, 0) * 100) / 100,
  })
}

// POST { itemId, memberId, aantal } → artikel op factuur van het lid (clubprijs), voorraad -= aantal
export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Geen admin' }, { status: 403 })
  const { itemId, memberId, aantal = 1 } = await req.json()
  if (!itemId || !memberId) return NextResponse.json({ error: 'itemId en memberId nodig' }, { status: 400 })

  const [item, member, periode] = await Promise.all([
    db.inventoryItem.findUnique({ where: { id: itemId } }),
    db.member.findUnique({ where: { id: memberId } }),
    huidigePeriode(),
  ])
  if (!item) return NextResponse.json({ error: 'artikel niet gevonden' }, { status: 404 })
  if (!member) return NextResponse.json({ error: 'lid niet gevonden' }, { status: 404 })
  if (!periode) return NextResponse.json({ error: 'geen contributieperiode gevonden' }, { status: 500 })
  const n = Math.max(1, Math.floor(Number(aantal) || 1))

  let payment = await db.payment.findUnique({ where: { memberId_periodId: { memberId, periodId: periode.id } } })
  if (!payment) {
    payment = await db.payment.create({
      data: { memberId, periodId: periode.id, amount: periode.amount, status: 'OPEN', dueDate: periode.end },
    })
  }

  const items = parseItems(payment.items, periode.label, Number(periode.amount))
  const bestaand = items.find(x => x.artikelNr === item.artikelNr)
  const clubPrijs = Number(item.clubPrijs)
  if (bestaand) {
    bestaand.aantal = (bestaand.aantal ?? 1) + n
    bestaand.bedrag = Math.round(bestaand.aantal * clubPrijs * 100) / 100
  } else {
    items.push({
      omschrijving: `${item.product}${item.maat ? ` — maat ${item.maat}` : ''} (materiaal)`,
      bedrag: Math.round(clubPrijs * n * 100) / 100,
      artikelNr: item.artikelNr,
      aantal: n,
    })
  }
  const som = Math.round(items.reduce((s, x) => s + x.bedrag, 0) * 100) / 100
  await db.payment.update({ where: { id: payment.id }, data: { items: JSON.stringify(items), amount: som } })
  const updatedItem = await db.inventoryItem.update({ where: { id: item.id }, data: { voorraad: item.voorraad - n } })
  await db.inventoryMove.create({
    data: {
      artikelNr: item.artikelNr, product: item.product, maat: item.maat, soort: 'VERKOOP', aantal: -n,
      prijs: clubPrijs, memberId, memberNaam: `${member.firstName} ${member.lastName}`,
      periode: periode.label, reden: 'op factuur gezet via materiaal-tool',
    },
  })

  return NextResponse.json({ ok: true, items, totaal: som, voorraad: updatedItem.voorraad, paymentId: payment.id })
}

// DELETE { paymentId, artikelNr } → materiaallijn van de factuur af, retour in voorraad
export async function DELETE(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Geen admin' }, { status: 403 })
  const { paymentId, artikelNr } = await req.json()
  if (!paymentId || !artikelNr) return NextResponse.json({ error: 'paymentId en artikelNr nodig' }, { status: 400 })

  const p = await db.payment.findUnique({ where: { id: paymentId }, include: { period: true } })
  if (!p) return NextResponse.json({ error: 'payment niet gevonden' }, { status: 404 })
  const items = parseItems(p.items, p.period.label, Number(p.period.amount))
  const lijn = items.find(x => x.artikelNr === artikelNr)
  if (!lijn) return NextResponse.json({ error: 'lijn niet op deze factuur' }, { status: 404 })
  const volgende = items.filter(x => x.artikelNr !== artikelNr)
  const materiaallijnenOver = volgende.some(x => x.artikelNr)

  const item = await db.inventoryItem.findUnique({ where: { artikelNr } })
  if (item) {
    await db.inventoryItem.update({ where: { id: item.id }, data: { voorraad: item.voorraad + (lijn.aantal ?? 1) } })
    await db.inventoryMove.create({
      data: { artikelNr: item.artikelNr, product: item.product, maat: item.maat, soort: 'CORRECTIE', aantal: lijn.aantal ?? 1, prijs: item.inkoopIncl, memberId: p.memberId, periode: p.period.label, reden: 'factuurregel verwijderd — retour voorraad' },
    })
  }

  // geen materiaallijnen meer over → hele factuur terug naar standaard contributielijn
  const data: Record<string, unknown> = materiaallijnenOver
    ? { items: JSON.stringify(volgende), amount: Math.round(volgende.reduce((s, x) => s + x.bedrag, 0) * 100) / 100 }
    : { items: null, amount: p.period.amount }
  await db.payment.update({ where: { id: paymentId }, data })
  return NextResponse.json({ ok: true, items: materiaallijnenOver ? volgende : parseItems(null, p.period.label, Number(p.period.amount)) })
}
