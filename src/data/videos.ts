export interface VideoItem {
  id: string;
  title: string;
  youtubeId: string;
  description?: string;
}

// Alle video's van Judoclub Michigami YouTube-kanaal (@JudoMichigami)
// Bron: https://www.youtube.com/@JudoMichigami/videos
export const videoData: VideoItem[] = [
  {
    id: "nage-no-kata-jacco-chiem",
    title: "Demonstratie Nage-no-kata Jacco en Chiem",
    youtubeId: "X4t8mscbOL4",
    description: "Nage-no-kata demonstratie door Jacco Loos en Chiem Geers",
  },
  {
    id: "moet-pijn",
    title: "Moet Pijn!",
    youtubeId: "24kar0v10Cs",
    description: "Judoclub Michigami - Moet Pijn!",
  },
  {
    id: "kung-fu-budodag-duiven-2015",
    title: "Kung Fu Budodag Duiven 2015",
    youtubeId: "pSav8NbdYYA",
    description: "Kung Fu demonstratie tijdens de Budodag in Duiven (IMAF 2015)",
  },
  {
    id: "nage-no-kata-robin-robert",
    title: "Nage no Kata Kodokan Judo",
    youtubeId: "iP2dQWmGtQ0",
    description: "Kodokan Nage-no-kata demonstratie - Tori: Robert Dingenouts, Uke: Robin Hack (2012 Scherpenisse)",
  },
  {
    id: "survivalrun-steenbergen-2014",
    title: "Survivalrun Steenbergen 2014",
    youtubeId: "Q5DqDhum_Gg",
    description: "Judoclub Michigami neemt deel aan de Survivalrun in Steenbergen (2014)",
  },
  {
    id: "judo-toernooi-berendrecht-damian",
    title: "Judo toernooi Berendrecht - Damian Leijenhorst",
    youtubeId: "_pgtfXRHw_8",
    description: "Damian Leijenhorst in actie op het judotoernooi in Berendrecht",
  },
  {
    id: "judo-exercise-tip",
    title: "Judo Excercise TIP!",
    youtubeId: "Dm-yc6HmP6U",
    description: "Handige trainingstip voor judo",
  },
  {
    id: "dutch-open-dalfsen-michigami",
    title: "Judo Dutch Open Dalfsen Michigami",
    youtubeId: "u3O_4ab5Wl4",
    description: "Dutch Open International Championships Dalfsen - Judoclub Michigami (Robert Dingenouts, Marijn van den Berg, Jacob van den Berg)",
  },
  {
    id: "judo-ekeren",
    title: "Judo Ekeren",
    youtubeId: "hfgTd18HYjY",
    description: "Judoclub Michigami op judotoernooi in Ekeren (België)",
  },
  {
    id: "latif-judo-wedstrijd-heerle",
    title: "Latif judo wedstrijd heerle",
    youtubeId: "PbBHR2RjdEE",
    description: "Latif Nurzad in actie op het toernooi in Heerle",
  },
  {
    id: "budodag-2011",
    title: "Budodag 2011",
    youtubeId: "cpRYCdZFeM0",
    description: "Judoclub Michigami Budodag 2011 - Welkom bij Judoclub Michigami Steenbergen",
  },
  {
    id: "judo-toernooi-heerle",
    title: "Judo toernooi Heerle",
    youtubeId: "GdriHR9q2Og",
    description: "Judoclub Michigami op het toernooi in Heerle",
  },
];

export const youtubeChannel = {
  url: "https://www.youtube.com/@judoclubmichigami",
  oldUrl: "https://www.youtube.com/user/JudoMichigami",
  title: "Judoclub Michigami YouTube-kanaal",
  subscribeText: "Gratis abonneren op ons YouTube-kanaal",
};
