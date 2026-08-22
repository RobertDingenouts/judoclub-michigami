/**
 * Het verhaal van Judoclub Michigami — in zeven chronologische hoofdstukken.
 * Bron: de geverifieerde geschiedenis in club-info.ts (feiten gekruisd met
 * de tijdlijn-data en de club).
 */

export interface StoryChapter {
  kanji: string;
  number: string;
  title: string;
  era: string;
  paragraphs: string[];
  photoUrl?: string;
  photoCaption?: string;
  photoAspect?: string;
}

export const storyChapters: StoryChapter[] = [
  {
    kanji: '師',
    number: '一',
    title: 'De leraar',
    era: 'jaren tachtig — 1993',
    paragraphs: [
      'Het verhaal begint bij een leraar. Koos van Wezel gaf in de jaren tachtig met grote passie judoles in Tholen, Roosendaal en Scherpenisse. Hij was leerling van Haku Michigami — dezelfde meester die ook Anton Geesink vormde. Die band met de traditie zou de club haar naam en haar ziel geven.',
      'In 1993 zette Koos die passie om in iets vasts: samen met zijn zoon Erwin van Wezel en Marinus Smout richtte hij Judoclub Michigami op — officieel gevestigd te Nieuw-Vossemeer, met de dojo in Sportcentrum De Knotwilg in Steenbergen, als eerbetoon aan zijn leraar. Een kleine dojo, een handvol judoka’s, en de overtuiging dat judo meer is dan een sport: het is een manier van leven.',
    ],
  },
  {
    kanji: '光',
    number: '二',
    title: 'De gouden jaren',
    era: 'jaren ’90 — 2010',
    paragraphs: [
      'De jaren negentig en de jaren tweeduizend waren de bloeiperiode. De dojo was een bruisende plek waar judo als een tweede taal werd gesproken: twee trainingsgroepen op donderdag, drie op vrijdag. Koos gaf ook les in Nieuw-Vossemeer en Scherpenisse, en de club kreeg een breed fundament in de hele regio. Michigami was een van de grootste clubs van de regio — en bleef dat ook in de jaren tweeduizend.',
      'De vereniging leefde ook buiten de mat. Koos’ zoon Erwin was in die jaren zelf actief en gaf weleens les, zijn vrouw Els steunde de club altijd, en dochter Jolanda was een vaste waarde. Jolanda trouwde met Franco Hack — samen kregen zij drie zoons, waaronder de tweeling Robin en Pascal. Beide jongens stonden al als kind op de mat, en zouden later het bestuursorgaan en trainers van Michigami worden.',
      'De wedstrijdgroep reisde elk jaar naar grote toernooien in Londen en Parijs. Elk jaar was de uitstap naar Pony Park Slagharen een hoogtepunt, waar judoka’s sparren mochten met topfiguren zoals Anton Geesink zelf. In die tijd stond de regio bol van judo — en Michigami was een van de motoren ervan.',
    ],
    photoUrl: '/uploads/2/0/5/8/20583900/2133725_orig.jpg',
    photoCaption: 'Jaarlijks trainingskamp in Slagharen — met Anton Geesink op de foto',
    photoAspect: 'aspect-[4/3]',
  },
  {
    kanji: '継',
    number: '三',
    title: 'De nieuwe generatie',
    era: '2010 — 2016',
    paragraphs: [
      'Rond 2010 brak een nieuwe fase aan. Robin Hack, Pascal Hack en Robert Dingenouts — al bijna vanaf de oprichting bij de club — begonnen naast hun eigen training ook les te geven, onder begeleiding van Koos. Op 5 juni 2010 slaagden ze allen voor de 1e Dan, in 2014 voor de 2e Dan en in 2016 voor de 3e Dan. Ook Wendy Jansen, die al bij Koos begon in Tholen in 1988, was een vaste waarde in de club — zij zou haar zwarte band in 2024 halen.',
    ],
    photoUrl: '/uploads/2/0/5/8/20583900/59265_orig.jpg',
    photoCaption: 'Na het behalen van de 2e Dan — v.l.n.r. Robert, Pascal, Koos en Robin',
    photoAspect: 'aspect-[4/3]',
  },
  {
    kanji: '影',
    number: '四',
    title: 'De rustigere jaren',
    era: '2016 — 2020',
    paragraphs: [
      'Vanaf het midden van de jaren ’10 van de 21e eeuw ging het geleidelijk rustiger aan. Het was een langzaam proces: er waren minder wedstrijdjudoka’s, waardoor toernooien moeilijker te organiseren werden. De ledenkring werd kleiner, en in de regio verdwenen clubs. De regio die in de jaren negentig en tweeduizend bolstond van judo, werd stilletjan kleiner.',
    ],
  },
  {
    kanji: '風',
    number: '五',
    title: 'De genadeklap',
    era: '2020 — 2021',
    paragraphs: [
      'De coronacrisis (2020–2021) was de genadeklap. De trainingen stonden maandenlang stil, en veel clubs in de regio gingen om. Michigami kon net overeind blijven — en vanaf dat moment werkte de club hard om weer te groeien en te verbeteren.',
      'In december 2021 overleed Koos van Wezel op veel te vroege leeftijd. De dojo hield adem, maar de geest hield stand: Robin, Pascal en Robert — die al jaren samen met Koos les gaven — namen de volledige leiding over en hielden de vlam van Michigami levend.',
    ],
  },
  {
    kanji: '絆',
    number: '六',
    title: 'Minuut stilte',
    era: '2026',
    paragraphs: [
      'Het jaar 2026 bracht een verlies dat diep raakte: op 28 maart overleed Franco Hack — schoonzoon van Koos, vader van Robin en Pascal — op amper 59 jaar. Franco was vierde dan en een vast gezicht bij Michigami: hij trainde velen mee naar hun zwarte band, oefende samen kata’s en fungeerde bij het dangraadexamen als uke voor verschillende judoka’s. Hij was een fijn sparpartner — vooral in het ne-waza. Samen met Jolanda zat hij achter de jurytafel bij legio toernooien, en als coach was hij erbij toen Robert, Robin en Pascal internationaal in actie kwamen, zoals op het CSIT in Grenoble.',
      'Op 1 april 2026 hield de club in Steenbergen en in Oud-Vossemeer een minuut stilte voor hem: rond de mat gezeten, stil, samen. Een judoka voor het leven, die het pad van Koos met dezelfde zachte hand verder heeft gedragen.',
    ],
  },
  {
    kanji: '春',
    number: '七',
    title: 'Twee locaties, één club',
    era: '2026 — heden',
    paragraphs: [
      'Het harde werk betaalde zich terug. Michigami is weer een bloeiende vereniging: van kleuters tot volwassenen, recreatief of competitief. In 2024 groeide de dojo in Steenbergen uit met vernieuwde matten van 120 m² — vast opgeslagen, klaar voor de club en de verenigingen die de zaal delen — en Robin en Pascal gaven les in Oud-Vossemeer, een locatie die vast bij de club hoort.',
      'In oktober 2026 viert OVJV (Oud-Vossemeerse Judo Vereniging) haar 50-jarig jubileum — een mijlpaal die Michigami met trots meeviert. Het bestuur van OVJV verzocht Michigami om de vereniging over te nemen. 2026 is het overgangsjaar: in 2027 is de integratie voltooid, en stopt OVJV als zelfstandige vereniging. Vanaf dan: twee locaties, één club.',
      'Met een warme sfeer en een betrokken community kijkt de club met vertrouwen in de toekomst, klaar om nog vele generaties te inspireren met de zachte weg.',
    ],
  },
];
