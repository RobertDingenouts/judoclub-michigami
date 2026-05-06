export interface LocationInfo {
  name: string;
  address: string;
  postalCode: string;
  city: string;
  mapsUrl: string;
  coordinates: { lat: number; lng: number };
  image?: string;
  isPrimary: boolean;
}

export const locationData: LocationInfo[] = [
  {
    name: "Sportcentrum De Knotwilg",
    address: "Wipstraat 2",
    postalCode: "4651 XW",
    city: "Steenbergen",
    mapsUrl: "https://maps.app.goo.gl/Wipstraat+2+Steenbergen",
    coordinates: { lat: 51.5812141, lng: 4.3246518 },
    image: "/uploads/2/0/5/8/20583900/published/dojo-nieuwe-matten.jpg",
    isPrimary: true,
  },
  {
    name: "Dorpshuis De Vossenkuil",
    address: "Bou Kooijmanstraat 48",
    postalCode: "4698 AM",
    city: "Oud-Vossemeer",
    mapsUrl: "https://maps.app.goo.gl/RWhUtS4PggtXPWfw6",
    coordinates: { lat: 51.5372, lng: 4.3047 },
    isPrimary: false,
  },
];

export const directions = [
  "Via de A58: afslag Steenbergen, richting centrum",
  "Parkeergelegenheid bij Sportcentrum De Knotwilg",
  "Te voet: goed bereikbaar vanaf het station",
];
