import { db } from '@/lib/db'
import { BeltLevel } from '@prisma/client'
import { isYouth, getNextBelt, getBeltLabel } from '@/lib/belt-utils'
export { eisenVoorBelt, VAKVOLGORDE, BELT_SEQ, BELT_NL, KORT } from '@/lib/examen-eisen'
export type { EisVak, DoelBelt } from '@/lib/examen-eisen'

export const GROEP_LABELS: Record<string, string> = {
  VRIJDAG_1E: 'Vrijdag 1e groep',
  VRIJDAG_2E: 'Vrijdag 2e groep',
  WOENSDAG: 'Woensdag algemeen',
  SENIOREN: 'Senioren',
}
export const GROEP_SUBTEXT: Record<string, string> = {
  VRIJDAG_1E: '18:45–19:45 · De Knotwilg Steenbergen',
  VRIJDAG_2E: '19:45–20:45 · De Knotwilg Steenbergen',
  WOENSDAG: '19:00–20:00 · De Vossenkuil Oud-Vossemeer',
  SENIOREN: 'Seniorengroep',
}

export interface Kandidaat {
  memberId: string
  userId: string
  firstName: string
  lastName: string
  currentBelt: BeltLevel | null
  doel: BeltLevel | null
  clubStatus: string
}

// Leden in een groep die ergens voor op kunnen (geen trainers, geen zwart, wel een volgend doel)
export async function kandidatenVoorGroep(groep: string): Promise<Kandidaat[]> {
  const leden = await db.member.findMany({
    where: {
      isActive: true, isTrainer: false, primaryGroup: groep,
      clubStatus: { in: ['LID', 'RESERVE'] },
    },
    orderBy: [{ currentBelt: 'asc' }, { lastName: 'asc' }],
  })
  return leden
    .map(m => {
      const cb = (m.currentBelt === 'BRUIN_1' ? 'BRUIN' : m.currentBelt) as BeltLevel | null
      const doel = getNextBelt(cb, isYouth(m.dateOfBirth))
      return { memberId: m.id, userId: m.userId, firstName: m.firstName, lastName: m.lastName, currentBelt: cb, doel: doel as BeltLevel | null, clubStatus: m.clubStatus }
    })
    .filter(k => k.doel !== null)
}

export function beltLabel(belt: BeltLevel | null) { return getBeltLabel(belt) }

export function verifCode() {
  const c = () => Array.from({ length: 4 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join('')
  return `MJ-${c()}-${c()}`
}
