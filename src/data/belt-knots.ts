export interface BeltKnotVideo {
  title: string;
  description: string;
  youtubeId: string;
  level: 'beginner' | 'advanced';
}

export interface BeltKnotInfo {
  title: string;
  steps: string[];
  tips: string[];
}

export const beltKnotVideos: BeltKnotVideo[] = [
  {
    title: 'Voor beginners',
    description: 'Stap voor stap je judoband knopen — gewoon in het Nederlands (Judo Zuid-West).',
    youtubeId: 'JtAXjWBGCxk',
    level: 'beginner',
  },
  {
    title: 'Voor gevorderden',
    description: 'De PRO-truc voor een snelle, strakke knoop (Judo Zuid-West).',
    youtubeId: 'txCJypstf68',
    level: 'advanced',
  },
];

export const beltKnotInfo: BeltKnotInfo = {
  title: 'Band Knopen',
  steps: [
    'Leg de band plat voor je met de voorkant naar boven.',
    'Vouw het lange uiteinde over het korte uiteinde.',
    'Steek het lange uiteinde door de lus vanaf onder.',
    'Trek de knoop strak door aan beide uiteinden.',
    'Controleer of de knoop mooi en symmetrisch zit.',
  ],
  tips: [
    'Zorg dat de band niet te strak zit, maar wel stevig.',
    'De uiteinden moeten even lang zijn na het knopen.',
    'Oefen meerdere keren om een mooie, strakke knoop te krijgen.',
    'Voor gevorderden: de dubbele knoop is sneller en steviger.',
  ],
};
