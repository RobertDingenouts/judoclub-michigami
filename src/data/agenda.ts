export interface EventInfoSection {
  label: string;
  lines: string[];
}

export interface AgendaItem {
  compareDate: string;
  displayDate: string;
  event: string;
  emoji: string;
  eventSub?: string;
  details?: string;
  location: string;
  locationSub?: string;
  locationUrl?: string;
  time: string;
  inschrijfUrl?: string;
  inschrijfTekst?: string;
  cancelled?: boolean;
  special?: boolean;
  weegtijden?: Array<{ time: string; age: string }>;
  weegtijdTitel?: string;
  eventInfo?: { title?: string; sections: EventInfoSection[] };
}

const LINTJE_2026_INFO = {
  title: "Lintjestoernooi",
  sections: [
    {
      label: "Over het toernooi",
      lines: [
        "Alleen voor beginnende judoka's die wedstrijdervaring op willen doen (géén wedstrijdjudoka's).",
        "Georganiseerd door Budoschool Cor Schuurbiers, zo'n 1 keer per maand.",
        "Er wordt te allen tijde geprobeerd iedereen 4 wedstrijden te laten judoën.",
      ],
    },
    {
      label: "Weeg- & wedstrijdtijden",
      lines: [
        "Weegtijd 8.15-8.30 uur (4 t/m 16 jaar)",
        "Wees kwartier vóór aanvang van de weging aanwezig",
        "Wedstrijden beginnen ca. 8.30-8.45 uur",
      ],
    },
    {
      label: "Punten & beloningen",
      lines: [
        "Verlies 2 · gelijk 3 · aangewezen winnaar 4 · yuko 5 · wazari 6 · ippon 7",
        "Vaantjes: 40 geel · 80 oranje · 120 groen · 160 blauw · 200 bruin · 240 zwart",
        "Medailles: 300 brons · 360 zilver · 420 goud · 600 punten = beker",
      ],
    },
    {
      label: "Kosten & inschrijving",
      lines: [
        "€ 8,50 per deelnemer, contant te betalen bij het wegen in de zaal",
        "Digitaal invullen via de inschrijflink (knop Inschrijven)",
      ],
    },
  ],
};

// 2027-edities: zelfde opzet, maar toernooi start 8.15 i.p.v. 8.00
const LINTJE_2027_INFO = {
  ...LINTJE_2026_INFO,
  sections: [
    {
      label: "Over het toernooi",
      lines: [
        "Alleen voor beginnende judoka's die wedstrijdervaring op willen doen (géén wedstrijdjudoka's).",
        "Georganiseerd door Budoschool Cor Schuurbiers, zo'n 1 keer per maand.",
        "Er wordt te allen tijde geprobeerd iedereen 4 wedstrijden te laten judoën.",
      ],
    },
    {
      label: "Weeg- & wedstrijdtijden",
      lines: [
        "Weegtijd 8.15-8.30 uur (4 t/m 16 jaar)",
        "Wees kwartier vóór aanvang van de weging aanwezig",
      ],
    },
    {
      label: "Punten & beloningen",
      lines: [
        "Verlies 2 · gelijk 3 · aangewezen winnaar 4 · yuko 5 · wazari 6 · ippon 7",
        "Vaantjes: 40 geel · 80 oranje · 120 groen · 160 blauw · 200 bruin · 240 zwart",
        "Medailles: 300 brons · 360 zilver · 420 goud · 600 punten = beker",
      ],
    },
    {
      label: "Kosten & inschrijving",
      lines: [
        "€ 8,50 per deelnemer, contant te betalen bij het wegen in de zaal",
        "Digitaal invullen via de inschrijflink (knop Inschrijven)",
      ],
    },
  ],
};

const LINTJE_DETAILS = "Beginnende Judoka's t/m 16 jaar · Toernooikosten € 8,50 (contant, te betalen bij het wegen)";

export const agendaItems: AgendaItem[] = [
  { compareDate: "2026-01-02", displayDate: "2 januari", event: "Geen les i.v.m.", emoji: "ban", eventSub: "Kerstvakantie", details: "", location: "-", time: "-" },
  { compareDate: "2026-01-09", displayDate: "9 januari", event: "Les - AFGELAST", emoji: "xmark", eventSub: "i.v.m. weersomstandigheden", details: "Gladheid, regen, vorst en sneeuw.", location: "-", time: "-", cancelled: true },
  { compareDate: "2026-01-11", displayDate: "11 januari", event: "Lintjestoernooi - AFGELAST", emoji: "xmark", eventSub: "Budoschool Cor Schuurbiers", details: "Afgelast i.v.m. weersomstandigheden.", location: "Sporthal In de Roos", locationSub: "Roosendaal", time: "8.00-11.00", cancelled: true },
  { compareDate: "2026-02-08", displayDate: "8 februari", event: "Lintjestoernooi", emoji: "medal", eventSub: "Budoschool Cor Schuurbiers", details: "Beginnende Judoka's t/m 16 jaar", location: "Sporthal In de Roos", locationSub: "Roosendaal", locationUrl: "https://maps.app.goo.gl/7ZnFrSxadrgEiAhm6", inschrijfUrl: "https://budoschool-corschuurbiers.nl/3-3/", inschrijfTekst: "Inschrijven", time: "8.00-11.00" },
  { compareDate: "2026-02-20", displayDate: "20 februari", event: "Geen lessen i.v.m.", emoji: "ban", eventSub: "Carnavalsvakantie", details: "", location: "-", time: "-" },
  { compareDate: "2026-03-08", displayDate: "8 maart", event: "Lintjestoernooi", emoji: "medal", eventSub: "Budoschool Cor Schuurbiers", details: "Beginnende Judoka's t/m 16 jaar", location: "Sporthal In de Roos", locationSub: "Roosendaal", locationUrl: "https://maps.app.goo.gl/7ZnFrSxadrgEiAhm6", inschrijfUrl: "https://budoschool-corschuurbiers.nl/3-3/", inschrijfTekst: "Inschrijven", time: "8.00-11.00" },
  { compareDate: "2026-03-20", displayDate: "20 maart", event: "Puntentoernooi Oostkapelle", emoji: "medal", details: "t/m 12 jaar", location: "Halve Maan", locationSub: "Oostkapelle", locationUrl: "https://maps.google.com/?q=Sporthal+de+Halve+Maan+Oostkapelle", time: "16.30" },
  { compareDate: "2026-04-03", displayDate: "3 april", event: "Geen lessen i.v.m.", emoji: "ban", eventSub: "Goede Vrijdag", details: "", location: "-", time: "-" },
  { compareDate: "2026-04-12", displayDate: "12 april", event: "Lintjestoernooi", emoji: "medal", eventSub: "Budoschool Cor Schuurbiers", details: "Beginnende Judoka's t/m 16 jaar", location: "Sporthal In de Roos", locationSub: "Roosendaal", locationUrl: "https://maps.app.goo.gl/7ZnFrSxadrgEiAhm6", inschrijfUrl: "https://budoschool-corschuurbiers.nl/3-3/", inschrijfTekst: "Inschrijven", time: "8.00-11.00" },
  { compareDate: "2026-04-22", displayDate: "22 april", event: "Geen les (Oud-Vossemeer) i.v.m.", emoji: "ban", eventSub: "Meivakantie", details: "", location: "De Vossenkuil", time: "-", locationUrl: "https://www.google.com/maps/search/?api=1&query=Bou+Kooijmanstraat+48+4698+AM+Oud-Vossemeer" },
  { compareDate: "2026-04-24", displayDate: "24 april", event: "Geen les (Steenbergen) i.v.m.", emoji: "ban", eventSub: "Meivakantie", details: "", location: "De Knotwilg", time: "-", locationUrl: "https://www.google.com/maps/search/?api=1&query=Sportcentrum+De+Knotwilg+Wipstraat+2+4651+XW+Steenbergen" },
  { compareDate: "2026-04-29", displayDate: "29 april", event: "Geen les (Oud-Vossemeer) i.v.m.", emoji: "ban", eventSub: "Meivakantie", details: "", location: "De Vossenkuil", time: "-", locationUrl: "https://www.google.com/maps/search/?api=1&query=Bou+Kooijmanstraat+48+4698+AM+Oud-Vossemeer" },
  { compareDate: "2026-05-01", displayDate: "1 mei", event: "Geen les (Steenbergen) i.v.m.", emoji: "ban", eventSub: "Meivakantie", details: "", location: "De Knotwilg", time: "-", locationUrl: "https://www.google.com/maps/search/?api=1&query=Sportcentrum+De+Knotwilg+Wipstraat+2+4651+XW+Steenbergen" },
  { compareDate: "2026-05-06", displayDate: "6 mei", event: "Geanulleerde Les Oud-Vossemeer", emoji: "xmark", eventSub: "Zaal niet beschikbaar", details: "De zaal is helaas niet beschikbaar.", location: "Oud-Vossemeer", time: "-", cancelled: true },
  { compareDate: "2026-05-09", displayDate: "9 mei", event: "Zomertoernooi Halsteren", emoji: "medal", eventSub: "Sportschool Shintai", details: "Alle leeftijden vanaf 6 jaar. Elke deelnemer een 3D-medaille! Inschrijfgeld €15.", location: "De Kannebuis", locationSub: "Halsteren", locationUrl: "https://maps.app.goo.gl/7ZnFrSxadrgEiAhm6", time: "n.n.b." },
  { compareDate: "2026-05-10", displayDate: "10 mei", event: "Lintjestoernooi", emoji: "medal", eventSub: "Budoschool Cor Schuurbiers", details: "Beginnende Judoka's t/m 16 jaar", location: "Sporthal In de Roos", locationSub: "Roosendaal", locationUrl: "https://maps.app.goo.gl/7ZnFrSxadrgEiAhm6", inschrijfUrl: "https://budoschool-corschuurbiers.nl/3-3/", inschrijfTekst: "Inschrijven", time: "8.00-11.00" },
  { compareDate: "2026-05-13", displayDate: "13 mei", event: "Les Oud-Vossemeer", emoji: "medal", eventSub: "Gratis drankje na de les!", details: "Normale judoles.", location: "Oud-Vossemeer", time: "-" },
  { compareDate: "2026-05-29", displayDate: "29 mei", event: "Puntentoernooi Oostkapelle", emoji: "medal", details: "t/m 12 jaar", location: "Halve Maan", locationSub: "Oostkapelle", locationUrl: "https://maps.google.com/?q=Sporthal+de+Halve+Maan+Oostkapelle", time: "16.30" },
  { compareDate: "2026-06-13", displayDate: "13 juni", event: "Lustrumtoernooi Yoshi - GEANNULEERD", emoji: "xmark", eventSub: "Judoclub Yoshi", details: "Geannuleerd i.v.m. te weinig deelnemers. Inschrijfgeld €7 wordt terugbetaald.", location: "Sporthal De Kannebuis", locationSub: "Halsteren", locationUrl: "https://www.google.com/maps/search/?api=1&query=Poelekes+12+Halsteren", time: "10:00", cancelled: true },
  { compareDate: "2026-06-14", displayDate: "14 juni", event: "Lintjestoernooi", emoji: "medal", eventSub: "Budoschool Cor Schuurbiers", details: "Beginnende Judoka's t/m 16 jaar", location: "Sporthal In de Roos", locationSub: "Roosendaal", locationUrl: "https://maps.app.goo.gl/7ZnFrSxadrgEiAhm6", inschrijfUrl: "https://budoschool-corschuurbiers.nl/3-3/", inschrijfTekst: "Inschrijven", time: "8.00-11.00" },
  { compareDate: "2026-06-26", displayDate: "26 juni", event: "Les - AFGELAST", emoji: "xmark", eventSub: "i.v.m. extreme hitte (38°C)", details: "38 graden verwacht. Spanningsboog te laag door warmte, risico op oververhitting. Eenmalige afgelasting.", location: "-", time: "-", cancelled: true },
  { compareDate: "2026-07-10", displayDate: "10 juli t/m 21 aug", event: "Geen lessen (Steenbergen) i.v.m.", emoji: "ban", eventSub: "Zomervakantie", details: "", location: "De Knotwilg", time: "-", locationUrl: "https://www.google.com/maps/search/?api=1&query=Sportcentrum+De+Knotwilg+Wipstraat+2+4651+XW+Steenbergen" },
  { compareDate: "2026-07-08", displayDate: "8 jul t/m 19 aug", event: "Geen lessen (Oud-Vossemeer) i.v.m.", emoji: "ban", eventSub: "Zomervakantie", details: "", location: "De Vossenkuil", time: "-", locationUrl: "https://www.google.com/maps/search/?api=1&query=Bou+Kooijmanstraat+48+4698+AM+Oud-Vossemeer" },
  { compareDate: "2026-09-13", displayDate: "13 september", event: "Lintjestoernooi - AFGELAST", emoji: "xmark", eventSub: "Budoschool Cor Schuurbiers", details: "Afgelast i.v.m. zieken in de organisatie.", location: "Sporthal In de Roos", locationSub: "Roosendaal", time: "8.15-10.30", cancelled: true },
  { compareDate: "2026-10-11", displayDate: "11 oktober", event: "Lintjestoernooi", emoji: "medal", eventSub: "Budoschool Cor Schuurbiers", details: LINTJE_DETAILS, location: "Sporthal In de Roos", locationSub: "Roosendaal", locationUrl: "https://maps.app.goo.gl/7ZnFrSxadrgEiAhm6", inschrijfUrl: "https://budoschool-corschuurbiers.nl/3-3/", inschrijfTekst: "Inschrijven", time: "8.15-10.30", eventInfo: LINTJE_2026_INFO },
  { compareDate: "2026-10-16", displayDate: "16 okt & 23 okt", event: "Geen lessen (Steenbergen) i.v.m.", emoji: "ban", eventSub: "Herfstvakantie", details: "", location: "De Knotwilg", time: "-", locationUrl: "https://www.google.com/maps/search/?api=1&query=Sportcentrum+De+Knotwilg+Wipstraat+2+4651+XW+Steenbergen" },
  { compareDate: "2026-10-17", displayDate: "17 oktober", event: "Jubileumtoernooi OVJV", emoji: "champagne", eventSub: "50-jarig bestaan OVJV · 47e editie", details: "Recreatief toernooi voor alle leeftijden. Inschrijven uiterlijk 30 september.", location: "De Vossenkuil", locationSub: "Oud-Vossemeer", locationUrl: "https://www.google.com/maps/search/?api=1&query=Bou+Kooijmanstraat+48+4698+AM+Oud-Vossemeer", inschrijfUrl: "https://forms.cloud.microsoft/r/XZkMDrBVRk", inschrijfTekst: "Inschrijven", time: "09:00", special: true, eventInfo: { title: "Jubileumtoernooi OVJV", sections: [ { label: "Over het toernooi", lines: ["Recreatief breedtesporttoernooi — amateur-scheidsrechters, nadruk op sportiviteit en plezier.", "Locatie: Bou-Kooijmanstraat 48, 4698 AM Oud-Vossemeer"] }, { label: "Kosten & betaling", lines: ["€ 7,50 per judoka (inclusief 1 consumptie)", "Overmaken naar: NL81 RBRB 0939 7268 15 t.n.v. Judovereniging O.V.J.V.", "Vermeld: voornaam & achternaam judoka + jubileumtoernooi OVJV"] }, { label: "Aanwezigheid", lines: ["Iedereen om 09:00"] }, { label: "Inschrijven", lines: ["Uiterlijk 30 september", "Via het inschrijfformulier (knop rechts)"] } ] } },
  { compareDate: "2026-10-21", displayDate: "21 oktober", event: "Geen les (Oud-Vossemeer) i.v.m.", emoji: "ban", eventSub: "Herfstvakantie", details: "", location: "De Vossenkuil", time: "-", locationUrl: "https://www.google.com/maps/search/?api=1&query=Bou+Kooijmanstraat+48+4698+AM+Oud-Vossemeer" },
  { compareDate: "2026-11-04", displayDate: "4 november", event: "Geen les (Oud-Vossemeer) i.v.m.", emoji: "ban", eventSub: "Vogeltentoonstelling", details: "", location: "De Vossenkuil", time: "-", locationUrl: "https://www.google.com/maps/search/?api=1&query=Bou+Kooijmanstraat+48+4698+AM+Oud-Vossemeer" },
  { compareDate: "2026-11-08", displayDate: "8 november", event: "Lintjestoernooi", emoji: "medal", eventSub: "Budoschool Cor Schuurbiers", details: LINTJE_DETAILS, location: "Sporthal In de Roos", locationSub: "Roosendaal", locationUrl: "https://maps.app.goo.gl/7ZnFrSxadrgEiAhm6", inschrijfUrl: "https://budoschool-corschuurbiers.nl/3-3/", inschrijfTekst: "Inschrijven", time: "8.15-10.30", eventInfo: LINTJE_2026_INFO },
  { compareDate: "2026-12-18", displayDate: "18 december", event: "Geen lessen (Steenbergen) i.v.m.", emoji: "ban", eventSub: "Kerstvakantie", details: "", location: "De Knotwilg", time: "-", locationUrl: "https://www.google.com/maps/search/?api=1&query=Sportcentrum+De+Knotwilg+Wipstraat+2+4651+XW+Steenbergen" },
  { compareDate: "2026-12-23", displayDate: "23 december", event: "Geen les (Oud-Vossemeer) i.v.m.", emoji: "ban", eventSub: "Kerstvakantie", details: "", location: "De Vossenkuil", time: "-", locationUrl: "https://www.google.com/maps/search/?api=1&query=Bou+Kooijmanstraat+48+4698+AM+Oud-Vossemeer" },
  { compareDate: "2026-12-25", displayDate: "25 december", event: "Geen lessen (Steenbergen) i.v.m.", emoji: "ban", eventSub: "Kerstvakantie", details: "", location: "De Knotwilg", time: "-", locationUrl: "https://www.google.com/maps/search/?api=1&query=Sportcentrum+De+Knotwilg+Wipstraat+2+4651+XW+Steenbergen" },
  { compareDate: "2026-12-30", displayDate: "30 december", event: "Geen les (Oud-Vossemeer) i.v.m.", emoji: "ban", eventSub: "Kerstvakantie", details: "", location: "De Vossenkuil", time: "-", locationUrl: "https://www.google.com/maps/search/?api=1&query=Bou+Kooijmanstraat+48+4698+AM+Oud-Vossemeer" },
  { compareDate: "2027-01-10", displayDate: "10 januari 2027", event: "Lintjestoernooi", emoji: "medal", eventSub: "Budoschool Cor Schuurbiers", details: LINTJE_DETAILS, location: "Sporthal In de Roos", locationSub: "Roosendaal", locationUrl: "https://maps.app.goo.gl/7ZnFrSxadrgEiAhm6", inschrijfUrl: "https://budoschool-corschuurbiers.nl/3-3/", inschrijfTekst: "Inschrijven", time: "8.15-10.30", eventInfo: LINTJE_2027_INFO },
  { compareDate: "2027-03-14", displayDate: "14 maart 2027", event: "Lintjestoernooi", emoji: "medal", eventSub: "Budoschool Cor Schuurbiers", details: LINTJE_DETAILS, location: "Sporthal In de Roos", locationSub: "Roosendaal", locationUrl: "https://maps.app.goo.gl/7ZnFrSxadrgEiAhm6", inschrijfUrl: "https://budoschool-corschuurbiers.nl/3-3/", inschrijfTekst: "Inschrijven", time: "8.15-10.30", eventInfo: LINTJE_2027_INFO },
  { compareDate: "2027-04-11", displayDate: "11 april 2027", event: "Lintjestoernooi", emoji: "medal", eventSub: "Budoschool Cor Schuurbiers", details: LINTJE_DETAILS, location: "Sporthal In de Roos", locationSub: "Roosendaal", locationUrl: "https://maps.app.goo.gl/7ZnFrSxadrgEiAhm6", inschrijfUrl: "https://budoschool-corschuurbiers.nl/3-3/", inschrijfTekst: "Inschrijven", time: "8.15-10.30", eventInfo: LINTJE_2027_INFO },
  { compareDate: "2027-06-13", displayDate: "13 juni 2027", event: "Lintjestoernooi", emoji: "medal", eventSub: "Budoschool Cor Schuurbiers", details: LINTJE_DETAILS, location: "Sporthal In de Roos", locationSub: "Roosendaal", locationUrl: "https://maps.app.goo.gl/7ZnFrSxadrgEiAhm6", inschrijfUrl: "https://budoschool-corschuurbiers.nl/3-3/", inschrijfTekst: "Inschrijven", time: "8.15-10.30", eventInfo: LINTJE_2027_INFO },
  { compareDate: "2027-07-11", displayDate: "11 juli 2027", event: "Lintjestoernooi", emoji: "medal", eventSub: "Budoschool Cor Schuurbiers", details: LINTJE_DETAILS, location: "Sporthal In de Roos", locationSub: "Roosendaal", locationUrl: "https://maps.app.goo.gl/7ZnFrSxadrgEiAhm6", inschrijfUrl: "https://budoschool-corschuurbiers.nl/3-3/", inschrijfTekst: "Inschrijven", time: "8.15-10.30", eventInfo: LINTJE_2027_INFO },
].sort((a, b) => new Date(a.compareDate).getTime() - new Date(b.compareDate).getTime());
