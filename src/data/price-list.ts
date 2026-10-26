// Ledervriendelijke prijslijst judomateriaal.
// Bron: OneDrive "1. Michigami administratie/2026/inventaris 2026.xlsx" (Pascal),
// tabbladen "verkooplijst pakken" + "Voorraad" (kolom "Verkoop verenigings prijs").
// BEWUST NIET opgenomen: inkoopprijzen en winst — alleen bestuur, nooit naar leden.
// Clubprijzen = afgeronde whole-euro bedragen uit het voorraadblad (incl. btw).

export interface PriceRow {
  maat: number;        // lengtemaat in cm
  web: number;         // webprijs Matsuru (internet), incl. btw
  club: number;        // clubprijs voor leden, incl. btw
}

export interface PriceProduct {
  id: string;
  photo: string;     // productfoto uit inventaris 2026.xlsx (tab verkooplijst pakken)
  // NL bronteksten; EN-vertalingen staan in src/i18n/registry.ts (NL-key → EN)
  name: string;
  desc: string;
  rows: PriceRow[];
}

export const CLUB_PRICE_META = {
  // Budo band: over alle kleuren/maten gelijke clubprijs (Voorraad-blad)
  bandWebPrijs: 8.25,
  bandClubPrijs: 7.5,
  bandLengtes: '150–330',
  bandFoto: '/data/materiaal/banden.jpg',
  geldigVanaf: 'oktober 2026',
} as const;

export const PRICE_PRODUCTS: PriceProduct[] = [
  {
    id: 'juvo',
    photo: '/data/materiaal/juvo-wit.jpg',
    name: 'Matsuru Juvo Judopak',
    desc: 'Onze aanrader voor beginnende leden. Stevig gewafeld katoen, geschikt om vast aan te grijpen en aan te trekken.',
    rows: [
      { maat: 100, web: 42.55, club: 38 },
      { maat: 110, web: 45.9, club: 41 },
      { maat: 120, web: 48.85, club: 44 },
      { maat: 130, web: 49.75, club: 45 },
      { maat: 140, web: 53.45, club: 48 },
      { maat: 150, web: 55.5, club: 50 },
      { maat: 160, web: 58.15, club: 52 },
      { maat: 170, web: 63.05, club: 57 },
      { maat: 180, web: 64.8, club: 58 },
    ],
  },
  {
    id: 'semi-geborduurd',
    photo: '/data/materiaal/semi-wit-geborduurd.jpg',
    name: 'Semi wedstrijdpak — wit, geborduurd',
    desc: 'Zwaardere kwaliteit, voor de iets fanatiekere judoka.',
    rows: [
      { maat: 140, web: 119.7, club: 102 },
      { maat: 145, web: 125.0, club: 106 },
      { maat: 150, web: 130.45, club: 111 },
      { maat: 155, web: 137.95, club: 117 },
      { maat: 160, web: 145.5, club: 124 },
      { maat: 165, web: 149.6, club: 127 },
      { maat: 170, web: 153.8, club: 131 },
      { maat: 175, web: 160.45, club: 136 },
      { maat: 180, web: 167.2, club: 142 },
      { maat: 185, web: 175.05, club: 149 },
      { maat: 190, web: 182.75, club: 155 },
      { maat: 195, web: 186.3, club: 158 },
      { maat: 200, web: 189.9, club: 161 },
      { maat: 210, web: 197.4, club: 168 },
    ],
  },
  {
    id: 'semi-blauw',
    photo: '/data/materiaal/semi-blauw.jpg',
    name: 'Semi wedstrijdpak — blauw',
    desc: 'Zwaardere kwaliteit, voor de iets fanatiekere judoka.',
    rows: [
      { maat: 140, web: 156.4, club: 133 },
      { maat: 150, web: 170.2, club: 145 },
      { maat: 155, web: 180.25, club: 153 },
      { maat: 160, web: 190.0, club: 162 },
      { maat: 165, web: 195.45, club: 166 },
      { maat: 170, web: 201.0, club: 171 },
      { maat: 175, web: 209.5, club: 178 },
      { maat: 180, web: 218.15, club: 185 },
      { maat: 185, web: 228.45, club: 194 },
      { maat: 190, web: 238.55, club: 203 },
      { maat: 195, web: 243.4, club: 207 },
      { maat: 200, web: 247.95, club: 211 },
      { maat: 210, web: 257.6, club: 219 },
    ],
  },
];

export function fmtEuro(value: number): string {
  // NL-notatie: € 42,55 — hele bedragen zonder centen ruis (€ 38)
  return Number.isInteger(value)
    ? `\u20AC\u00A0${value}`
    : `\u20AC\u00A0${value.toFixed(2).replace('.', ',')}`;
}
