import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET → alle artikelen + recente voorraadmutaties + actieve leden (voor factuur-tab)
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Geen admin' }, { status: 403 })
  const [items, moves, members] = await Promise.all([
    db.inventoryItem.findMany({ where: { actief: true }, orderBy: [{ product: 'asc' }, { maat: 'asc' }] }),
    db.inventoryMove.findMany({ orderBy: { createdAt: 'desc' }, take: 100 }),
    db.member.findMany({
      where: { isActive: true, clubStatus: { not: 'VRIJGESTELD' } },
      select: { id: true, firstName: true, lastName: true },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    }),
  ])
  return NextResponse.json({
    items: items.map(i => ({ ...i, inkoopIncl: Number(i.inkoopIncl), webPrijs: Number(i.webPrijs), clubPrijs: Number(i.clubPrijs) })),
    moves: moves.map(m => ({ ...m, prijs: Number(m.prijs), createdAt: m.createdAt.toISOString() })),
    members,
  })
}

type Body = {
  action: 'create' | 'update' | 'voorraad'
  id?: string
  artikelNr?: string
  ean?: string | null
  product?: string
  maat?: string | null
  inkoopIncl?: number
  webPrijs?: number
  clubPrijs?: number
  voorraad?: number
  delta?: number
  reden?: string
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Geen admin' }, { status: 403 })
  const b = (await req.json()) as Body

  if (b.action === 'create') {
    if (!b.product || b.inkoopIncl == null || b.clubPrijs == null) {
      return NextResponse.json({ error: 'product, inkoopprijs en clubprijs zijn verplicht' }, { status: 400 })
    }
    let artikelNr = (b.artikelNr || '').trim()
    if (!artikelNr) {
      // Zelfgemaakte artikelen krijgen een eigen reeks, botsen nooit met Matsuru-nummers
      const last = await db.inventoryItem.findFirst({ where: { artikelNr: { startsWith: 'Z-' } }, orderBy: { artikelNr: 'desc' } })
      const n = last ? Number(last.artikelNr.slice(2)) + 1 : 1
      artikelNr = `Z-${String(n).padStart(3, '0')}`
    }
    const created = await db.inventoryItem.create({
      data: {
        artikelNr, ean: b.ean || null, product: b.product, maat: b.maat || null,
        inkoopIncl: b.inkoopIncl, webPrijs: b.webPrijs ?? b.clubPrijs, clubPrijs: b.clubPrijs,
        voorraad: b.voorraad ?? 0,
      },
    })
    if ((b.voorraad ?? 0) > 0) {
      await db.inventoryMove.create({ data: { artikelNr, product: b.product, maat: b.maat || null, soort: 'CORRECTIE', aantal: b.voorraad!, prijs: b.inkoopIncl, reden: 'beginvoorraad bij aanmaken artikel' } })
    }
    return NextResponse.json({ ok: true, item: created })
  }

  if (b.action === 'update') {
    if (!b.id) return NextResponse.json({ error: 'id nodig' }, { status: 400 })
    const data: Record<string, unknown> = {}
    for (const k of ['product', 'maat', 'ean', 'webPrijs', 'clubPrijs', 'inkoopIncl', 'actief'] as const) {
      if (b[k] !== undefined) data[k] = b[k] === '' ? null : b[k]
    }
    const updated = await db.inventoryItem.update({ where: { id: b.id }, data })
    return NextResponse.json({ ok: true, item: { ...updated, inkoopIncl: Number(updated.inkoopIncl), webPrijs: Number(updated.webPrijs), clubPrijs: Number(updated.clubPrijs) } })
  }

  if (b.action === 'voorraad') {
    if (!b.id) return NextResponse.json({ error: 'id nodig' }, { status: 400 })
    const item = await db.inventoryItem.findUnique({ where: { id: b.id } })
    if (!item) return NextResponse.json({ error: 'artikel niet gevonden' }, { status: 404 })
    const nieuw = b.delta !== undefined ? item.voorraad + b.delta : b.voorraad
    if (nieuw == null) return NextResponse.json({ error: 'voorraad of delta nodig' }, { status: 400 })
    const d = nieuw - item.voorraad
    const updated = await db.inventoryItem.update({ where: { id: b.id }, data: { voorraad: nieuw } })
    if (d !== 0) {
      await db.inventoryMove.create({
        data: { artikelNr: item.artikelNr, product: item.product, maat: item.maat, soort: d > 0 ? 'INKOOP' : 'CORRECTIE', aantal: d, prijs: item.inkoopIncl, reden: b.reden || (b.delta !== undefined ? `handmatige correctie (${b.delta > 0 ? '+' : ''}${b.delta})` : `handmatig op ${nieuw} gezet`) },
      })
    }
    return NextResponse.json({ ok: true, voorraad: updated.voorraad })
  }

  return NextResponse.json({ error: 'onbekende action' }, { status: 400 })
}
