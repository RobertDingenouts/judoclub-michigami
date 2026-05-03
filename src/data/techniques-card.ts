export interface TechniquesCard {
  title: string;
  description: string;
  pdfUrl: string;
  pdfName: string;
  imageUrl?: string;
  imageAlt?: string;
}

export const techniquesCards: TechniquesCard[] = [
  {
    title: 'Techniekenkaart',
    description:
      'Overzicht van alle judotechnieken, gecategoriseerd volgens de Kodokan-indeling. Inclusief wapen, beenworpen, heupworpen, schouderworpen, armworpen, offerworpen, houdgrepen, wurgingen, armklemmen en kanteltechnieken.',
    pdfUrl: 'uploads/2/0/5/8/20583900/techniekenkaart_jc_michigami.pdf',
    pdfName: 'techniekenkaart_jc_michigami.pdf',
    imageUrl: 'uploads/2/0/5/8/20583900/editor/2022-03-19-2.png',
    imageAlt: 'Techniekenkaart preview',
  },
  {
    title: 'Band en Slip Exameneisen',
    description:
      'Exameneisen voor het behalen van bandgraden (kyu) en slipgraden (dan). Hierin staan de technieken en kennis die je moet beheersen voor elk examen.',
    pdfUrl: 'uploads/2/0/5/8/20583900/band_en_slip_exameneisen.pdf',
    pdfName: 'band_en_slip_exameneisen.pdf',
    imageUrl: 'uploads/2/0/5/8/20583900/published/2022-03-19.png',
    imageAlt: 'Exameneisen preview',
  },
  {
    title: 'CJJF Dan-graden Examenreglement',
    description:
      'Het examenreglement voor Dan-graden (zwarte band) van de CJJF (Centrale Judo Jiu-Jitsu Federatie). Informatie over de eisen, procedures en voorwaarden voor het behalen van een Dan-graad.',
    pdfUrl: 'uploads/2/0/5/8/20583900/2022_cjjf_examen_reglement_judo_aangepast.pdf',
    pdfName: '2022_cjjf_examen_reglement_judo_aangepast.pdf',
  },
];
