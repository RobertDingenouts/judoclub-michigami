// Eén data-haal-logica voor het lessen-/aanwezigheidsoverzicht (KwartaalGrid).
// Zowel de pagina /admin/aanwezigheid als de widget op het startscherm gebruiken
// dit, zodat er maar EÉN soort aanwezigheidslijst is — dezelfde leden, dezelfde
// sortering, dezelfde bandvolgorde. Vroeger bestond er een aparte dashboard-
// variant die afweek; die is afgeschaft.
import { db } from '@/lib/db'
import { GROEPEN } from '@/lib/admin2'
import { vakantieOp } from '@/data/vakanties'

export type DagCel = { id: string; datum: string; groep: string; locatie: string; cancelled: boolean; activity: string | null; vakantie?: boolean }
export type LidRef = { id: string; naam: string; clubStatus: string; groep: string; dateOfBirth: string | null; currentBelt: string | null; joinDate: string | null; trainer?: boolean }

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

  const [periodes, dagen, leden, trainers] = await Promise.all([
    db.contributionPeriod.findMany({ orderBy: { start: 'asc' } }),
    db.trainingDay.findMany({
      where: { date: { gte: rangeStart, lt: rangeEnd }, group: { in: groepen } },
      include: { attendance: true },
      orderBy: [{ date: 'asc' }, { group: 'asc' }],
    }),
    db.member.findMany({
      // Gestopte/verwijderde leden (zoals Hanna Kleefman) doken in élk nieuw
      // kwartaal weer op. Regel: normale leden altijd; gestopten/verwijderden
      // ALLEEN in periodes waar ze daadwerkelijk aanwezigheid hebben.
      where: {
        // Actieve leden van deze groep(en): primaryGroup OF één van trainingGroups (meerdags-leden zoals Rayn)
        AND: [
          { OR: [{ primaryGroup: { in: groepen } }, ...groepen.map(g => ({ trainingGroups: { array_contains: g } }))] },
          {
            OR: [
              { isActive: true, clubStatus: { notIn: ['GESTOPT', 'PROEF'] }, isTrainer: false },
              { attendance: { some: { trainingDay: { date: { gte: rangeStart, lt: rangeEnd } } } }, isTrainer: false },
              // Proefleden (gasten) altijd in beeld zolang ze actief zijn, zodat
              // proeflessen gekruist kunnen worden.
              { clubStatus: 'PROEF', isActive: true, isTrainer: false },
            ],
          },
        ],
      },
      orderBy: [{ lastName: 'asc' }],
      select: { id: true, firstName: true, lastName: true, primaryGroup: true, trainingGroups: true, clubStatus: true, dateOfBirth: true, currentBelt: true, joinDate: true },
    }),
    // Trainers/instructeurs: onderaan elke lesgroep kruisbaar, ongeacht hun eigen groep.
    // Automatisch: isTrainer-vlag OF rol INSTRUCTOR. ADMIN is géén trainer —
    // het Bestuur-account en admin-accounts hebben hun eigen rol (okt 2026).
    db.member.findMany({
      where: { clubStatus: { notIn: ['GESTOPT'] }, OR: [{ isTrainer: true }, { user: { role: 'INSTRUCTOR' } }] },
      orderBy: [{ lastName: 'asc' }],
      select: { id: true, firstName: true, lastName: true, primaryGroup: true, clubStatus: true, dateOfBirth: true, currentBelt: true, joinDate: true },
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
    vakantie: vakantieOp(d.date.toISOString().slice(0, 10), d.group) !== null || (d.notes ?? '').startsWith('Vakantie (handmatig)'),
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
    leden: leden.map(m => ({ id: m.id, naam: `${m.firstName} ${m.lastName}`, clubStatus: m.clubStatus, groep: m.primaryGroup ?? '', groepen: [...new Set([m.primaryGroup, ...(Array.isArray(m.trainingGroups) ? (m.trainingGroups as string[]) : [])].filter(Boolean) as string[])], dateOfBirth: m.dateOfBirth?.toISOString().slice(0, 10) ?? null, currentBelt: m.currentBelt, joinDate: m.joinDate?.toISOString().slice(0, 10) ?? null })) as LidRef[],
    trainers: trainers.map(t => ({ id: t.id, naam: `${t.firstName} ${t.lastName}`, clubStatus: t.clubStatus, groep: t.primaryGroup ?? '', dateOfBirth: t.dateOfBirth?.toISOString().slice(0, 10) ?? null, currentBelt: t.currentBelt, joinDate: t.joinDate?.toISOString().slice(0, 10) ?? null, trainer: true })) as LidRef[],
    cellen,
  }
}
