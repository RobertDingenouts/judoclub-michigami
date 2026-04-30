export interface Technique {
  id: number;
  name: string;
  japanese: string;
  dutch: string;
  youtubeId?: string;
}

export interface TechniqueCategory {
  key: string;
  label: string;
  labelJp: string;
  techniques: Technique[];
}

export const techniqueCategories: TechniqueCategory[] = [
  {
    key: 'valbreken',
    label: 'Valbreken',
    labelJp: '受身',
    techniques: [
      { id: 1, name: 'Ushiro-ukemi', japanese: '後受身', dutch: 'Achterwaartse val', youtubeId: 'otB_8dt_dXo' },
      { id: 2, name: 'Yoko-ukemi', japanese: '横受身', dutch: 'Zijwaartse val', youtubeId: 'otB_8dt_dXo' },
      { id: 3, name: 'Mae-ukemi', japanese: '前受身', dutch: 'Voorwaartse val', youtubeId: 'otB_8dt_dXo' },
      { id: 4, name: 'Zenpo-kaiten-ukemi', japanese: '前方回転受身', dutch: 'Voorwaartse rolval', youtubeId: 'otB_8dt_dXo' },
    ]
  },
  {
    key: 'beenworpen',
    label: 'Beenworpen',
    labelJp: '足技',
    techniques: [
      { id: 1, name: 'O-soto-gari', japanese: '大外刈', dutch: 'Groot - buitenwaarts - maaien', youtubeId: 'c-A_nP7mKAc' },
      { id: 2, name: 'De-ashi-barai', japanese: '出足払', dutch: 'Voorwaarts - voet - vegen', youtubeId: '4BUUvqxi_Kk' },
      { id: 3, name: 'Hiza-guruma', japanese: '膝車', dutch: 'Knie - wiel', youtubeId: 'JPJx9-oAVns' },
      { id: 4, name: 'Ko-soto-gake', japanese: '小外掛', dutch: 'Klein - buitenwaarts - haken', youtubeId: '8b6kY4s4zH4' },
      { id: 5, name: 'O-uchi-gari', japanese: '大内刈', dutch: 'Groot - binnenwaarts - maaien', youtubeId: '0itJFhV9pDQ' },
      { id: 6, name: 'Ko-uchi-gari', japanese: '小内刈', dutch: 'Klein - binnenwaarts - maaien', youtubeId: '3Jb3tZvr9Ng' },
      { id: 7, name: 'Okuri-ashi-barai', japanese: '送足払', dutch: 'Beide - benen - vegen', youtubeId: 'nw1ZdRjrdRI' },
      { id: 8, name: 'O-soto-guruma', japanese: '大外車', dutch: 'Groot - buitenwaarts - wiel', youtubeId: '92KbCm6pQeI' },
      { id: 9, name: 'O-soto-otoshi', japanese: '大外落', dutch: 'Groot - buitenwaarts - laten vallen', youtubeId: '2DsVvDw7b8g' },
      { id: 10, name: 'Ko-soto-gari', japanese: '小外刈', dutch: 'Klein - buitenwaarts - maaien', youtubeId: 'jeQ541ScLB4' },
      { id: 11, name: 'Sasae-tsurikomi-ashi', japanese: '支釣込足', dutch: 'Blokkeren - trekken en optillen - been', youtubeId: '699i--pvYmE' },
      { id: 12, name: 'Harai-tsurikomi-ashi', japanese: '払釣込足', dutch: 'Vegen - trekken en optillen - been', youtubeId: 'gGPXvWL8VbE' },
      { id: 13, name: 'Soto-gake', japanese: '外掛', dutch: 'Buitenwaarts - haken' },
      { id: 14, name: 'Ko-uchi-makikomi', japanese: '小内巻込', dutch: 'Klein - binnenwaarts - oprollen', youtubeId: '_1eygIXLD_w' },
      { id: 15, name: 'Ashi-guruma', japanese: '足車', dutch: 'Been - wiel', youtubeId: 'ROeayhvom9U' },
    ]
  },
  {
    key: 'heupworpen',
    label: 'Heupworpen',
    labelJp: '腰技',
    techniques: [
      { id: 1, name: 'O-goshi', japanese: '大腰', dutch: 'Grote heupworp', youtubeId: 'ZOgccJ3dEwI' },
      { id: 2, name: 'Koshi-guruma', japanese: '腰車', dutch: 'Heup - wiel', youtubeId: 'pj_E7Ij8J3k' },
      { id: 3, name: 'Tsurikomi-goshi', japanese: '釣込腰', dutch: 'Trekken en optillen - heup', youtubeId: 'f9I5GPpF7FE' },
      { id: 4, name: 'Harai-goshi', japanese: '払腰', dutch: 'Vegen - heup', youtubeId: 'h1MIiLOKXCk' },
      { id: 5, name: 'Uki-goshi', japanese: '浮腰', dutch: 'Zwevende heupworp', youtubeId: 'B0YjqTcbDIk' },
      { id: 6, name: 'Ushiro-goshi', japanese: '後腰', dutch: 'Achterwaartse heupworp', youtubeId: 'q_85BzKvzLo' },
    ]
  },
  {
    key: 'schouderworpen',
    label: 'Schouderworpen',
    labelJp: '手技',
    techniques: [
      { id: 1, name: 'Seoi-nage', japanese: '背負投', dutch: 'Schouderworp', youtubeId: 'n1M3pXkqx8U' },
      { id: 2, name: 'Ippon-seoi-nage', japanese: '一本背負投', dutch: 'Enkelvoudige schouderworp', youtubeId: 'MBPuREkFWTE' },
      { id: 3, name: 'Morote-seoi-nage', japanese: '双手背負投', dutch: 'Tweehandige schouderworp', youtubeId: 'GzO8f4XBkEA' },
      { id: 4, name: 'Kata-guruma', japanese: '肩車', dutch: 'Schouder - wiel', youtubeId: '8VrBnRNS00w' },
    ]
  },
  {
    key: 'armworpen',
    label: 'Armworpen',
    labelJp: '手技',
    techniques: [
      { id: 1, name: 'Tai-otoshi', japanese: '体落', dutch: 'Lichaam - laten vallen', youtubeId: 'IcNT9zWv-VY' },
    ]
  },
  {
    key: 'offerworpen',
    label: 'Offerworpen',
    labelJp: '捨身技',
    techniques: [
      { id: 1, name: 'Tomoe-nage', japanese: '巴投', dutch: 'Boogworp', youtubeId: 'T3_QsasJtO0' },
      { id: 2, name: 'Ura-nage', japanese: '裏投', dutch: 'Achterwaartse worp', youtubeId: 'vXyMmWKVM6w' },
    ]
  },
  {
    key: 'houdgrepen',
    label: 'Houdgrepen',
    labelJp: '押込技',
    techniques: [
      { id: 1, name: 'Kesa-gatame', japanese: '袈裟固', dutch: 'Sjaalgreep', youtubeId: 'FJxLmKVhVBM' },
      { id: 2, name: 'Yoko-shiho-gatame', japanese: '横四方固', dutch: 'Zijwaartse vierpuntsgreep', youtubeId: 'FJxLmKVhVBM' },
      { id: 3, name: 'Kami-shiho-gatame', japanese: '上四方固', dutch: 'Bovenwaartse vierpuntsgreep', youtubeId: 'FJxLmKVhVBM' },
      { id: 4, name: 'Tate-shiho-gatame', japanese: '縦四方固', dutch: 'Langwaartse vierpuntsgreep', youtubeId: 'FJxLmKVhVBM' },
    ]
  },
  {
    key: 'wurgingen',
    label: 'Wurgingen',
    labelJp: '絞技',
    techniques: [
      { id: 1, name: 'Okuri-eri-jime', japanese: '送襟絞', dutch: 'Schuivende reversverwurging', youtubeId: 'LuE6bX2YqQc' },
      { id: 2, name: 'Kata-juji-jime', japanese: '片十字絞', dutch: 'Enkelzijdige kruisverwurging', youtubeId: 'LuE6bX2YqQc' },
      { id: 3, name: 'Hadaka-jime', japanese: '裸絞', dutch: 'Naakte verwurging', youtubeId: 'LuE6bX2YqQc' },
    ]
  },
  {
    key: 'armklemmen',
    label: 'Armklemmen',
    labelJp: '関節技',
    techniques: [
      { id: 1, name: 'Juji-gatame', japanese: '十字固', dutch: 'Kruisarmklem', youtubeId: 'm6ThdiamondQ' },
      { id: 2, name: 'Ude-garami', japanese: '腕緘', dutch: 'Armstrekker', youtubeId: 'm6ThdiamondQ' },
    ]
  },
  {
    key: 'kanteltechnieken',
    label: 'Kanteltechnieken',
    labelJp: '捨身技',
    techniques: [
      { id: 1, name: 'Uki-waza', japanese: '浮技', dutch: 'Zwevende techniek' },
      { id: 2, name: 'Yoko-wakare', japanese: '横分', dutch: 'Zijwaartse scheiding' },
    ]
  },
  {
    key: 'kata',
    label: 'Kata Series',
    labelJp: '形',
    techniques: [
      { id: 1, name: 'Nage-no-kata', japanese: '投の形', dutch: 'Vormen van werpen' },
      { id: 2, name: 'Katame-no-kata', japanese: '固の形', dutch: 'Vormen van controleren' },
    ]
  },
];
