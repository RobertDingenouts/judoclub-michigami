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
    description: 'Leer de basis van het knopen van je judo-band voor beginners.',
    youtubeId: 'F8WPa52pn7Y',
    level: 'beginner',
  },
  {
    title: 'Voor gevorderden',
    description: 'Een snellere, meer geavanceerde techniek voor ervaren judoka\'s.',
    youtubeId: 'wElOOdex_K4',
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
