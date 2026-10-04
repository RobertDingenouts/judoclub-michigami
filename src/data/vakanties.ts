// Vakanties & lesvrije dagen — enige bron voor zowel de website-agenda als de
// lesplanning (src/lib/lessen.ts). Bewerk HIER, dan klopt het overal.
//
// Locatie: STEENBERGEN = vrijdaggroepen (De Knotwilg)
//          OUD_VOSSEMEER = woensdaggroep (De Vossenkuil)
//          BEIDE = beide locaties

export type Vakantie = {
  naam: string
  van: string        // ISO 'YYYY-MM-DD' (eerste lesdag die valt BINNEN de vakantie)
  tot: string        // ISO 'YYYY-MM-DD' (laatste lesdag die valt BINNEN de vakantie)
  locatie: 'STEENBERGEN' | 'OUD_VOSSEMEER' | 'BEIDE'
}

export const VAKANTIES: Vakantie[] = [
  // ── 2026 ──
  { naam: 'Carnavalsvakantie', van: '2026-02-20', tot: '2026-02-20', locatie: 'BEIDE' },
  { naam: 'Meivakantie', van: '2026-04-22', tot: '2026-04-22', locatie: 'OUD_VOSSEMEER' },
  { naam: 'Meivakantie', van: '2026-04-24', tot: '2026-04-24', locatie: 'STEENBERGEN' },
  { naam: 'Meivakantie', van: '2026-04-29', tot: '2026-04-29', locatie: 'OUD_VOSSEMEER' },
  { naam: 'Meivakantie', van: '2026-05-01', tot: '2026-05-01', locatie: 'STEENBERGEN' },
  { naam: 'Zomervakantie', van: '2026-07-10', tot: '2026-08-21', locatie: 'STEENBERGEN' },
  { naam: 'Zomervakantie', van: '2026-07-08', tot: '2026-08-19', locatie: 'OUD_VOSSEMEER' },
  { naam: 'Herfstvakantie', van: '2026-10-16', tot: '2026-10-23', locatie: 'STEENBERGEN' },
  { naam: 'Herfstvakantie', van: '2026-10-21', tot: '2026-10-21', locatie: 'OUD_VOSSEMEER' },
  { naam: 'Kerstvakantie', van: '2026-12-18', tot: '2026-12-25', locatie: 'STEENBERGEN' },
  { naam: 'Kerstvakantie', van: '2026-12-23', tot: '2026-12-30', locatie: 'OUD_VOSSEMEER' },

  // ── 2027 ──
  { naam: 'Carnavalsvakantie', van: '2027-02-12', tot: '2027-02-12', locatie: 'BEIDE' },
  { naam: 'Meivakantie', van: '2027-05-05', tot: '2027-05-05', locatie: 'BEIDE' },
  { naam: 'Zomervakantie', van: '2027-07-05', tot: '2027-08-17', locatie: 'BEIDE' },
  { naam: 'Herfstvakantie', van: '2027-10-18', tot: '2027-10-22', locatie: 'BEIDE' },
  { naam: 'Kerstvakantie', van: '2027-12-20', tot: '2027-12-24', locatie: 'BEIDE' },
]

/** Groep → locatie, afgeleid van het weekrooster (src/data/schedule.ts).
 *  Bewust NIET uit de database: historische TrainingDay-rijen hebben wél
 *  foutieve locaties (VRIJDAG_1E op OUD_VOSSEMEER), die de planning niet mogen
 *  beïnvloeden. */
const GROEP_LOCATIE: Record<string, 'STEENBERGEN' | 'OUD_VOSSEMEER'> = {
  WOENSDAG: 'OUD_VOSSEMEER',
  VRIJDAG_1E: 'STEENBERGEN',
  VRIJDAG_2E: 'STEENBERGEN',
  VRIJDAG_3E: 'STEENBERGEN',
  SENIOREN: 'STEENBERGEN',
}
export function locatieVoorGroep(groep: string): string {
  return GROEP_LOCATIE[groep] ?? 'STEENBERGEN'
}

/** Is `iso` binnen een vakantie die geldt voor `groep`? Geeft de naam of null. */
export function vakantieOp(iso: string, groepOfLocatie: string): string | null {
  const loc = groepOfLocatie in GROEP_LOCATIE ? GROEP_LOCATIE[groepOfLocatie] : groepOfLocatie
  for (const v of VAKANTIES) {
    if (iso < v.van || iso > v.tot) continue
    if (v.locatie === 'BEIDE' || v.locatie === loc) return v.naam
  }
  return null
}
