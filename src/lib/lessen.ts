import { db } from '@/lib/db'
import { vakantieOp } from '@/data/vakanties'

// Wekelijks lesrooster (autoritair: src/data/schedule.ts):
// woensdag = algemene training De Vossenkuil; vrijdag = 1e/2e/3e groep De Knotwilg.
const PATROON: { groep: string; weekday: number; locatie: string }[] = [
  { groep: 'WOENSDAG', weekday: 3, locatie: 'OUD_VOSSEMEER' },
  { groep: 'VRIJDAG_1E', weekday: 5, locatie: 'STEENBERGEN' },
  { groep: 'VRIJDAG_2E', weekday: 5, locatie: 'STEENBERGEN' },
]

// Notitie die een handmatig op "vakantie" gezette les krijgt (zie
// /api/admin2/les-vakantie). Buiten de officiële vakanties laat
// markeerVakantieDagen deze met rust.
export const VAKANTIE_HANDMATIG = 'Vakantie (handmatig)'

// Datum (lokale middag) van de eerstvolgende lesdag van een groep op/na `from`
export function volgendeLesDatum(weekday: number, from: Date): Date {
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate(), 12, 0, 0)
  const diff = (weekday - d.getDay() + 7) % 7
  d.setDate(d.getDate() + diff)
  return d
}

// Zorg dat de komende `dagen` lesdagen bestaan volgens het weekpatroon.
// Bestaande dagen (ook geannuleerde) blijven onaangeroerd.
export async function ensureUpcomingDays(dagen = 10): Promise<void> {
  const nu = new Date()
  const tot = new Date(nu.getTime() + dagen * 864e5)
  await planDaysFrom(nu, tot)
}

// Plan alle lesdagen van `van` tot en met `tot` volgens het weekpatroon.
// Bestaande dagen blijven onaangeroerd; geeft het aantal NIUWE dagen terug.
export async function planDaysFrom(van: Date, tot: Date): Promise<number> {
  const bestaand = await db.trainingDay.findMany({
    where: { date: { gte: van, lte: tot } },
    select: { date: true, group: true },
  })
  const key = (d: Date, g: string) => `${d.toISOString().slice(0, 10)}|${g}`
  const hebben = new Set(bestaand.map(b => key(b.date, b.group)))
  let gemaakt = 0
  for (const p of PATROON) {
    let d = volgendeLesDatum(p.weekday, van)
    while (d <= tot) {
      if (!hebben.has(key(d, p.groep))) {
        // Lesdagen in een vakantie worden wél gepland, maar als "Geen les" zodat
        // ze in de aanwezigheidslijst zichtbaar zijn met de juiste reden.
        const vak = vakantieOp(d.toISOString().slice(0, 10), p.groep)
        await db.trainingDay.create({
          data: {
            date: d, group: p.groep, location: p.locatie,
            activity: vak ? 'Geen les' : null,
            notes: vak ?? null,
          },
        })
        gemaakt++
      }
      d = new Date(d.getTime() + 7 * 864e5)
    }
  }
  return gemaakt
}

// Markeer ALLE bestaande lesdagen die binnen een vakantie vallen als "Geen les".
// Idempotent: ongewijzigde dagen worden niet geraakt. Draait bij het openen van
// het dashboard, zodat zowel historie als toekomst automatisch klopt.
export async function markeerVakantieDagen(): Promise<number> {
  const alles = await db.trainingDay.findMany({
    where: { cancelled: false },
    select: { id: true, date: true, group: true, activity: true, notes: true },
  })
  const raak: { id: string; vak: string }[] = []
  for (const d of alles) {
    const iso = d.date.toISOString().slice(0, 10)
    const vak = vakantieOp(iso, d.group)
    if (vak && (d.activity !== 'Geen les' || d.notes !== vak)) {
      raak.push({ id: d.id, vak })
    }
  }
  // Bulk i.p.v. losse updates: 1 query i.p.v. N
  if (raak.length > 0) {
    await db.$transaction(
      raak.map(r => db.trainingDay.update({ where: { id: r.id }, data: { activity: 'Geen les', notes: r.vak } })),
    )
  }
  return raak.length
}
