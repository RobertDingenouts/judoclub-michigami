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
}

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
  { compareDate: "2026-04-22", displayDate: "22 april", event: "Geen les (Oud-Vossemeer) i.v.m.", emoji: "ban", eventSub: "Meivakantie", details: "", location: "De Vossenkuil", time: "-", locationUrl: "https://maps.google.com/?q=De+Vossenkuil+Oud-Vossemeer" },
  { compareDate: "2026-04-24", displayDate: "24 april", event: "Geen les (Steenbergen) i.v.m.", emoji: "ban", eventSub: "Meivakantie", details: "", location: "De Knotwilg", time: "-", locationUrl: "https://maps.app.goo.gl/Wipstraat+2+Steenbergen" },
  { compareDate: "2026-04-29", displayDate: "29 april", event: "Geen les (Oud-Vossemeer) i.v.m.", emoji: "ban", eventSub: "Meivakantie", details: "", location: "De Vossenkuil", time: "-", locationUrl: "https://maps.google.com/?q=De+Vossenkuil+Oud-Vossemeer" },
  { compareDate: "2026-05-01", displayDate: "1 mei", event: "Geen les (Steenbergen) i.v.m.", emoji: "ban", eventSub: "Meivakantie", details: "", location: "De Knotwilg", time: "-", locationUrl: "https://maps.app.goo.gl/Wipstraat+2+Steenbergen" },
  { compareDate: "2026-05-06", displayDate: "6 mei", event: "Geanulleerde Les Oud-Vossemeer", emoji: "xmark", eventSub: "Zaal niet beschikbaar", details: "De zaal is helaas niet beschikbaar.", location: "Oud-Vossemeer", time: "-", cancelled: true },
  { compareDate: "2026-05-09", displayDate: "9 mei", event: "Zomertoernooi Halsteren", emoji: "medal", eventSub: "Sportschool Shintai", details: "Alle leeftijden vanaf 6 jaar. Elke deelnemer een 3D-medaille! Inschrijfgeld €15.", location: "De Kannebuis", locationSub: "Halsteren", locationUrl: "https://maps.app.goo.gl/7ZnFrSxadrgEiAhm6", time: "n.n.b." },
  { compareDate: "2026-05-10", displayDate: "10 mei", event: "Lintjestoernooi", emoji: "medal", eventSub: "Budoschool Cor Schuurbiers", details: "Beginnende Judoka's t/m 16 jaar", location: "Sporthal In de Roos", locationSub: "Roosendaal", locationUrl: "https://maps.app.goo.gl/7ZnFrSxadrgEiAhm6", inschrijfUrl: "https://budoschool-corschuurbiers.nl/3-3/", inschrijfTekst: "Inschrijven", time: "8.00-11.00" },
  { compareDate: "2026-05-13", displayDate: "13 mei", event: "Les Oud-Vossemeer", emoji: "medal", eventSub: "Gratis drankje na de les!", details: "Normale judoles.", location: "Oud-Vossemeer", time: "-" },
  { compareDate: "2026-05-29", displayDate: "29 mei", event: "Puntentoernooi Oostkapelle", emoji: "medal", details: "t/m 12 jaar", location: "Halve Maan", locationSub: "Oostkapelle", locationUrl: "https://maps.google.com/?q=Sporthal+de+Halve+Maan+Oostkapelle", time: "16.30" },
  { compareDate: "2026-06-13", displayDate: "13 juni", event: "Lustrumtoernooi Yoshi", emoji: "medal", eventSub: "Judoclub Yoshi", details: "Sporthal De Kannebuis, Halsteren. Opening 10:00 uur. Weegtijden: 6-7jr 09:30-09:45 | 8-9jr 09:30-09:45 | 10-11jr 11:00-11:15 | 12-13jr 12:30-12:45 | 14-17jr 13:30-13:45 | 18+ 13:30-13:45. Inschrijfgeld €7. Uiterlijk ingeschreven 31 mei.", location: "Sporthal De Kannebuis", locationSub: "Halsteren", locationUrl: "https://maps.app.goo.gl/?q=Poelekes+12+Halsteren", time: "10:00", inschrijfUrl: "https://forms.office.com/r/dxYPDhJLcs", inschrijfTekst: "Inschrijven" },
  { compareDate: "2026-06-14", displayDate: "14 juni", event: "Lintjestoernooi", emoji: "medal", eventSub: "Budoschool Cor Schuurbiers", details: "Beginnende Judoka's t/m 16 jaar", location: "Sporthal In de Roos", locationSub: "Roosendaal", locationUrl: "https://maps.app.goo.gl/7ZnFrSxadrgEiAhm6", inschrijfUrl: "https://budoschool-corschuurbiers.nl/3-3/", inschrijfTekst: "Inschrijven", time: "8.00-11.00" },
  { compareDate: "2026-07-10", displayDate: "10 juli t/m 21 aug", event: "Geen lessen (Steenbergen) i.v.m.", emoji: "ban", eventSub: "Zomervakantie", details: "", location: "De Knotwilg", time: "-", locationUrl: "https://maps.app.goo.gl/Wipstraat+2+Steenbergen" },
  { compareDate: "2026-07-15", displayDate: "15 jul t/m 19 aug", event: "Geen lessen (Oud-Vossemeer) i.v.m.", emoji: "ban", eventSub: "Zomervakantie", details: "", location: "De Vossenkuil", time: "-", locationUrl: "https://maps.google.com/?q=De+Vossenkuil+Oud-Vossemeer" },
  { compareDate: "2026-10-16", displayDate: "16 okt & 23 okt", event: "Geen lessen (Steenbergen) i.v.m.", emoji: "ban", eventSub: "Herfstvakantie", details: "", location: "De Knotwilg", time: "-", locationUrl: "https://maps.app.goo.gl/Wipstraat+2+Steenbergen" },
  { compareDate: "2026-10-17", displayDate: "17 oktober", event: "Jubileumtoernooi OVJV", emoji: "champagne", eventSub: "50-jarig bestaan OVJV", details: "Datum onder voorbehoud.", location: "De Vossenkuil", locationSub: "Oud-Vossemeer", locationUrl: "https://maps.google.com/?q=De+Vossenkuil+Oud-Vossemeer", time: "n.n.b." },
  { compareDate: "2026-10-21", displayDate: "21 oktober", event: "Geen les (Oud-Vossemeer) i.v.m.", emoji: "ban", eventSub: "Herfstvakantie", details: "", location: "De Vossenkuil", time: "-", locationUrl: "https://maps.google.com/?q=De+Vossenkuil+Oud-Vossemeer" },
  { compareDate: "2026-11-04", displayDate: "4 november", event: "Geen les (Oud-Vossemeer) i.v.m.", emoji: "ban", eventSub: "Dankdag", details: "", location: "De Vossenkuil", time: "-", locationUrl: "https://maps.google.com/?q=De+Vossenkuil+Oud-Vossemeer" },
  { compareDate: "2026-12-18", displayDate: "18 december", event: "Geen lessen (Steenbergen) i.v.m.", emoji: "ban", eventSub: "Kerstvakantie", details: "", location: "De Knotwilg", time: "-", locationUrl: "https://maps.app.goo.gl/Wipstraat+2+Steenbergen" },
  { compareDate: "2026-12-23", displayDate: "23 december", event: "Geen les (Oud-Vossemeer) i.v.m.", emoji: "ban", eventSub: "Kerstvakantie", details: "", location: "De Vossenkuil", time: "-", locationUrl: "https://maps.google.com/?q=De+Vossenkuil+Oud-Vossemeer" },
  { compareDate: "2026-12-25", displayDate: "25 december", event: "Geen lessen (Steenbergen) i.v.m.", emoji: "ban", eventSub: "Kerstvakantie", details: "", location: "De Knotwilg", time: "-", locationUrl: "https://maps.app.goo.gl/Wipstraat+2+Steenbergen" },
  { compareDate: "2026-12-30", displayDate: "30 december", event: "Geen les (Oud-Vossemeer) i.v.m.", emoji: "ban", eventSub: "Kerstvakantie", details: "", location: "De Vossenkuil", time: "-", locationUrl: "https://maps.google.com/?q=De+Vossenkuil+Oud-Vossemeer" },
].sort((a, b) => new Date(a.compareDate).getTime() - new Date(b.compareDate).getTime());
