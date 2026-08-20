/**
 * Het verhaal van Judoclub Michigami — in vijf chronologische hoofdstukken.
 * Bron: de geverifieerde geschiedenis in club-info.ts (feiten gekruisd met
 * de tijdlijn-data en de club).
 */

export interface StoryChapter {
  kanji: string;
  number: string;
  title: string;
  era: string;
  paragraphs: string[];
}

export const storyChapters: StoryChapter[] = [
  {
    kanji: '師',
    number: '一',
    title: 'De leraar',
    era: 'jaren tachtig — 1993',
    paragraphs: [
      'Het verhaal begint bij een leraar. Koos van Wezel gaf in de jaren tachtig met grote passie judoles in Tholen, Roosendaal en Scherpenisse. Hij was leerling van Haku Michigami — dezelfde meester die ook Anton Geesink vormde. Die band met de traditie zou de club haar naam en haar ziel geven.',
      'In 1993 zette Koos die passie om in iets vasts: in Steenbergen richtte hij Judoclub Michigami op, als eerbetoon aan zijn leraar. Een kleine dojo, een handvol judoka’s, en de overtuiging dat judo meer is dan een sport: het is een manier van leven.',
    ],
  },
  {
    kanji: '光',
    number: '二',
    title: 'De gouden jaren',
    era: 'jaren ’90 — begin 2000',
    paragraphs: [
      'De jaren negentig en het begin van de jaren tweeduizend waren de bloeiperiode. De dojo was een bruisende plek waar judo als een tweede taal werd gesproken: twee trainingsgroepen op donderdag, drie op vrijdag. Koos gaf ook les in Nieuw-Vossemeer en Scherpenisse, en de club kreeg een breed fundament in de hele regio. Michigami was een van de grootste clubs van de regio.',
      'De wedstrijdgroep reisde elk jaar naar grote toernooien in Londen en Parijs. Elk jaar was de uitstap naar Pony Park Slagharen een hoogtepunt, waar judoka’s sparren mochten met topfiguren zoals Anton Geesink zelf. In die tijd stond de regio bol van judo — en Michigami was een van de motoren ervan.',
    ],
  },
  {
    kanji: '継',
    number: '三',
    title: 'De nieuwe generatie',
    era: '2005 — 2016',
    paragraphs: [
      'Tussen 2005 en 2010 veranderde het judolandschap: regionale clubs en toernooien verdwenen. Michigami hield vol en bleef doorgaan, door zich voort te durven te ontwikkelen: kata werd integraal onderdeel van de training, eigen technieken zorgvuldig gedocumenteerd.',
      'Rond 2010 brak een nieuwe fase aan. Robin Hack, Pascal Hack en Robert Dingenouts — al bijna vanaf de oprichting bij de club — begonnen naast hun eigen training ook les te geven, onder begeleiding van Koos. Op 5 juni 2010 slaagden ze allen voor de 1e Dan, in 2014 voor de 2e Dan en in 2016 voor de 3e Dan. Ook Wendy Jansen, die al bij Koos begon in Tholen in 1988, was een vaste waarde in de club — zij zou haar zwarte band in 2024 halen.',
    ],
  },
  {
    kanji: '合',
    number: '四',
    title: 'De vlam blijft branden',
    era: '2021 — 2024',
    paragraphs: [
      'In december 2021 overleed Koos van Wezel. De dojo hield adem, maar de geest hield stand: Robin, Pascal en Robert namen de volledige leiding over. Samen groeiden zij legio judoka’s groot en namen zij ze mee naar legio nationale en internationale toernooien — altijd met de zachte hand, en streng daar en waar het nodig was.',
      'Robin en Pascal gaven les in Oud-Vossemeer, een locatie die later vast bij de club zou horen. In 2024 groeide de dojo in Steenbergen uit met vernieuwde matten van 120 m² — vast opgeslagen, klaar voor de club en de verenigingen die de zaal delen.',
    ],
  },
  {
    kanji: '今',
    number: '五',
    title: 'Twee locaties, één club',
    era: '2026 — heden',
    paragraphs: [
      'In 2026 viert OVJV (Oud-Vossemeerse Judo Vereniging) haar 50-jarig jubileum — een mijlpaal die Michigami met trots meeviert. Het bestuur van OVJV verzocht Michigami om de vereniging over te nemen. 2026 is het overgangsjaar: in 2027 is de integratie voltooid, en stopt OVJV als zelfstandige vereniging. Vanaf dan: twee locaties, één club.',
      'Judoclub Michigami blijft een bloeiende plek waar judo voor iedereen toegankelijk is — van kleuters tot volwassenen, recreatief of competitief. Met een warme sfeer en een betrokken community kijkt de club met vertrouwen in de toekomst, klaar om nog vele generaties te inspireren met de zachte weg.',
    ],
  },
];