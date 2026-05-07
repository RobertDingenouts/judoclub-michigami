export interface TechniquesCard {
  title: string;
  description: string;
  available: boolean; // true = downloadbaar, false = opvraagbaar bij club
  pdfUrl?: string;
  pdfName?: string;
  imageUrl?: string;
  imageAlt?: string;
}

export const techniquesCards: TechniquesCard[] = [
  {
    title: 'Techniekenkaart',
    description:
      'Overzicht van alle judotechnieken, gecategoriseerd volgens de Kodokan-indeling. Inclusief wapen, beenworpen, heupworpen, schouderworpen, armworpen, offerworpen, houdgrepen, wurgingen, armklemmen en kanteltechnieken.',
    available: false,
    imageAlt: 'Techniekenkaart preview',
  },
  {
    title: 'Band en Slip Exameneisen',
    description:
      'Exameneisen voor het behalen van bandgraden (kyu) en slipgraden (dan). Hierin staan de technieken en kennis die je moet beheersen voor elk examen.',
    available: false,
    imageAlt: 'Exameneisen preview',
  },
];
