export interface MusicTrack {
  title: string;
  src: string;
  duration: number;
  hasVideo?: boolean;
  youtubeId?: string;
}

export interface MusicAlbum {
  id: string;
  name: string;
  artist: string;
  description: string;
  cover: string;
  accent: string;
  tracks: MusicTrack[];
}

export const MUSIC_ALBUMS: MusicAlbum[] = [
  {
    id: "japanese-music",
    name: "Japanese Music",
    artist: "Robas",
    description: "Traditionele Japanse soundtrack — van dojo-gestoel tot taiko-storm. Perfect voor concentratie en de Japanse cultuur achter judo.",
    cover: "/data/mp3/judo/covers/japanese-music.jpg",
    accent: "#0f4c5c",
    tracks: [
      { title: "Samurai Grind", src: "/data/mp3/judo/japanese-music/16_Samurai_Grind.mp3", duration: 129 },
      { title: "Dragon Force", src: "/data/mp3/judo/japanese-music/18_Dragon_Force.mp3", duration: 122 },
      { title: "Final Round", src: "/data/mp3/judo/japanese-music/20_Final_Round.mp3", duration: 163 },
      { title: "Doujou", src: "/data/mp3/judo/japanese-music/JPN_01_doujou.mp3", duration: 100 },
      { title: "Ippon", src: "/data/mp3/judo/japanese-music/JPN_02_ippon.mp3", duration: 104 },
      { title: "Michigami", src: "/data/mp3/judo/japanese-music/JPN_03_michigami.mp3", duration: 119 },
      { title: "Sensei", src: "/data/mp3/judo/japanese-music/JPN_04_sensei.mp3", duration: 90 },
      { title: "Hajime", src: "/data/mp3/judo/japanese-music/JPN_05_hajime.mp3", duration: 125 },
      { title: "Yame", src: "/data/mp3/judo/japanese-music/JPN_06_yame.mp3", duration: 130 },
      { title: "Rei", src: "/data/mp3/judo/japanese-music/JPN_07_rei.mp3", duration: 115 },
      { title: "Seishin", src: "/data/mp3/judo/japanese-music/JPN_08_seishin.mp3", duration: 149 },
      { title: "Shizen", src: "/data/mp3/judo/japanese-music/JPN_09_shizen.mp3", duration: 122 },
      { title: "Budo", src: "/data/mp3/judo/japanese-music/JPN_10_budo.mp3", duration: 114 },
      { title: "Taiko Storm", src: "/data/mp3/judo/japanese-music/JPN_13_taiko_storm.mp3", duration: 84 },
      { title: "Kimono", src: "/data/mp3/judo/japanese-music/JPN_14_kimono.mp3", duration: 85 },
      { title: "Sakura", src: "/data/mp3/judo/japanese-music/JPN_15_sakura.mp3", duration: 90 },
      { title: "Samurai", src: "/data/mp3/judo/japanese-music/JPN_16_samurai.mp3", duration: 90 },
      { title: "Zen", src: "/data/mp3/judo/japanese-music/JPN_17_zen.mp3", duration: 76 },
      { title: "Uchi Mata", src: "/data/mp3/judo/japanese-music/JPN_18_uchi_mata.mp3", duration: 55 },
      { title: "Kata", src: "/data/mp3/judo/japanese-music/JPN_19_kata.mp3", duration: 76 },
      { title: "Nage Waza", src: "/data/mp3/judo/japanese-music/JPN_20_nage_waza.mp3", duration: 79 },
      { title: "Ne Waza", src: "/data/mp3/judo/japanese-music/JPN_21_ne_waza.mp3", duration: 113 },
      { title: "Hakama", src: "/data/mp3/judo/japanese-music/JPN_22_hakama.mp3", duration: 97 },
      { title: "Mushin", src: "/data/mp3/judo/japanese-music/JPN_23_mushin.mp3", duration: 68 },
    ],
  },
  {
    id: "judoclub-michigami",
    name: "Judoclub Michigami",
    artist: "Robas",
    description: "Ons eigen clubalbum — van hymne tot dojo-reggae. De klank van Judoclub Michigami, voor jong en oud.",
    cover: "/data/mp3/judo/covers/judoclub-michigami.jpg",
    accent: "#a90000",
    tracks: [
      { title: "Judoclub Michigami Anthem", src: "/data/mp3/judo/judoclub-michigami/JDM_01_Judoclub_Michigami_Anthem.mp3", duration: 128 },
      { title: "Respect In De Dojo", src: "/data/mp3/judo/judoclub-michigami/JDM_02_Respect_in_de_Dojo.mp3", duration: 130 },
      { title: "Osaku Rei", src: "/data/mp3/judo/judoclub-michigami/JDM_03_Osaku_Rei.mp3", duration: 81 },
      { title: "Randori Kracht", src: "/data/mp3/judo/judoclub-michigami/JDM_04_Randori_Kracht.mp3", duration: 68 },
      { title: "Jita Kyoei", src: "/data/mp3/judo/judoclub-michigami/JDM_05_Jita_Kyoei.mp3", duration: 85 },
      { title: "Seiryoku Zenyo", src: "/data/mp3/judo/judoclub-michigami/JDM_06_Seiryoku_Zenyo.mp3", duration: 55 },
      { title: "Taikai Tijd", src: "/data/mp3/judo/judoclub-michigami/JDM_07_Taikai_Tijd.mp3", duration: 138 },
      { title: "Judo Familie", src: "/data/mp3/judo/judoclub-michigami/JDM_08_Judo_Familie.mp3", duration: 85 },
      { title: "Judo Waarden", src: "/data/mp3/judo/judoclub-michigami/JDM_13_Judo_Waarden.mp3", duration: 114 },
      { title: "Vallen En Opstaan", src: "/data/mp3/judo/judoclub-michigami/JDM_14_Vallen_en_Opstaan.mp3", duration: 35 },
      { title: "Michigami Vibes", src: "/data/mp3/judo/judoclub-michigami/JDM_17_Michigami_Vibes.mp3", duration: 71 },
      { title: "Dojo Reggae", src: "/data/mp3/judo/judoclub-michigami/JDM_18_Dojo_Reggae.mp3", duration: 105 },
      { title: "Samen Trainen", src: "/data/mp3/judo/judoclub-michigami/JDM_21_Samen_Trainen.mp3", duration: 177 },
      { title: "Positive Judo Vibes", src: "/data/mp3/judo/judoclub-michigami/JDM_24_Positive_Judo_Vibes.mp3", duration: 98 },
      { title: "Michigami Fight", src: "/data/mp3/judo/judoclub-michigami/JDM_25_Michigami_Fight.mp3", duration: 54 },
      { title: "Dojo Dream", src: "/data/mp3/judo/judoclub-michigami/JDM_27_Dojo_Dream.mp3", duration: 85 },
      { title: "Respect Kpop", src: "/data/mp3/judo/judoclub-michigami/JDM_29_Respect_Kpop.mp3", duration: 38 },
      { title: "Michigami Forever", src: "/data/mp3/judo/judoclub-michigami/JDM_30_Michigami_Forever.mp3", duration: 117 },
    ],
  },
  {
    id: "summer-vibes",
    name: "Summer Vibes",
    artist: "Robas",
    description: "Zomers geluid: zonsondergang, avondbries en nachtelijke training. Met musicvideos bij elk nummer.",
    cover: "/data/mp3/judo/covers/summer-vibes.jpg",
    accent: "#d4a843",
    tracks: [
      { title: "Zonsondergang Vakantie", src: "/data/mp3/judo/summer-vibes/01_Zonsondergang_Vakantie.mp3", duration: 170, hasVideo: true , youtubeId: "cFVIQKa9Diw" },
      { title: "Avondbries Dojo", src: "/data/mp3/judo/summer-vibes/02_Avondbries_Dojo.mp3", duration: 225, hasVideo: true , youtubeId: "IKuc4Yh8Xg0" },
      { title: "Avondbries Strand", src: "/data/mp3/judo/summer-vibes/02_Avondbries_Strand.mp3", duration: 168, hasVideo: true , youtubeId: "pnqLhLIOoNc" },
      { title: "Vuur Op Het Strand", src: "/data/mp3/judo/summer-vibes/03_Vuur_op_het_Strand.mp3", duration: 195, hasVideo: true, youtubeId: "Qwk5lBBa8SY" },
      { title: "Staal En Zand", src: "/data/mp3/judo/summer-vibes/04_Staal_en_Zand.mp3", duration: 184, hasVideo: true, youtubeId: "Mi4kPPh5UiU" },
      { title: "Nacht Op Het Strand", src: "/data/mp3/judo/summer-vibes/05_Nacht_op_het_Strand.mp3", duration: 210, hasVideo: true, youtubeId: "F40xTx94QCo" },
      { title: "Nachttraining", src: "/data/mp3/judo/summer-vibes/05_Nachttraining.mp3", duration: 236, hasVideo: true , youtubeId: "nrVS2j1nggo" },
      { title: "Kracht Van De Zon", src: "/data/mp3/judo/summer-vibes/06_Kracht_van_de_Zon.mp3", duration: 179, hasVideo: true, youtubeId: "lL2joJs9cOQ" },
      { title: "Wind Door De Duinen", src: "/data/mp3/judo/summer-vibes/07_Wind_door_de_Duinen.mp3", duration: 240, hasVideo: true, youtubeId: "ru0e5syVDUk" },
      { title: "Laatste Zonnestraal", src: "/data/mp3/judo/summer-vibes/09_Laatste_Zonnestraal.mp3", duration: 182, hasVideo: true , youtubeId: "zZRONicwkU0" },
      { title: "Warrior Rain", src: "/data/mp3/judo/summer-vibes/09_Warrior_Rain.mp3", duration: 120, hasVideo: true , youtubeId: "IteW43KJbyY" },
    ],
  },
];
