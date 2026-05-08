export interface GalleryImage {
  src: string;
  caption: string;
  link?: string;
}

export interface GalleryAlbum {
  id: string;
  title: string;
  images: GalleryImage[];
}

const UPLOAD_BASE = "/uploads/2/0/5/8/20583900";

// Alle foto's uit Weebly export georganiseerd per album/event
export const galleryData: GalleryAlbum[] = [
  {
    id: "clubkampioenschappen-2012",
    title: "Clubkampioenschappen 2012",
    images: [
      { src: `${UPLOAD_BASE}/1364836.jpg`, caption: "Clubkampioenschappen 2012" },
      { src: `${UPLOAD_BASE}/1768427.jpg`, caption: "Clubkampioenschappen 2012" },
      { src: `${UPLOAD_BASE}/1815778.jpg`, caption: "Clubkampioenschappen 2012" },
      { src: `${UPLOAD_BASE}/1950869.jpg`, caption: "Clubkampioenschappen 2012" },
      { src: `${UPLOAD_BASE}/233411.jpg`, caption: "Clubkampioenschappen 2012" },
      { src: `${UPLOAD_BASE}/253694.jpg`, caption: "Clubkampioenschappen 2012" },
      { src: `${UPLOAD_BASE}/2790176.jpg`, caption: "Clubkampioenschappen 2012" },
      { src: `${UPLOAD_BASE}/3380439.jpg`, caption: "Clubkampioenschappen 2012" },
      { src: `${UPLOAD_BASE}/4445989.jpg`, caption: "Clubkampioenschappen 2012" },
      { src: `${UPLOAD_BASE}/459978.jpg`, caption: "Clubkampioenschappen 2012" },
      { src: `${UPLOAD_BASE}/4733056.jpg`, caption: "Clubkampioenschappen 2012" },
      { src: `${UPLOAD_BASE}/4848334.jpg`, caption: "Clubkampioenschappen 2012" },
      { src: `${UPLOAD_BASE}/5024007.jpg`, caption: "Clubkampioenschappen 2012" },
      { src: `${UPLOAD_BASE}/5346899.jpg`, caption: "Clubkampioenschappen 2012" },
      { src: `${UPLOAD_BASE}/6019471.jpg`, caption: "Clubkampioenschappen 2012" },
      { src: `${UPLOAD_BASE}/6196809.jpg`, caption: "Clubkampioenschappen 2012" },
      { src: `${UPLOAD_BASE}/6300780.jpg`, caption: "Clubkampioenschappen 2012" },
      { src: `${UPLOAD_BASE}/6474177.jpg`, caption: "Clubkampioenschappen 2012" },
      { src: `${UPLOAD_BASE}/6746295.jpg`, caption: "Clubkampioenschappen 2012" },
      { src: `${UPLOAD_BASE}/7053130.jpg`, caption: "Clubkampioenschappen 2012" },
      { src: `${UPLOAD_BASE}/7511563.jpg`, caption: "Clubkampioenschappen 2012" },
      { src: `${UPLOAD_BASE}/8023769.jpg`, caption: "Clubkampioenschappen 2012" },
      { src: `${UPLOAD_BASE}/8348693.jpg`, caption: "Clubkampioenschappen 2012" },
      { src: `${UPLOAD_BASE}/8533595.jpg`, caption: "Clubkampioenschappen 2012" },
      { src: `${UPLOAD_BASE}/8715630.jpg`, caption: "Clubkampioenschappen 2012" },
      { src: `${UPLOAD_BASE}/8838507.jpg`, caption: "Clubkampioenschappen 2012" },
      { src: `${UPLOAD_BASE}/9234254.jpg`, caption: "Clubkampioenschappen 2012" },
      { src: `${UPLOAD_BASE}/9576716.jpg`, caption: "Clubkampioenschappen 2012" },
      { src: `${UPLOAD_BASE}/9844574.jpg`, caption: "Clubkampioenschappen 2012" },
      { src: `${UPLOAD_BASE}/9884219.jpg`, caption: "Clubkampioenschappen 2012" },
    ],
  },
  {
    id: "budodag-duiven-imaf-2015",
    title: "Budodag Duiven IMAF 2015",
    images: [
      { src: `${UPLOAD_BASE}/449805.jpg`, caption: "Budodag Duiven IMAF 2015" },
      { src: `${UPLOAD_BASE}/5949341.jpg`, caption: "Budodag Duiven IMAF 2015" },
      { src: `${UPLOAD_BASE}/8020274.jpg`, caption: "Budodag Duiven IMAF 2015" },
      { src: `${UPLOAD_BASE}/8164000.jpg`, caption: "Budodag Duiven IMAF 2015" },
      { src: `${UPLOAD_BASE}/8721155.jpg`, caption: "Budodag Duiven IMAF 2015" },
      { src: `${UPLOAD_BASE}/9903278.jpg`, caption: "Budodag Duiven IMAF 2015" },
    ],
  },
  {
    id: "algemeen",
    title: "Diverse Evenementen",
    images: [
      { src: `${UPLOAD_BASE}/147312.jpg`, caption: "Survivalrun Steenbergen" },
      { src: `${UPLOAD_BASE}/1675575.jpg`, caption: "Judoclub Michigami" },
      { src: `${UPLOAD_BASE}/2363390.jpg`, caption: "Vechtbaltoernooi Heerle" },
      { src: `${UPLOAD_BASE}/2897949.jpg`, caption: "Sinterklaastoernooi Heerle" },
      { src: `${UPLOAD_BASE}/395628.jpg`, caption: "Bandenexamens November 2013" },
      { src: `${UPLOAD_BASE}/4420043.jpg`, caption: "Toernooi Stichting Judo Geelhoed" },
      { src: `${UPLOAD_BASE}/4797588.jpg`, caption: "Toernooi Huijbergen 2016" },
      { src: `${UPLOAD_BASE}/4903214.jpg`, caption: "Budodag Duiven IMAF" },
      { src: `${UPLOAD_BASE}/5395808.jpg`, caption: "Vlissingen 2015" },
      { src: `${UPLOAD_BASE}/545639.jpg`, caption: "Budodag 2011" },
      { src: `${UPLOAD_BASE}/5463935.jpg`, caption: "Trappes 2011" },
      { src: `${UPLOAD_BASE}/5954113.jpg`, caption: "Paastoernooi Oud-Vossemeer" },
      { src: `${UPLOAD_BASE}/7562252.jpg`, caption: "Clubkampioenschappen 2012" },
      { src: `${UPLOAD_BASE}/9628101.jpg`, caption: "Budo Kidsdag 2015" },
      { src: `${UPLOAD_BASE}/984307.jpg`, caption: "Dangraad Examens 2014" },
    ],
  },
];

export function getAllImages(): GalleryImage[] {
  return galleryData.flatMap((album) => album.images);
}
