// Eén data-haal-logica voor het lessen-/aanwezigheidsoverzicht (KwartaalGrid).
// Zowel de pagina /admin/aanwezigheid als de widget op het startscherm gebruiken
// dit, zodat er maar EÉN soort aanwezigheidslijst is — dezelfde leden, dezelfde
// sortering, dezelfde bandvolgorde. Vroeger bestond er een aparte dashboard-
// variant die afweek; die is afgeschaft.
import { db } from '@/lib/db'
import { GROEPEN } from '@/lib/admin2'
import { vakantieOp } from '@/data/vakanties'

export type DagCel = { id: string; datum: string; groep: string; locatie: string; cancelled: boolean; activity: string | null; vakantie?: boolean }
export type LidRef = { id: string; naam: string; clubStatus: string; groep: string; dateOfBirth: string | null; currentBelt: string | null }

export function periodeRange(periode: string): [Date, Date] {
  const y = Number(periode.slice(0, 4))
  const q = Number(periode.slice(-1))
  const start = new Date(`${y}-${String((q - 1) * 3 + 1).padStart(2, '0')}-01`)
  const end = q === 4 ? new Date(`${y + 1}-01-01`) : new Date(`${y}-${String(q * 3 + 1).padStart(2, '0')}-01`)
  return [start, end]
}

export async function lessenGridData(opts: {
  periode?: string
  van?: string
  tot?: string
  groepen?: string[]
}) {
  const nu = new Date()
  const defaultPeriode = `${nu.getFullYear()}-Q${Math.floor(nu.getMonth() / 3) + 1}`
  const periode = opts.periode || defaultPeriode
  const alleLesGroepen = GROEPEN.filter(g => g.value !== 'SENIOREN').map(g => g.value)
  const groepen = (opts.groepen && opts.groepen.length ? opts.groepen : alleLesGroepen)
    .filter(g => alleLesGroepen.includes(g as never))

  let rangeStart: Date, rangeEnd: Date, rangeLabel: string
  if (opts.van && opts.tot) {
    rangeStart = new Date(opts.van); rangeEnd = new Date(opts.tot); rangeLabel = `${opts.van} → ${opts.tot}`
  } else {
    ;[rangeStart, rangeEnd] = periodeRange(periode); rangeLabel = periode
  }

  const [periodes, dagen, leden] = await Promise.all([
    db.contributionPeriod.findMany({ orderBy: { start: 'asc' } }),
    db.trainingDay.findMany({
      where: { date: { gte: rangeStart, lt: rangeEnd }, group: { in: groepen } },
      include: { attendance: true },
      orderBy: [{ date: 'asc' }, { group: 'asc' }],
    }),
    db.member.findMany({
      where: { isActive: true, clubStatus: { notIn: ['PROEF'] }, primaryGroup: { in: groepen } },
      orderBy: [{ lastName: 'asc' }],
      select: { id: true, firstName: true, lastName: true, primaryGroup: true, clubStatus: true, dateOfBirth: true, currentBelt: true },
    }),
  ])

  const grid = dagen.map(d => ({
    id: d.id,
    datum: d.date.toISOString(),
    groep: d.group,
    locatie: d.location,
    statussen: Object.fromEntries(d.attendance.map(a => [a.memberId, a.status])),
    activity: d.activity,
    cancelled: d.cancelled,
    vakantie: vakantieOp(d.date.toISOString().slice(0, 10), d.group) !== null,
  }))

  const cellen: Record<string, string> = Object.fromEntries(
    grid.flatMap(d => Object.entries(d.statussen).map(([mid, st]) => [`${mid}|${d.id}`, st])),
  )

  return {
    periodes,
    periode,
    rangeLabel,
    groepen,
    alleLesGroepen,
    dagen: grid.map(({ statussen: _s, ...rest }) => rest),
    leden: leden.map(m => ({ id: m.id, naam: `${m.firstName} ${m.lastName}`, clubStatus: m.clubStatus, groep: m.primaryGroup ?? '', dateOfBirth: m.dateOfBirth?.toISOString().slice(0, 10) ?? null, currentBelt: m.currentBelt })) as LidRef[],
    cellen,
  }
}
