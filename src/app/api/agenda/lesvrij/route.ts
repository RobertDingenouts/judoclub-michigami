import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { locatieVoorGroep } from '@/data/vakanties'

export const dynamic = 'force-dynamic'

// GET → aankomende lesvrije dagen die NIET in de statische agenda staan
// (handmatige vakanties uit de admin: 'Geen les' + notitie 'Vakantie (handmatig): <reden>').
// Geaggregeerd per reden+locatie → één agenda-bericht per aaneengesloten blok,
// bijv. "Geen lessen (Steenbergen) i.v.m. Zomervakantie".
const LOC_LABEL: Record<string, string> = { STEENBERGEN: 'Steenbergen', OUD_VOSSEMEER: 'Oud-Vossemeer' }

export async function GET() {
  const nu = new Date(new Date().toISOString().slice(0, 10))
  const dagen = await db.trainingDay.findMany({
    where: { date: { gte: nu }, activity: 'Geen les', notes: { startsWith: 'Vakantie (handmatig)' } },
    select: { date: true, group: true, notes: true },
    orderBy: { date: 'asc' },
  })
  const groepen: Record<string, { van: string; tot: string; aantal: number }> = {}
  for (const d of dagen) {
    const reden = (d.notes ?? '').replace('Vakantie (handmatig): ', '').trim() || 'Vakantie'
    const loc = locatieVoorGroep(d.group)
    const iso = d.date.toISOString().slice(0, 10)
    const key = `${reden}|${loc}`
    if (!groepen[key]) groepen[key] = { van: iso, tot: iso, aantal: 0 }
    const g = groepen[key]
    if (iso < g.van) g.van = iso
    if (iso > g.tot) g.tot = iso
    g.aantal++
  }
  const items = Object.entries(groepen).map(([key, g]) => {
    const [reden, loc] = key.split('|')
    const display = g.aantal === 1
      ? new Date(g.van).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long' })
      : `${new Date(g.van).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })} t/m ${new Date(g.tot).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long' })}`
    return {
      compareDate: g.van,
      displayDate: display,
      event: `Geen lessen (${LOC_LABEL[loc] ?? loc}) i.v.m.`,
      emoji: 'ban',
      eventSub: reden,
      details: '',
      location: LOC_LABEL[loc] ?? loc,
      time: '-',
    }
  })
  return NextResponse.json({ items })
}
