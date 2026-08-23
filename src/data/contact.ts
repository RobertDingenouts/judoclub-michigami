export interface ContactLocation {
  name: string;
  address: string;
  postalCode: string;
  city: string;
  mapsUrl: string;
  trainingDay: string;
  trainingTime: string;
}

export const contactInfo = {
  clubName: "Judoclub Michigami",
  whatsapp: "0648649912",
  email: "judoclub_michigami@hotmail.com",
  facebook: "https://www.facebook.com/judoclubmichigami",
  instagram: "https://www.instagram.com/judoclub_michigami/",
  youtube: "https://www.youtube.com/@JudoMichigami",
  locations: [
    {
      name: "Sportcentrum De Knotwilg",
      address: "Wipstraat 2",
      postalCode: "4651 XW",
      city: "Steenbergen",
      mapsUrl: "https://www.google.com/maps/search/?api=1&query=Sportcentrum+De+Knotwilg+Wipstraat+2+4651+XW+Steenbergen",
      trainingDay: "Vrijdagavond",
      trainingTime: "18:45 - 20:45",
    },
    {
      name: "Dorpshuis De Vossenkuil",
      address: "Bou Kooijmanstraat 48",
      postalCode: "4698 AM",
      city: "Oud-Vossemeer",
      mapsUrl: "https://www.google.com/maps/search/?api=1&query=Bou+Kooijmanstraat+48+4698+AM+Oud-Vossemeer",
      trainingDay: "Woensdagavond",
      trainingTime: "19:00 - 20:00",
    },
  ] as ContactLocation[],
};
