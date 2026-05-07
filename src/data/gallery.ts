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

export const galleryData: GalleryAlbum[] = [
  {
    id: "budodag-duiven-imaf-2015",
    title: "Budodag Duiven IMAF",
    images: [
      { src: `${UPLOAD_BASE}/4903214.jpg`, caption: "Budodag Duiven IMAF" },
    ],
  },
  {
    id: "vlissingen-2015",
    title: "Vlissingen 2015",
    images: [
      { src: `${UPLOAD_BASE}/5395808.jpg`, caption: "Vlissingen 2015" },
    ],
  },
  {
    id: "toernooi-huijbergen-2016",
    title: "Toernooi Huijbergen 2016",
    images: [
      { src: `${UPLOAD_BASE}/4797588.jpg`, caption: "Toernooi Huijbergen 2016" },
    ],
  },
  {
    id: "heerle-2016-witte-gele-banden",
    title: "Heerle 2016 Witte en gele banden toernooi",
    images: [
      { src: `${UPLOAD_BASE}/20161119-102734.jpg`, caption: "Heerle 2016 Witte en gele banden toernooi" },
    ],
  },
  {
    id: "budo-kidsdag-2015",
    title: "Budo Kidsdag 2015",
    images: [
      { src: `${UPLOAD_BASE}/9628101.jpg`, caption: "Budo Kidsdag 2015" },
    ],
  },
  {
    id: "dangraad-examens-2014",
    title: "Dangraad Examens 2014",
    images: [
      { src: `${UPLOAD_BASE}/984307.jpg`, caption: "Dangraad Examens 2014" },
    ],
  },
  {
    id: "toernooi-stichting-judo-geelhoed",
    title: "Toernooi Stichting Judo Geelhoed",
    images: [
      { src: `${UPLOAD_BASE}/4420043.jpg`, caption: "Toernooi Stichting Judo Geelhoed" },
    ],
  },
  {
    id: "survivalrun-steenbergen",
    title: "Survivalrun Steenbergen",
    images: [
      { src: `${UPLOAD_BASE}/147312.jpg`, caption: "Survivalrun Steenbergen" },
    ],
  },
  {
    id: "paastoernooi-oud-vossemeer",
    title: "Paastoernooi Oud-Vossemeer",
    images: [
      { src: `${UPLOAD_BASE}/5954113.jpg`, caption: "Paastoernooi Oud-Vossemeer" },
    ],
  },
  {
    id: "vechtbaltoernooi-heerle",
    title: "Vechtbaltoernooi Heerle",
    images: [
      { src: `${UPLOAD_BASE}/2363390.jpg`, caption: "Vechtbaltoernooi Heerle" },
    ],
  },
  {
    id: "bandenexamens-november-2013",
    title: "Bandenexamens November 2013",
    images: [
      { src: `${UPLOAD_BASE}/395628.jpg`, caption: "Bandenexamens November 2013" },
    ],
  },
  {
    id: "sinterklaastoernooi-heerle-2013",
    title: "Sinterklaastoernooi Heerle",
    images: [
      { src: `${UPLOAD_BASE}/2897949.jpg`, caption: "Sinterklaastoernooi Heerle" },
    ],
  },
  {
    id: "clubkampioenschappen-2012",
    title: "Clubkampioenschappen 2012",
    images: [
      { src: `${UPLOAD_BASE}/7562252.jpg`, caption: "Clubkampioenschappen 2012" },
    ],
  },
  {
    id: "budodag-2011",
    title: "Budodag 2011",
    images: [
      { src: `${UPLOAD_BASE}/545639.jpg`, caption: "Budodag 2011" },
    ],
  },
  {
    id: "trappes-2011",
    title: "Trappes 2011",
    images: [
      { src: `${UPLOAD_BASE}/5463935.jpg`, caption: "Trappes 2011" },
    ],
  },
];

export function getAllImages(): GalleryImage[] {
  return galleryData.flatMap((album) => album.images);
}
