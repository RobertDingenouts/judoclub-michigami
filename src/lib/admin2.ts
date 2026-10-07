// Delde constanten/helpers voor Admin Dashboard 2.0
export const GROEPEN = [
  { value: 'VRIJDAG_1E', label: '1e groep', dag: 'Vrijdag 18:45', locatie: 'De Knotwilg, Steenbergen' },
  { value: 'VRIJDAG_2E', label: '2e groep', dag: 'Vrijdag 19:45', locatie: 'De Knotwilg, Steenbergen' },
  { value: 'WOENSDAG', label: 'Woensdag', dag: 'Woensdag 19:00', locatie: 'De Vossenkuil, Oud-Vossemeer' },
  { value: 'SENIOREN', label: 'Senioren & trainers', dag: '', locatie: '' },
] as const

export const GROEP_LABEL: Record<string, string> = Object.fromEntries(GROEPEN.map(g => [g.value, g.label]))

export const STATUS_INFO: Record<string, { label: string; emoji: string; klas: string }> = {
  AANWEZIG:      { label: 'Aanwezig',      emoji: '✅', klas: 'bg-green-100 text-green-800 border-green-300' },
  AFGEMELD:      { label: 'Afgemeld',      emoji: '🅰', klas: 'bg-amber-100 text-amber-800 border-amber-300' },
  NIET_AANWEZIG: { label: 'Niet aanwezig', emoji: '❌', klas: 'bg-red-100 text-red-800 border-red-300' },
  ZIEK:          { label: 'Ziek',          emoji: '🤒', klas: 'bg-purple-100 text-purple-800 border-purple-300' },
  VERZET:        { label: 'Verzet',        emoji: '🔁', klas: 'bg-blue-100 text-blue-800 border-blue-300' },
  VAKANTIE:      { label: 'Geen les',      emoji: '🏖', klas: 'bg-gray-100 text-gray-600 border-gray-300' },
}

export const PAYMENT_INFO: Record<string, { label: string; klas: string }> = {
  OPEN:         { label: 'Open',        klas: 'bg-red-100 text-red-800' },
  BETAALD:      { label: 'Betaald',     klas: 'bg-green-100 text-green-800' },
  HERINNERING1: { label: '1e herinnering', klas: 'bg-amber-100 text-amber-800' },
  HERINNERING2: { label: '2e herinnering', klas: 'bg-orange-100 text-orange-800' },
  VIJGESTELD:   { label: 'Vrijgesteld', klas: 'bg-blue-100 text-blue-800' },
}

export function groepNaam(g: string | null | undefined): string {
  if (!g) return 'geen groep'
  return GROEP_LABEL[g] ?? g
}

export function nlDatum(d: Date | string | null | undefined): string {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function leeftijd(dob: Date | string | null | undefined): number | null {
  if (!dob) return null
  const d = new Date(dob); const t = new Date()
  let a = t.getFullYear() - d.getFullYear()
  const m = t.getMonth() - d.getMonth()
  if (m < 0 || (m === 0 && t.getDate() < d.getDate())) a--
  return a
}

export function kwartaalVan(d: Date): string {
  return `${d.getFullYear()}-Q${Math.floor(d.getMonth() / 3) + 1}`
}
