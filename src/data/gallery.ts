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
      {
        src: `${UPLOAD_BASE}/4903214.jpg`,
        caption: "Budodag Duiven IMAF",
        link: "fotos.html",
      },
    ],
  },
  {
    id: "vlissingen-2015",
    title: "Vlissingen 2015",
    images: [
      {
        src: `${UPLOAD_BASE}/5395808.jpg`,
        caption: "Vlissingen 2015",
        link: "fotos.html",
      },
    ],
  },
  {
    id: "toernooi-huijbergen-2016",
    title: "Toernooi Huijbergen 2016",
    images: [
      {
        src: `${UPLOAD_BASE}/4797588.jpg`,
        caption: "Toernooi Huijbergen 2016",
        link: "fotos.html",
      },
    ],
  },
  {
    id: "heerle-2016-witte-gele-banden",
    title: "Heerle 2016 Witte en gele banden toernooi",
    images: [
      {
        src: `${UPLOAD_BASE}/20161119-102734.jpg`,
        caption: "Heerle 2016 Witte en gele banden toernooi",
        link: "fotos.html",
      },
    ],
  },
  {
    id: "budo-kidsdag-2015",
    title: "Budo Kidsdag 2015",
    images: [
      {
        src: `${UPLOAD_BASE}/9628101.jpg`,
        caption: "Budo Kidsdag 2015",
        link: "fotos.html",
      },
    ],
  },
  {
    id: "dangraad-examens-2014",
    title: "Dangraad Examens 2014",
    images: [
      {
        src: `${UPLOAD_BASE}/984307.jpg`,
        caption: "Dangraad Examens 2014",
        link: "fotos.html",
      },
    ],
  },
  {
    id: "toernooi-stichting-judo-geelhoed",
    title: "Toernooi Stichting Judo Geelhoed",
    images: [
      {
        src: `${UPLOAD_BASE}/4420043.jpg`,
        caption: "Toernooi Stichting Judo Geelhoed",
        link: "fotos.html",
      },
    ],
  },
  {
    id: "survivalrun-steenbergen",
    title: "Survivalrun Steenbergen",
    images: [
      {
        src: `${UPLOAD_BASE}/147312.jpg`,
        caption: "Survivalrun Steenbergen",
        link: "fotos.html",
      },
    ],
  },
  {
    id: "paastoernooi-oud-vossemeer",
    title: "Paastoernooi Oud-Vossemeer",
    images: [
      {
        src: `${UPLOAD_BASE}/5954113.jpg`,
        caption: "Paastoernooi Oud-Vossemeer",
        link: "fotos.html",
      },
    ],
  },
  {
    id: "vechtbaltoernooi-heerle",
    title: "Vechtbaltoernooi Heerle",
    images: [
      {
        src: `${UPLOAD_BASE}/2363390.jpg`,
        caption: "Vechtbaltoernooi Heerle",
        link: "fotos.html",
      },
    ],
  },
  {
    id: "bandenexamens-november-2013",
    title: "Bandenexamens November 2013",
    images: [
      {
        src: `${UPLOAD_BASE}/395628.jpg`,
        caption: "Bandenexamens November 2013",
        link: "fotos.html",
      },
    ],
  },
  {
    id: "sinterklaastoernooi-heerle-2013",
    title: "Sinterklaastoernooi Heerle",
    images: [
      {
        src: `${UPLOAD_BASE}/2897949.jpg`,
        caption: "Sinterklaastoernooi Heerle",
        link: "fotos.html",
      },
    ],
  },
  {
    id: "clubkampioenschappen-2012",
    title: "Clubkampioenschappen 2012",
    images: [
      {
        src: `${UPLOAD_BASE}/7562252.jpg`,
        caption: "Clubkampioenschappen 2012",
        link: "fotos.html",
      },
    ],
  },
  {
    id: "budodag-2011",
    title: "Budodag 2011",
    images: [
      {
        src: `${UPLOAD_BASE}/545639.jpg`,
        caption: "Budodag 2011",
        link: "fotos.html",
      },
    ],
  },
  {
    id: "trappes-2011",
    title: "Trappes 2011",
    images: [
      {
        src: `${UPLOAD_BASE}/5463935.jpg`,
        caption: "Trappes 2011",
        link: "fotos.html",
      },
    ],
  },
  // Overige foto's slideshow images
  {
    id: "overige-fotos",
    title: "Overige foto's",
    images: [
      { src: `${UPLOAD_BASE}/6143888.jpg`, caption: "Overige foto's" },
      { src: `${UPLOAD_BASE}/2286331.jpg`, caption: "Overige foto's" },
      { src: `${UPLOAD_BASE}/6431106.jpg`, caption: "Overige foto's" },
      { src: `${UPLOAD_BASE}/3249752.jpg`, caption: "Overige foto's" },
      { src: `${UPLOAD_BASE}/2979744.jpg`, caption: "Overige foto's" },
      { src: `${UPLOAD_BASE}/5920856.jpg`, caption: "Overige foto's" },
      { src: `${UPLOAD_BASE}/3300874.jpg`, caption: "Overige foto's" },
      { src: `${UPLOAD_BASE}/7356092.jpg`, caption: "Overige foto's" },
      { src: `${UPLOAD_BASE}/1323133.jpg`, caption: "Overige foto's" },
      { src: `${UPLOAD_BASE}/6776153.jpg`, caption: "Overige foto's" },
      { src: `${UPLOAD_BASE}/8358245.jpg`, caption: "Overige foto's" },
      { src: `${UPLOAD_BASE}/5066154.jpg`, caption: "Overige foto's" },
      { src: `${UPLOAD_BASE}/3901000.jpg`, caption: "Overige foto's" },
      { src: `${UPLOAD_BASE}/1824986.jpg`, caption: "Overige foto's" },
      { src: `${UPLOAD_BASE}/8420554.jpg`, caption: "Overige foto's" },
      { src: `${UPLOAD_BASE}/6663631.jpg`, caption: "Overige foto's" },
      { src: `${UPLOAD_BASE}/4724141.jpg`, caption: "Overige foto's" },
      { src: `${UPLOAD_BASE}/5722687.jpg`, caption: "Overige foto's" },
      { src: `${UPLOAD_BASE}/1414899.jpg`, caption: "Overige foto's" },
      { src: `${UPLOAD_BASE}/4143351.jpg`, caption: "Overige foto's" },
    ],
  },
];

export function getAllImages(): GalleryImage[] {
  return galleryData.flatMap((album) => album.images);
}
