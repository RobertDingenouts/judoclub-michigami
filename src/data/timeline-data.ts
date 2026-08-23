export interface TimelineEvent {
  year: string;
  title: string;
  description: string;
  icon?: 'judo' | 'club' | 'person' | 'award' | 'location' | 'star';
  photoUrl?: string;
  photoCaption?: string;
  photoAspect?: string;
  isMilestone?: boolean;
  /** Herinneringsmoment (overlijden/minuut stilte) — krijgt kaarsgloed + bloesem. */
  memorial?: boolean;
}

export const timelineEvents: TimelineEvent[] = [
  {
    year: '1882',
    title: 'Jigoro Kano sticht Judo',
    description: 'Jigoro Kano (1860–1938) sticht de Kodokan in Tokio en creëert judo als moderne vechtsport, afgeleid van traditioneel jiu-jitsu. Het principe "maximum efficiency, mutual welfare and benefit" wordt de kern van judo. Hij transformeerde samurai-vechtkunsten tot een weg voor lichamelijke en geestelijke ontwikkeling.',
    icon: 'judo',
    isMilestone: true,
  },
  {
    year: "Jaren '20",
    title: 'Kawaishi brengt Judo naar Europa',
    description: 'Mikinosuke Kawaishi (1899–1969), een Japanse judomeester, vestigt zich in Parijs en revolutioneert judo in Europa. Hij introduceert het gekleurde bandensysteem (wit → geel → oranje → groen → blauw → bruin → zwart) dat wereldwijd wordt gebruikt. Hij was mede-oprichter van de Franse Judo Federatie met Moshe Feldenkrais en creëerde de Kawaishi Cup — het eerste internationale judotoernooi tussen landen.',
    icon: 'star',
  },
  {
    year: '1956',
    title: 'Michigami begint in Nederland',
    description: 'Haku Michigami (1912–2002), een Japanse judomeester met een ongeslagen competitie-rekord, wordt technisch adviseur van de Koninklijke Nederlandse Judobond. Hij blijft 13 jaar in Nederland en wordt persoonlijk trainer van Anton Geesink. Hij stuurde Geesink naar het eerste internationale kampioenschap in Japan met de woorden: "Ga de sfeer opsnuiven."',
    icon: 'star',
  },
  {
    year: "Jaren '60",
    title: 'Anton Geesink era',
    description: 'Anton Geesink (1929–2010), leerling van Haku Michigami, wordt de eerste niet-Japanner die wereldkampioen judo wordt (1961 in Parijs). Zijn olympisch goud in Tokyo (1964) maakt judo populair in Nederland en Europa. De Japanse toeschouwers waren zo geraakt door zijn nederige buiging na de wedstrijd dat judo in Japan en Nederland een nieuwe golf van populariteit beleeft.',
    icon: 'star',
  },
  {
    year: '1976',
    title: 'Oprichting OVJV',
    description: 'Judovereniging OVJV (Oud-Vossemeerse Judo Vereniging) wordt opgericht — een zelfstandige judoclub in Oud-Vossemeer. In 2026 viert OVJV haar 50-jarig jubileum en fuseert met Michigami.',
    icon: 'club',
  },
  {
    year: "Jaren '80",
    title: 'Koos van Wezel geeft les',
    description: 'Voordat Judoclub Michigami bestond, gaf Koos van Wezel, leerling van Haku Michigami, al met veel passie judoles op diverse plaatsen in de regio, waaronder Tholen, Roosendaal en Scherpenisse.',
    icon: 'person',
  },
  {
    year: '1988',
    title: 'Wendy Jansen begint met judo',
    description: 'Wendy Jansen behaalt haar witte band bij Koos van Wezel in Tholen. Ze blijft jarenlang actief, ook na de oprichting van Michigami, en traint uiteindelijk voor haar zwarte band.',
    icon: 'person',
  },
  {
    year: '1993',
    title: 'Oprichting Judoclub Michigami',
    description: 'Voortbouwend op zijn ervaringen als trainer, richten Koos van Wezel, zijn zoon Erwin van Wezel en Marinus Smout Judoclub Michigami op — officieel gevestigd te Nieuw-Vossemeer, met de dojo in Sportcentrum De Knotwilg in Steenbergen. De naam is een eerbetoon aan leraar Haku Michigami — ook meester van Anton Geesink.',
    icon: 'club',
    isMilestone: true,
  },
  {
    year: "Jaren '90 — 2000",
    title: 'Gouden jaren Michigami',
    description: 'De gouden tijd van de club — de jaren negentig én de jaren tweeduizend: donderdag twee trainingsgroepen, vrijdag drie groepen. Les in Nieuw-Vossemeer en Scherpenisse. Elk jaar toernooien in Londen en Parijs. Pony Park Slagharen met les van Anton Geesink zelf. Een echte familieclub: zoon Erwin is zelf actief en geeft weleens les, Els steunt de club altijd en dochter Jolanda is een vaste waarde. Jolanda trouwt met Franco Hack; samen kregen zij drie zoons, waaronder de tweeling Robin en Pascal — de twee kleine judoka’s die later het bestuur en de trainers van Michigami worden. En dan is er nog Alex van Loon, die Koos jarenlang bij de trainingen assisteert — een onmisbare tweede hand achter de mat.',
    icon: 'star',
    photoUrl: '/uploads/2/0/5/8/20583900/2133725_orig.jpg',
    photoCaption: 'Jaarlijks trainingskamp in Slagharen — met Anton Geesink op de foto',
    photoAspect: 'aspect-[4/3]',
  },
  {
    year: '2010',
    title: 'Robin, Pascal & Robert behalen 1e Dan',
    description: 'Op 5 juni 2010 slaagt de nieuwe generatie — Robin Hack, Pascal Hack en Robert Dingenouts — alle drie voor hun 1e Dan zwarte band. Een mijlpaal voor drie vrienden die al bijna vanaf de oprichting samen judo oefenen.',
    icon: 'award',
    isMilestone: true,
  },
  {
    year: '2014',
    title: 'Robin, Pascal & Robert behalen 2e Dan',
    description: 'Op 7 juni 2014 behalen Robin Hack, Pascal Hack en Robert Dingenouts gezamenlijk hun 2e Dan zwarte band. Een mooie mijlpaal in hun lange judo-reis.',
    icon: 'award',
    isMilestone: true,
    photoUrl: '/uploads/2/0/5/8/20583900/59265_orig.jpg',
    photoCaption: 'Na het behalen van de 2e Dan — v.l.n.r. Robert, Pascal, Koos en Robin',
    photoAspect: 'aspect-[4/3]',
  },
  {
    year: '2015',
    title: 'Dutch Open International Championships',
    description: '4 judoka\'s van Michigami doen mee aan de Dutch Open in Dalfsen. Latif Nurzad, Ricardo den Heijer en Damian van Leijenhorst behalen allemaal een 2e plaats — keurige prestatie op nationaal niveau.',
    icon: 'star',
  },
  {
    year: '2016',
    title: 'Robin, Pascal & Robert behalen 3e Dan',
    description: 'Op 4 juni 2016 slaagt het trio voor hun 3e Dan zwart band. Een hoog niveau dat getuigt van jarenlange toewijding aan de sport.',
    icon: 'award',
  },
  {
    year: '2018',
    title: '25-jarig jubileum',
    description: 'Judoclub Michigami viert haar 25-jarig bestaan met een groot toernooi op 6 oktober — een dag vol judo, prijzen en dankbaarheid voor alle vrijwilligers en leden.',
    icon: 'award',
    isMilestone: true,
  },
  {
    year: "Jaren '10",
    title: 'Geleidelijke afname & de coronacrisis',
    description: 'Vanaf het midden van de jaren ’10 van de 21e eeuw gaat het geleidelijk rustiger aan: er zijn minder wedstrijdjudoka’s, waardoor toernooien moeilijker te organiseren worden, de ledenkring krimpt en in de regio verdwijnen clubs. De coronacrisis (2020–2021) is dan de genadeklap: veel clubs gaan om, Michigami kan net overeind blijven. Daarna werkt de club hard om weer te groeien en te verbeteren.',
    icon: 'club',
    isMilestone: true,
  },
  {
    year: '2021',
    title: 'Volledige overname na Koos\' overlijden',
    description: 'Koos van Wezel overlijdt in december 2021 op veel te vroege leeftijd. Robin, Pascal en Robert — die al jaren samen met Koos les gaven — nemen de club volledig over en zorgen ervoor dat de Michigami-geest levend blijft.',
    icon: 'person',
    isMilestone: true,
    memorial: true,
  },
  {
    year: '2024',
    title: 'Ontwikkeling & zelfstandigheid',
    description: 'Nieuwe matten (120 m²), Chiem en Jacco slagen voor 1e Dan. Eerste open Clubkampioenschap met OVJV, Yoshi en Judo Edegem. CJJF-lidmaatschap beëindigd — club gaat zelfstandig verder.',
    icon: 'club',
  },
  {
    year: '2024',
    title: 'Wendy Jansen behaalt 1e Dan',
    description: 'Na een lange tijd ertussenuit te zijn geweest met bruine band, keert Wendy terug en behaalt ze in 2024 haar 1e Dan zwarte band. Ze geeft nu les in zowel Oud-Vossemeer als Steenbergen en is verantwoordelijk voor EHBO.',
    icon: 'award',
  },
  {
    year: '2026',
    title: 'Minuut stilte voor Franco Hack (1966–2026)',
    description: 'Op 28 maart overlijdt Franco Hack — vierde dan, vader van Robin en Pascal, schoonzoon van Koos — op amper 59 jaar. Hij trainde velen mee naar hun zwarte band, oefende samen kata’s en fungeerde bij het dangraadexamen als uke voor verschillende judoka’s. Was een fijn sparpartner, vooral in het ne-waza, zat met Jolanda achter de jurytafel bij legio toernooien en was coach bij internationale uitstapjes zoals het CSIT in Grenoble. Op 1 april houdt de club in Steenbergen en Oud-Vossemeer een minuut stilte voor hem — rond de mat gezeten, samen.',
    icon: 'person',
    isMilestone: true,
    memorial: true,
    photoUrl: '/images/minuut-stilte-franco.jpg',
    photoCaption: '1 april 2026 · minuut stilte voor Franco Hack, De Vossenkuil Oud-Vossemeer',
  },
  {
    year: '2026',
    title: 'OVJV overname & 50-jarig jubileum',
    description: 'Michigami neemt OVJV (Oud-Vossemeerse Judo Vereniging) over in een overgangsjaar. OVJV viert haar 50-jarig jubileum met een toernooi in oktober. Vanaf 2027: twee locaties, één club.',
    icon: 'location',
    isMilestone: true,
  },
  {
    year: 'Vandaag',
    title: 'Hedendaagse Michigami',
    description: 'Judoclub Michigami traint in De Knotwilg (Steenbergen) en De Vossenkuil (Oud-Vossemeer). Twee leeftijdsgroepen, recreatief en competitief — van kleuters tot volwassenen. Met een eigen lesysteem dat drie tradities combineert.',
    icon: 'judo',
  },
];
