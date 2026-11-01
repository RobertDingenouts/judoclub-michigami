// Configureert club-side data voor toernooi-inschrijvingen.
// Elke toernooi-slug komt overeen met TournamentEntry.toernooi in de DB.
// De per-toernooi-velden sturen formulier, validatie én het exportformaat.

export type ExportFormat = 'shintai' | 'yoshikwai'

export interface ToernooiConfig {
  titel: string
  shintaiTitel: string         // kopregel in het exportformulier
  datum: string
  toernooidatumISO: string     // voor leeftijd-bepaling en prefill
  leeftijdDatumLabel: string   // label in formulier, bijv. "13-12-2026"
  deadlineLeden: string        // interne deadline (via Michigami)
  deadlineShintai: string      // uiterste inleverdatum bij de organisator (nooit tonen aan leden)
  inschrijfgeld: number        // € per judoka
  organisator: string
  locatie: string
  iban: string                 // clubrekening voor inschrijfgeld (leeg = regel verbergen)
  betalingskenmerk: string     // wat leden bij de overschrijving moeten vermelden
  contact: { naam: string; telefoon: string; email: string }
  exportFormat: ExportFormat
  vraagGeboortedatum?: boolean // Yoshi-Kwai: geboortedatum i.p.v. leeftijd
  niveauOpties?: Record<string, string> // standaard NIVEAUS
  infoRegels: string[]         // 📋-lijst boven het formulier; {bedrag} wordt ingevuld
  waarschuwing?: string        // ⚠️-blok boven het formulier (bijv. afgelingsrisico)
  verplichtBetalingBijInschrijving?: boolean // true = betaald-vinkje verplicht vóór verzenden
}

export const TOERNOOIEN: Record<string, ToernooiConfig> = {
  'kersttoernooi-shintai-2026': {
    titel: 'Kersttoernooi Sportschool Shintai',
    shintaiTitel: 'SHINTAI KERST TOERNOOI - 13 DECEMBER 2026',
    datum: 'zondag 13 december 2026',
    toernooidatumISO: '2026-12-13',
    leeftijdDatumLabel: '13-12-2026',
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
    exportFormat: 'shintai',
    verplichtBetalingBijInschrijving: true,
    infoRegels: [
      '🥇 Recreatief toernooi voor alle leeftijden vanaf 6 jaar — iedereen krijgt een prijs en oorkonde',
      '⚖️ Start 09.40 uur, eerste weging 9.00–9.15 uur (jongsten eerst). Weegtijden komen ~1,5 week van tevoren.',
      '💶 Inschrijfgeld € {bedrag} per judoka — DIRECT overmaken bij inschrijving, naar Judoclub Michigami.',
      '👨‍👩‍👧 Ouders/familie zijn welkom als toeschouwer (€ 1,00 entree voor volwassenen, kinderen gratis)',
    ],
  },

  'pre-tornooi-yoshikwai-2027': {
    titel: 'Pre-tornooi JC. Yoshi-Kwai',
    shintaiTitel: 'PRE-TORNOOI JC. YOSHI-KWAI - 21 FEBRUARI 2027',
    datum: 'zondag 21 februari 2027',
    toernooidatumISO: '2027-02-21',
    leeftijdDatumLabel: '21-02-2027',
    deadlineLeden: 'zondag 31 januari 2027',
    deadlineShintai: 'zondag 7 februari 2027',
    inschrijfgeld: 6,
    organisator: 'JC. Yoshi-Kwai',
    locatie: 'Sporthal Luisbekelaar, Luisbekelaar z/n, 2140 Borgerhout (Antwerpen)',
    iban: '',
    betalingskenmerk: 'naam judoka + Yoshi-Kwai pre-tornooi',
    contact: {
      naam: 'Robert Dingenouts',
      telefoon: '0648649912',
      email: 'judoclub_michigami@hotmail.com',
    },
    exportFormat: 'yoshikwai',
    verplichtBetalingBijInschrijving: true,
    vraagGeboortedatum: true,
    niveauOpties: {
      Pre: 'Pre-categorie — voor (bijna) nieuwe wedstrijdjudoka\'s: geen straffen, wél uitleg van de scheidsrechter',
      Gedreven: 'Gewone tornooiocategorie — voor judoka\'s met wat wedstrijdervaring',
    },
    infoRegels: [
      '🥋 Educatief tornooi: in de Pre-categorie worden geen straffen gegeven, wél uitleg; prijzen en medailles voor iedereen',
      '⚖️ De opgegeven uren zijn ALLEEN wegingstijden — de wedstrijden starten daarna (kampen kunnen uitlopen)',
      '🥎 Poules van maximaal 6, ingedeeld op geboortejaar, gewicht en niveau; meisjes kunnen bij jongens ingedeeld worden als er te weinig zijn',
      '💶 Inschrijfgeld € {bedrag} per judoka — DIRECT overmaken bij inschrijving, naar Judoclub Michigami.',
    ],
    waarschuwing: 'Vorig jaar ging dit toernooi niet door wegens te weinig deelnemers. Mocht het nu opnieuw afgelast worden, storten wij het betaalde bedrag volledig terug voor de ingeschreven deelnemers.',
  },
}

export const NIVEAUS: Record<string, string> = {
  A: 'wedstrijdjudoka (nationale toernooien en prijswinnaar op district kampioenschap)',
  B: 'regio wedstrijden (en valt regelmatig in de prijzen)',
  C: 'enkel club wedstrijden / clubkampioenschappen',
  D: 'geen wedstrijd ervaring',
}

export const BANDEN = ['Wit', 'Geel', 'Oranje', 'Groen', 'Blauw', 'Bruin', 'Zwart'] as const

export function niveauOptiesVoor(slug: string): Record<string, string> {
  return TOERNOOIEN[slug]?.niveauOpties ?? NIVEAUS
}

// Eerste token = voornaam, de rest = familienaam (Yoshi-Kwai werkt met
// gesplitste naamvelden; een admin kan de naam altijd corrigeren).
export function splitNaam(naam: string): { voornaam: string; familienaam: string } {
  const delen = naam.trim().split(/\s+/)
  if (delen.length < 2) return { voornaam: naam.trim(), familienaam: '' }
  return { voornaam: delen[0], familienaam: delen.slice(1).join(' ') }
}

export function isoNaarDmYyyy(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return ''
  const [j, m, d] = iso.split('-')
  return `${d}-${m}-${j}`
}
