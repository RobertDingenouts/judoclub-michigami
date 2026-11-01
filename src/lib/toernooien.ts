// Configuurclub-side data voor toernooi-inschrijvingen.
// Elke toernooi-slug komt overeen met TournamentEntry.toernooi in de DB.

export const TOERNOOIEN: Record<string, {
  titel: string
  shintaiTitel: string
  datum: string
  deadlineLeden: string      // interne deadline (via Michigami)
  deadlineShintai: string    // uiterste inleverdatum bij de organisator
  inschrijfgeld: number      // € per judoka
  organisator: string
  locatie: string
  iban: string             // clubrekening voor inschrijfgeld (leeg = regel verbergen)
  betalingskenmerk: string // wat leden bij de overschrijving moeten vermelden
  contact: { naam: string; telefoon: string; email: string }
}> = {
  'kersttoernooi-shintai-2026': {
    titel: 'Kersttoernooi Sportschool Shintai',
    shintaiTitel: 'SHINTAI KERST TOERNOOI - 13 DECEMBER 2026',
    datum: 'zondag 13 december 2026',
    deadlineLeden: 'vrijdag 13 november 2026',
    deadlineShintai: 'zondag 22 november 2026',
    inschrijfgeld: 15,
    organisator: 'Sportschool Shintai',
    locatie: 'Sporthal de Kannebuis, Poelekes 12, 4661 LR Halsteren',
    // Clubrekening waar leden het inschrijfgeld naartoe storten. Veld mag leeg
    // zijn (dan verschijnt de IBAN-regel niet); vóór livezetten controleren!
    iban: '',
    betalingskenmerk: 'naam judoka + Shintai kersttoernooi',
    contact: {
      naam: 'Robert Dingenouts',
      telefoon: '0648649912',
      email: 'judoclub_michigami@hotmail.com',
    },
  },
}

export const NIVEAUS: Record<string, string> = {
  A: 'wedstrijdjudoka (nationale toernooien en prijswinnaar op district kampioenschap)',
  B: 'regio wedstrijden (en valt regelmatig in de prijzen)',
  C: 'enkel club wedstrijden / clubkampioenschappen',
  D: 'geen wedstrijd ervaring',
}

export const BANDEN = ['Wit', 'Geel', 'Oranje', 'Groen', 'Blauw', 'Bruin', 'Zwart'] as const
