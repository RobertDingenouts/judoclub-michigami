export interface TimelineEvent {
  year: string;
  title: string;
  description: string;
  icon?: 'judo' | 'club' | 'person' | 'award' | 'location' | 'star';
  photoUrl?: string;
  isMilestone?: boolean;
}

export const timelineEvents: TimelineEvent[] = [
  {
    year: '1882',
    title: 'Jigoro Kano sticht Judo',
    description: 'Jigoro Kano foundation de Kodokan in Tokio en creëert judo als moderne vechtsport, afgeleid van traditioneel jiu-jitsu. Het principe " maximum efficiency, mutual welfare and benefit" wordt de kern van judo.',
    icon: 'judo',
    isMilestone: true,
  },
  {
    year: "Jaren '60",
    title: 'Anton Geesink era',
    description: 'Anton Geesink, leerling van Haku Michigami, wordt de eerste niet-Japanner die wereldkampioen judo wordt (1961). Zijn successen maken judo populair in Nederland en Europa.',
    icon: 'star',
  },
  {
    year: '1976',
    title: 'Oprichting OVJV',
    description: 'Judovereniging OVJV (Oud-Vossemeerse Judo Vereniging) wordt opgericht. Een van de voormalige trainingslocaties van Michigami, getuige van jarenlange judo-passie in de regio.',
    icon: 'club',
  },
  {
    year: '1993',
    title: 'Oprichting Judoclub Michigami',
    description: 'Koos van Wezel richt Judoclub Michigami op in Steenbergen. De naam "Michigami" is een eerbetoon aan zijn leraar Haku Michigami — ook meester van Anton Geesink. Training start in Sportcentrum De Knotwilg.',
    icon: 'club',
    isMilestone: true,
  },
  {
    year: '2000-2010',
    title: 'Groeijaren & Regio-uitbreiding',
    description: 'Koos van Wezel geeft judoles door heel de regio: Scherpenisse, Tholen, Roosendaal, Nieuw-Vossemeer en Oud-Vossemeer. Michigami groeit uit tot een bloeiende club met leden van alle leeftijden.',
    icon: 'location',
  },
  {
    year: '2014',
    title: 'Trainers behalen 2e Dan',
    description: 'Robin Hack, Robert Dingenouts en Pascal Hack slagen allemaal voor hun examen tot 2e Dan zwart. Een mijlpaal voor de nieuwe generatie die al bijna vanaf de oprichting lid is.',
    icon: 'award',
  },
  {
    year: '2015',
    title: 'Dutch Open International Championships',
    description: '4 judoka\'s van Michigami doen mee aan de Dutch Open in Dalfsen. Latif Nurzad, Ricardo den Heijer en Damian van Leijenhorst behalen allemaal een 2e plaats — keurige prestatie op nationaal niveau.',
    icon: 'star',
  },
  {
    year: '2021',
    title: 'Nieuwe generatie neemt over',
    description: 'Robin Hack, Pascal Hack en Robert Dingenouts — alle drie 3e Dan zwart — nemen het stokje over van Koos van Wezel. Zij zorgen dat de Michigami-geest levend blijft: respect, discipline en passie voor judo.',
    icon: 'person',
    isMilestone: true,
  },
  {
    year: '2024',
    title: 'Wendy Jansen behaalt 1e Dan',
    description: 'Wendy Jansen behaalt haar zwarte band (1e Dan) en wordt instructeur en EHBO\'er bij de club. Een verdere versterking van het trainerteam.',
    icon: 'award',
  },
  {
    year: 'Vandaag',
    title: 'Hedendaagse Michigami',
    description: 'Judoclub Michigami traint in De Knotwilg (Steenbergen) en De Vossenkuil (Oud-Vossemeer). Drie leeftijdsgroepen, recreatief en competitief — van kleuters tot volwassenen. Met een nieuw lesysteem dat drie tradities combineert.',
    icon: 'judo',
  },
];
