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
  specialBadge?: string; // optie voor gouden events; "50-jarig"-badge is alleen voor het jubileumtoernooi
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
  { compareDate: "2026-10-17", displayDate: "17 oktober", event: "Jubileumtoernooi OVJV", emoji: "champagne", eventSub: "50-jarig bestaan OVJV · 47e judotoernooi", details: "Recreatief toernooi voor alle leeftijden. Inschrijven uiterlijk 30 september.", location: "De Vossenkuil", locationSub: "Oud-Vossemeer", locationUrl: "https://www.google.com/maps/search/?api=1&query=Bou+Kooijmanstraat+48+4698+AM+Oud-Vossemeer", inschrijfUrl: "https://forms.cloud.microsoft/r/XZkMDrBVRk", inschrijfTekst: "Inschrijven", time: "09:00", special: true, specialBadge: "🎉 50-jarig!", eventInfo: { title: "Jubileumtoernooi OVJV", sections: [ { label: "Over het toernooi", lines: ["Recreatief breedtesporttoernooi — amateur-scheidsrechters, nadruk op sportiviteit en plezier.", "Locatie: Bou-Kooijmanstraat 48, 4698 AM Oud-Vossemeer"] }, { label: "Kosten & betaling", lines: ["€ 7,50 per judoka (inclusief 1 consumptie)", "Overmaken naar: NL81 RBRB 0939 7268 15 t.n.v. Judovereniging O.V.J.V.", "Vermeld: voornaam & achternaam judoka + jubileumtoernooi OVJV"] }, { label: "Aanwezigheid", lines: ["Iedereen om 09:00"] }, { label: "Inschrijven", lines: ["Uiterlijk 30 september", "Via het inschrijfformulier (knop rechts)"] } ] } },
  { compareDate: "2026-10-21", displayDate: "21 oktober", event: "Geen les (Oud-Vossemeer) i.v.m.", emoji: "ban", eventSub: "Herfstvakantie", details: "", location: "De Vossenkuil", time: "-", locationUrl: "https://www.google.com/maps/search/?api=1&query=Bou+Kooijmanstraat+48+4698+AM+Oud-Vossemeer" },
  { compareDate: "2026-11-04", displayDate: "4 november", event: "Geen les (Oud-Vossemeer) i.v.m.", emoji: "ban", eventSub: "Vogeltentoonstelling", details: "", location: "De Vossenkuil", time: "-", locationUrl: "https://www.google.com/maps/search/?api=1&query=Bou+Kooijmanstraat+48+4698+AM+Oud-Vossemeer" },
  { compareDate: "2026-11-08", displayDate: "8 november", event: "Lintjestoernooi", emoji: "medal", eventSub: "Budoschool Cor Schuurbiers", details: LINTJE_DETAILS, location: "Sporthal In de Roos", locationSub: "Roosendaal", locationUrl: "https://maps.app.goo.gl/7ZnFrSxadrgEiAhm6", inschrijfUrl: "https://budoschool-corschuurbiers.nl/3-3/", inschrijfTekst: "Inschrijven", time: "8.15-10.30", eventInfo: LINTJE_2026_INFO },
  { compareDate: "2026-11-27", displayDate: "27 november", event: "Clubtoernooi Tokyokai", emoji: "medal", eventSub: "Ronde 1 van 3 · puntentoernooi", details: "Puntentoernooi over drie wedstrijdbijeenkomsten in Oostkapelle; prijzen voor het totaalklassement worden na het derde toernooi uitgereikt.", location: "Sporthal Halve Maan", locationSub: "Oostkapelle", locationUrl: "https://maps.app.goo.gl/oTfxuwN4GCiMXXax7", inschrijfUrl: "https://judoclubmichigami.nl/toernooi/tokyokai-2026", inschrijfTekst: "Inschrijven (leden)", time: "-", special: true, eventInfo: { title: "Clubtoernooi Tokyokai", sections: [ { label: "Over het toernooi", lines: ["Clubtoernooi van Tokyokai in Oostkapelle, verspreid over drie wedstrijdbijeenkomsten. Per bijeenkomst verzamel je punten; na het derde toernooi worden de prijzen voor het totaalklassement uitgereikt.", "Iedereen is welkom om mee te doen — ook oudere judoka's, mits de organisator tegenstanders in hun categorie heeft; dat stemmen wij vooraf af met Tokyokai.", "Ronde 2 is medio maart 2027 en ronde 3 eind mei 2027 — de exacte data volgen nog.", "De tijden voor 27 november volgen nog — de jongste judoka's beginnen doorgaans als eerste."] }, { label: "Kosten & betaling", lines: ["€ 8,00 bijdrage per judoka voor alle 3 de toernooien, over te maken naar J.C. Michigami Steenbergen, NL13 RABO 0136 9125 08, o.v.v. naam judoka + 'Tokyokai clubtoernooi' — direct bij inschrijving; de club maakt het totaal bedrag in één keer over naar Tokyokai."] }, { label: "Aanwezigheid", lines: ["Weeg je judoka thuis en noteer het gewicht in kg — de organisator werkt met zelf gewogen judoka's en vraagt naast naam en geboortedatum ook gewicht, band en geslacht."] }, { label: "Inschrijven", lines: ["Via het Michigami-inschrijfformulier (knop rechts) t/m zondag 15 november.", "De clublijst gaat maandag 16 november naar de organisator, dus wees er op tijd bij"] } ] } },
  { compareDate: "2026-12-13", displayDate: "13 december", event: "Kersttoernooi Shintai", emoji: "medal", eventSub: "Sportschool Shintai · Halsteren", details: "Recreatief toernooi voor álle leeftijden (6+). Iedereen een prijs + oorkonde. Inschrijven via clubformulier t/m vrijdag 13 november.", location: "Sporthal de Kannebuis", locationSub: "Halsteren", locationUrl: "https://www.google.com/maps/search/?api=1&query=Poelekes+12+4661+LR+Halsteren", inschrijfUrl: "https://judoclubmichigami.nl/toernooi/kersttoernooi-2026", inschrijfTekst: "Inschrijven (leden)", time: "Start 09.40 (1e weging 9.00-9.15)", special: true, eventInfo: { title: "Kersttoernooi Shintai", sections: [ { label: "Over het toernooi", lines: ["Recreatief toernooi met poules van maximaal 6 judoka's, ingedeeld op leeftijd, gewicht en niveau. Geen JBN-toernooi — judobond-lidmaatschap is niet nodig.", "Iedereen gaat huis met een prijs en een oorkonde. Coachen langs de mat is niet toegestaan, begeleiding achter de jurytafels ook niet."] }, { label: "Kosten & betaling", lines: ["€ 15,00 inschrijfgeld per judoka, over te maken naar Judoclub Michigami, NL13 RABO 0136 9125 08, o.v.v. naam judoka + 'Shintai kersttoernooi' — direct bij inschrijving; de club maakt het totaal bedrag in één keer over naar Sportschool Shintai.", "Toeschouwers: entree € 1,00 voor volwassenen, kinderen gratis"] }, { label: "Aanwezigheid", lines: ["Toernooi start om 09.40 uur, jongste judoka's eerst. Eerste weging tussen 9.00 en 9.15 uur.", "Weegtijden worden ca. 1,5 week vooraf bekendgemaakt"] }, { label: "Inschrijven", lines: ["Via het Michigami-inschrijfformulier (knop rechts) t/m vrijdag 13 november.", "We geven de volledige clublijst in één keer door, dus wees er op tijd bij — vol is vol"] } ] } },
  { compareDate: "2026-12-18", displayDate: "18 december", event: "Geen lessen (Steenbergen) i.v.m.", emoji: "ban", eventSub: "Kerstvakantie", details: "", location: "De Knotwilg", time: "-", locationUrl: "https://www.google.com/maps/search/?api=1&query=Sportcentrum+De+Knotwilg+Wipstraat+2+4651+XW+Steenbergen" },
  { compareDate: "2026-12-23", displayDate: "23 december", event: "Geen les (Oud-Vossemeer) i.v.m.", emoji: "ban", eventSub: "Kerstvakantie", details: "", location: "De Vossenkuil", time: "-", locationUrl: "https://www.google.com/maps/search/?api=1&query=Bou+Kooijmanstraat+48+4698+AM+Oud-Vossemeer" },
  { compareDate: "2026-12-25", displayDate: "25 december", event: "Geen lessen (Steenbergen) i.v.m.", emoji: "ban", eventSub: "Kerstvakantie", details: "", location: "De Knotwilg", time: "-", locationUrl: "https://www.google.com/maps/search/?api=1&query=Sportcentrum+De+Knotwilg+Wipstraat+2+4651+XW+Steenbergen" },
  { compareDate: "2026-12-30", displayDate: "30 december", event: "Geen les (Oud-Vossemeer) i.v.m.", emoji: "ban", eventSub: "Kerstvakantie", details: "", location: "De Vossenkuil", time: "-", locationUrl: "https://www.google.com/maps/search/?api=1&query=Bou+Kooijmanstraat+48+4698+AM+Oud-Vossemeer" },
  { compareDate: "2027-01-10", displayDate: "10 januari 2027", event: "Lintjestoernooi", emoji: "medal", eventSub: "Budoschool Cor Schuurbiers", details: LINTJE_DETAILS, location: "Sporthal In de Roos", locationSub: "Roosendaal", locationUrl: "https://maps.app.goo.gl/7ZnFrSxadrgEiAhm6", inschrijfUrl: "https://budoschool-corschuurbiers.nl/3-3/", inschrijfTekst: "Inschrijven", time: "8.15-10.30", eventInfo: LINTJE_2027_INFO },
  { compareDate: "2027-02-21", displayDate: "21 februari 2027", event: "Pre-tornooi Yoshi-Kwai", emoji: "medal", eventSub: "JC. Yoshi-Kwai · Borgerhout (Antw.)", details: "Educatief recreatief tornooi voor alle leeftijden. Inschrijven via clubformulier t/m zondag 31 januari.", location: "Sporthal Luisbekelaar", locationSub: "Borgerhout (Antwerpen)", locationUrl: "https://www.google.com/maps/search/?api=1&query=Sporthal+Luisbekelaar+Borgerhout", inschrijfUrl: "https://judoclubmichigami.nl/toernooi/pre-tornooi-2027", inschrijfTekst: "Inschrijven (leden)", time: "Weging vanaf 08.45 per categorie", eventInfo: { title: "Pre-tornooi Yoshi-Kwai", sections: [
    { label: "Over het tornooi", lines: ["Educatief jeugdtoernooi in Borgerhout: in de Pre-categorie geen straffen, wél uitleg van de scheidsrechter. De leeftijdscategorie wordt bepaald door je geboortejaar.", "Poules van maximaal 6 judoka's; meisjes kunnen bij de jongens worden ingedeeld als er te weinig meisjes zijn.", "Vorig jaar ging dit toernooi niet door wegens te weinig deelnemers — bij afgelasting storten wij het inschrijfgeld volledig terug."] },
    { label: "Kosten & betaling", lines: ["€ 6,00 inschrijfgeld per judoka, over te maken naar Judoclub Michigami, NL13 RABO 0136 9125 08, o.v.v. naam judoka + 'Yoshi-Kwai pre-tornooi' — direct bij inschrijving; de club maakt het totaal bedrag in één keer over.", "Bij afgelast toernooi: volledige terugbetaling voor alle ingeschreven deelnemers."] },
    { label: "Aanwezigheid", lines: ["Alleen de opgegeven uren zijn wegingstijden — wedstrijden starten daarna en kampen kunnen uitlopen.", "Pre-tornooi 1+2 (6-10 jr): weging 08.45-09.15 · U9: 10.00-10.30 · U11: 11.30-12.00 · U13: 13.00-13.30 · U15/U18: 14.00-14.30 · U21/Seniors: 14.30-15.00"] },
    { label: "Inschrijven", lines: ["Via het Michigami-inschrijfformulier (knop rechts) t/m zondag 31 januari 2027.", "We geven de volledige clublijst in één keer door, dus wees er op tijd bij — vol is vol"] }
  ] } },
  { compareDate: "2027-03-14", displayDate: "14 maart 2027", event: "Lintjestoernooi", emoji: "medal", eventSub: "Budoschool Cor Schuurbiers", details: LINTJE_DETAILS, location: "Sporthal In de Roos", locationSub: "Roosendaal", locationUrl: "https://maps.app.goo.gl/7ZnFrSxadrgEiAhm6", inschrijfUrl: "https://budoschool-corschuurbiers.nl/3-3/", inschrijfTekst: "Inschrijven", time: "8.15-10.30", eventInfo: LINTJE_2027_INFO },
  { compareDate: "2027-04-11", displayDate: "11 april 2027", event: "Lintjestoernooi", emoji: "medal", eventSub: "Budoschool Cor Schuurbiers", details: LINTJE_DETAILS, location: "Sporthal In de Roos", locationSub: "Roosendaal", locationUrl: "https://maps.app.goo.gl/7ZnFrSxadrgEiAhm6", inschrijfUrl: "https://budoschool-corschuurbiers.nl/3-3/", inschrijfTekst: "Inschrijven", time: "8.15-10.30", eventInfo: LINTJE_2027_INFO },
  { compareDate: "2027-06-13", displayDate: "13 juni 2027", event: "Lintjestoernooi", emoji: "medal", eventSub: "Budoschool Cor Schuurbiers", details: LINTJE_DETAILS, location: "Sporthal In de Roos", locationSub: "Roosendaal", locationUrl: "https://maps.app.goo.gl/7ZnFrSxadrgEiAhm6", inschrijfUrl: "https://budoschool-corschuurbiers.nl/3-3/", inschrijfTekst: "Inschrijven", time: "8.15-10.30", eventInfo: LINTJE_2027_INFO },
  { compareDate: "2027-07-11", displayDate: "11 juli 2027", event: "Lintjestoernooi", emoji: "medal", eventSub: "Budoschool Cor Schuurbiers", details: LINTJE_DETAILS, location: "Sporthal In de Roos", locationSub: "Roosendaal", locationUrl: "https://maps.app.goo.gl/7ZnFrSxadrgEiAhm6", inschrijfUrl: "https://budoschool-corschuurbiers.nl/3-3/", inschrijfTekst: "Inschrijven", time: "8.15-10.30", eventInfo: LINTJE_2027_INFO },
].sort((a, b) => new Date(a.compareDate).getTime() - new Date(b.compareDate).getTime());
