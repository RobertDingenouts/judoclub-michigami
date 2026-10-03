import { db } from '@/lib/db'

// Wekelijks lesrooster (autoritair: src/data/schedule.ts):
// woensdag = algemene training De Vossenkuil; vrijdag = 1e/2e/3e groep De Knotwilg.
const PATROON: { groep: string; weekday: number; locatie: string }[] = [
  { groep: 'WOENSDAG', weekday: 3, locatie: 'OUD_VOSSEMEER' },
  { groep: 'VRIJDAG_1E', weekday: 5, locatie: 'STEENBERGEN' },
  { groep: 'VRIJDAG_2E', weekday: 5, locatie: 'STEENBERGEN' },
  { groep: 'VRIJDAG_3E', weekday: 5, locatie: 'STEENBERGEN' },
]

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
        await db.trainingDay.create({ data: { date: d, group: p.groep, location: p.locatie } })
        gemaakt++
      }
      d = new Date(d.getTime() + 7 * 864e5)
    }
  }
  return gemaakt
}
