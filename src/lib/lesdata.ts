// Gedeelde data-haal-logica voor de LESMODUS (één dag afwerken).
// Zowel /admin/aanwezigheid/les als het startscherm-dashboard gebruiken dit,
// zodat er maar één where-en-include van is en beide exact dezelfde lijst tonen.
import { db } from '@/lib/db'
import { ensureUpcomingDays, VAKANTIE_HANDMATIG } from '@/lib/lessen'
import { getNextBelt, getBeltColor, isSlipBelt, isYouth } from '@/lib/belt-utils'
import { GROEP_LABEL } from '@/lib/admin2'
import { BELT_ORDER } from '@/lib/student-progress-types'
import { vakantieOp } from '@/data/vakanties'
import type { BeltLevel, TrainingDay } from '@prisma/client'

export type LesModusProps = {
  dag: { id: string; datum: string; groep: string; groepLabel: string; activity: string | null; vakantie?: boolean; cancelled: boolean }
  leden: { id: string; naam: string; status: string | null; gast?: boolean; hist: Record<string, string>; band: { huidig: string | null; huidigKleur: string; volgende: string | null; volgendeKleur: string; slip: boolean } }[]
  historie: { id: string; label: string }[]
  recenteDagen: { id: string; label: string; actief: boolean }[]
}

// Volgorde van de vrijdaggroepen op één datum: 1e (18:45) → 2e (19:45) → 3e (20:45)
const GROEP_TIJD: Record<string, number> = { WOENSDAG: 0, VRIJDAG_1E: 1, VRIJDAG_2E: 2 }

export async function findLesDag(dagId?: string, datum?: string, groep?: string): Promise<TrainingDay | null> {
  await ensureUpcomingDays(10)
  if (dagId) return db.trainingDay.findUnique({ where: { id: dagId } })
  if (datum && groep) {
    return db.trainingDay.upsert({
      where: { date_group: { date: new Date(datum), group: groep } },
      update: {},
      create: { date: new Date(datum), group: groep, location: groep === 'WOENSDAG' ? 'OUD_VOSSEMEER' : 'STEENBERGEN' },
    })
  }
  // eerstvolgende les
  return db.trainingDay.findFirst({
    where: { date: { gte: new Date() }, cancelled: false },
    orderBy: [{ date: 'asc' }, { group: 'asc' }],
  })
}

export async function lesModusProps(day: TrainingDay): Promise<LesModusProps> {
  const nu = new Date()
  const van = new Date(nu.getTime() - 2 * 864e5), tot = new Date(nu.getTime() + 4 * 864e5)
  const [recenteDagenRaw, leden, histDagenRaw] = await Promise.all([
    db.trainingDay.findMany({ where: { date: { gte: van, lte: tot } }, orderBy: [{ date: 'asc' }, { group: 'asc' }] }),
    db.member.findMany({
      // Gestopten/verwijderden alleen op deze dag als ze hier aanwezigheid hebben.
      // Trainers horen er altijd bij: onderaan kruisbaar bij elke les.
      where: {
        OR: [
          { primaryGroup: day.group, isActive: true, clubStatus: { not: 'GESTOPT' }, isTrainer: false },
          { primaryGroup: day.group, attendance: { some: { trainingDayId: day.id } }, isTrainer: false },
          { isTrainer: true, clubStatus: { notIn: ['GESTOPT'] } },
        ],
      },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      include: { attendance: { where: { trainingDayId: day.id } } },
    }),
    db.trainingDay.findMany({ where: { group: day.group, date: { lt: day.date } }, orderBy: { date: 'desc' }, take: 8 }),
  ])
  const recenteDagen = recenteDagenRaw.sort((a, b) =>
    a.date.getTime() - b.date.getTime() || (GROEP_TIJD[a.group] ?? 9) - (GROEP_TIJD[b.group] ?? 9))
  const histDagen = histDagenRaw.reverse()
  const histAttendance = histDagen.length
    ? await db.attendance.findMany({
        where: { trainingDayId: { in: histDagen.map(d => d.id) } },
        select: { memberId: true, trainingDayId: true, status: true },
      })
    : []
  const histMap: Record<string, Record<string, string>> = {}
  for (const a of histAttendance) (histMap[a.memberId] ??= {})[a.trainingDayId] = a.status

  const bandInfo = (m: { currentBelt: BeltLevel | null; dateOfBirth: Date | null }) => {
    const jeugd = isYouth(m.dateOfBirth)
    const volgende = getNextBelt(m.currentBelt, jeugd)
    return {
      huidig: m.currentBelt,
      huidigKleur: m.currentBelt ? getBeltColor(m.currentBelt) : '#7C3AED', // paars = nog geen band
      volgende,
      volgendeKleur: getBeltColor(volgende),
      slip: volgende ? isSlipBelt(volgende) : false,
    }
  }

  return {
    dag: {
      id: day.id, datum: day.date.toISOString(), groep: day.group,
      groepLabel: GROEP_LABEL[day.group as keyof typeof GROEP_LABEL] ?? day.group,
      activity: day.activity,
      vakantie: vakantieOp(day.date.toISOString().slice(0, 10), day.group) !== null || day.notes === VAKANTIE_HANDMATIG,
      cancelled: day.cancelled,
    },
    leden: leden.map(m => ({
      id: m.id,
      naam: `${m.firstName} ${m.lastName}`,
      status: m.attendance[0]?.status ?? null,
      gast: m.clubStatus === 'PROEF',
      trainer: m.isTrainer,
      hist: histMap[m.id] ?? {},
      band: bandInfo(m),
    })).sort((a, b) => Number(!!a.trainer) - Number(!!b.trainer) || BELT_ORDER.indexOf((a.band?.huidig ?? '') as any) - BELT_ORDER.indexOf((b.band?.huidig ?? '') as any) || a.naam.localeCompare(b.naam)),
    historie: histDagen.map(d => ({ id: d.id, label: d.date.toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short' }) })),
    recenteDagen: recenteDagen.map(d => ({
      id: d.id,
      label: `${d.date.toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short' })} · ${GROEP_LABEL[d.group as keyof typeof GROEP_LABEL] ?? d.group}`,
      actief: d.id === day.id,
    })),
  }
}
