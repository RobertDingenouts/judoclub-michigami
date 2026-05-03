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
      { id: 1, name: 'Ushiro-ukemi', japanese: '後受身', dutch: 'Achterwaartse val' },
      { id: 2, name: 'Yoko-ukemi', japanese: '横受身', dutch: 'Zijwaartse val' },
      { id: 3, name: 'Mae-ukemi', japanese: '前受身', dutch: 'Voorwaartse val' },
      { id: 4, name: 'Zenpo-kaiten-ukemi', japanese: '前方回転受身', dutch: 'Voorwaartse rolval' },
    ]
  },
  {
    key: 'heupworpen',
    label: 'Heupworpen',
    labelJp: '腰技',
    techniques: [
      { id: 1, name: 'Uki-goshi', japanese: '浮腰', dutch: 'Zwevende heupworp' },
      { id: 2, name: 'Kubi-nage', japanese: '首投', dutch: 'Nekworp' },
      { id: 3, name: 'Tsuri-goshi', japanese: '釣腰', dutch: 'Optillen heup' },
      { id: 4, name: 'Koshi-guruma', japanese: '腰車', dutch: 'Heup wiel' },
      { id: 5, name: 'Harai-goshi', japanese: '払腰', dutch: 'Vegen heup' },
      { id: 6, name: 'Hane-goshi', japanese: '跳腰', dutch: 'Springende heupworp' },
      { id: 7, name: 'Ushiro-goshi', japanese: '後腰', dutch: 'Achterwaartse heupworp' },
      { id: 8, name: 'Tsurikomi-goshi', japanese: '釣込腰', dutch: 'Trekken en optillen heup' },
      { id: 9, name: 'Utsuri-goshi', japanese: '移腰', dutch: 'Verplaatsende heupworp' },
      { id: 10, name: 'Uchi-mata', japanese: '内股', dutch: 'Binnenwaartse dij' },
      { id: 11, name: 'O-goshi', japanese: '大腰', dutch: 'Grote heupworp' },
      { id: 12, name: 'Ko-tsuri-goshi', japanese: '小釣腰', dutch: 'Kleine optil heup' },
      { id: 13, name: 'O-guruma', japanese: '大車', dutch: 'Groot wiel' },
      { id: 14, name: 'Yama-arashi', japanese: '山嵐', dutch: 'Bergstorm' },
      { id: 15, name: 'Obi-goshi', japanese: '帯腰', dutch: 'Gordel heupworp' },
    ]
  },
  {
    key: 'beenworpen',
    label: 'Beenworpen',
    labelJp: '足技',
    techniques: [
      { id: 1, name: 'O-soto-gari', japanese: '大外刈', dutch: 'Groot buitenwaarts maaien' },
      { id: 2, name: 'De-ashi-barai', japanese: '出足払', dutch: 'Voorwaarts voet vegen' },
      { id: 3, name: 'Hiza-guruma', japanese: '膝車', dutch: 'Knie wiel' },
      { id: 4, name: 'Ko-soto-gake', japanese: '小外掛', dutch: 'Klein buitenwaarts haken' },
      { id: 5, name: 'O-uchi-gari', japanese: '大内刈', dutch: 'Groot binnenwaarts maaien' },
      { id: 6, name: 'Ko-uchi-gari', japanese: '小内刈', dutch: 'Klein binnenwaarts maaien' },
      { id: 7, name: 'Okuri-ashi-barai', japanese: '送足払', dutch: 'Beide benen vegen' },
      { id: 8, name: 'O-soto-guruma', japanese: '大外車', dutch: 'Groot buitenwaarts wiel' },
      { id: 9, name: 'O-soto-otoshi', japanese: '大外落', dutch: 'Groot buitenwaarts laten vallen' },
      { id: 10, name: 'Ko-soto-gari', japanese: '小外刈', dutch: 'Klein buitenwaarts maaien' },
      { id: 11, name: 'Sasae-tsurikomi-ashi', japanese: '支釣込足', dutch: 'Blokkeren trekken optillen been' },
      { id: 12, name: 'Harai-tsurikomi-ashi', japanese: '払釣込足', dutch: 'Vegen trekken optillen been' },
      { id: 13, name: 'Soto-gake', japanese: '外掛', dutch: 'Buitenwaarts haken' },
      { id: 14, name: 'Ko-uchi-makikomi', japanese: '小内巻込', dutch: 'Klein binnenwaarts oprollen' },
      { id: 15, name: 'Ashi-guruma', japanese: '足車', dutch: 'Been wiel' },
    ]
  },
  {
    key: 'schouderworpen',
    label: 'Schouderworpen',
    labelJp: '肩技',
    techniques: [
      { id: 1, name: 'Ippon-seoi-nage', japanese: '一本背負投', dutch: 'Enkelvoudige schouderworp' },
      { id: 2, name: 'Seoi-nage', japanese: '背負投', dutch: 'Schouderworp' },
      { id: 3, name: 'Kata-guruma', japanese: '肩車', dutch: 'Schouder wiel' },
      { id: 4, name: 'Seoi-otoshi', japanese: '背負落', dutch: 'Schouder laten vallen' },
      { id: 5, name: 'Seoi-age', japanese: '背負上', dutch: 'Schouder optillen' },
    ]
  },
  {
    key: 'armworpen',
    label: 'Armworpen',
    labelJp: '手技',
    techniques: [
      { id: 1, name: 'Tai-otoshi', japanese: '体落', dutch: 'Lichaam laten vallen' },
      { id: 2, name: 'Uki-otoshi', japanese: '浮落', dutch: 'Zwevend laten vallen' },
      { id: 3, name: 'Hiji-otoshi', japanese: '肘落', dutch: 'Elbow laten vallen' },
      { id: 4, name: 'Sukui-nage', japanese: '捌投', dutch: 'Opscheppen worp' },
      { id: 5, name: 'Mochiage-otoshi', japanese: '持上落', dutch: 'Optillen laten vallen' },
      { id: 6, name: 'Sumi-otoshi', japanese: '隅落', dutch: 'Hoek laten vallen' },
      { id: 7, name: 'Obi-otoshi', japanese: '帯落', dutch: 'Gordel laten vallen' },
      { id: 8, name: 'Kata-ashi-dori', japanese: '片足取', dutch: 'Enkel been grijpen' },
      { id: 9, name: 'Ryo-ashi-dori', japanese: '両足取', dutch: 'Beide benen grijpen' },
    ]
  },
  {
    key: 'offerworpen',
    label: 'Offerworpen',
    labelJp: '捨身技',
    techniques: [
      { id: 1, name: 'Tomoe-nage', japanese: '巴投', dutch: 'Boogworp' },
      { id: 2, name: 'Yoko-tomoe', japanese: '横巴', dutch: 'Zijwaartse boogworp' },
      { id: 3, name: 'Maki-tomoe', japanese: '巻巴', dutch: 'Oprollen boogworp' },
      { id: 4, name: 'Soto-makikomi', japanese: '外巻込', dutch: 'Buitenwaarts oprollen' },
      { id: 5, name: 'Yoko-gake', japanese: '横掛', dutch: 'Zijwaartse haken' },
      { id: 6, name: 'Tani-otoshi', japanese: '谷落', dutch: 'Dal laten vallen' },
      { id: 7, name: 'Sumi-gaeshi', japanese: '隅返', dutch: 'Hoek draaien' },
      { id: 8, name: 'Uki-waza', japanese: '浮技', dutch: 'Zwevende techniek' },
      { id: 9, name: 'Yoko-otoshi', japanese: '横落', dutch: 'Zijwaarts laten vallen' },
      { id: 10, name: 'Hane-makikomi', japanese: '跳巻込', dutch: 'Springend oprollen' },
      { id: 11, name: 'Ura-nage', japanese: '裏投', dutch: 'Achterwaartse worp' },
      { id: 12, name: 'Yoko-guruma', japanese: '横車', dutch: 'Zijwaarts wiel' },
      { id: 13, name: 'Yoko-wakare', japanese: '横分', dutch: 'Zijwaartse scheiding' },
      { id: 14, name: 'Tawara-gaeshi', japanese: '俵返', dutch: 'Hooibaler draaien' },
    ]
  },
  {
    key: 'houdgrepen',
    label: 'Houdgrepen',
    labelJp: '押込技',
    techniques: [
      { id: 1, name: 'Kesa-gatame', japanese: '袈裟固', dutch: 'Sjaalgreep' },
      { id: 2, name: 'Kuzure-kesa-gatame', japanese: '崩袈裟固', dutch: 'Afgebroken sjaalgreep' },
      { id: 3, name: 'Kata-gatame', japanese: '肩固', dutch: 'Schoudergreep' },
      { id: 4, name: 'Ushiro-kesa-gatame', japanese: '後袈裟固', dutch: 'Achterwaartse sjaalgreep' },
      { id: 5, name: 'Makura-kesa-gatame', japanese: '枕袈裟固', dutch: 'Kussen sjaalgreep' },
      { id: 6, name: 'Yoko-shiho-gatame', japanese: '横四方固', dutch: 'Zijwaartse vierpuntsgreep' },
      { id: 7, name: 'Kuzure-yoko-shiho-gatame / Mune-gatame', japanese: '崩横四方固', dutch: 'Afgebroken zijwaartse vierpuntsgreep' },
      { id: 8, name: 'Kami-shiho-gatame', japanese: '上四方固', dutch: 'Bovenwaartse vierpuntsgreep' },
      { id: 9, name: 'Kuzure-kami-shiho-gatame', japanese: '崩上四方固', dutch: 'Afgebroken bovenwaartse vierpuntsgreep' },
      { id: 10, name: 'Tate-shiho-gatame', japanese: '縦四方固', dutch: 'Langwaartse vierpuntsgreep' },
      { id: 11, name: 'Kuzure-tate-shiho-gatame', japanese: '崩縦四方固', dutch: 'Afgebroken langwaartse vierpuntsgreep' },
      { id: 12, name: 'Uki-gatame', japanese: '浮固', dutch: 'Zwevende greep' },
      { id: 13, name: 'Ura-gatame', japanese: '裏固', dutch: 'Achterwaartse greep' },
      { id: 14, name: 'Sankaku-gatame', japanese: '三角固', dutch: 'Driehoeksgreep' },
    ]
  },
  {
    key: 'wurgingen',
    label: 'Wurgingen',
    labelJp: '絞技',
    techniques: [
      { id: 1, name: 'Nami-juji-jime', japanese: '波十字絞', dutch: 'Golf kruisverwurging' },
      { id: 2, name: 'Gyaku-juji-jime', japanese: '逆十字絞', dutch: 'Omgekeerde kruisverwurging' },
      { id: 3, name: 'Kata-juji-jime', japanese: '片十字絞', dutch: 'Enkelzijdige kruisverwurging' },
      { id: 4, name: 'Hadaka-jime', japanese: '裸絞', dutch: 'Naakte verwurging' },
      { id: 5, name: 'Okuri-eri-jime', japanese: '送襟絞', dutch: 'Schuivende reversverwurging' },
      { id: 6, name: 'Kataha-jime', japanese: '片手絞', dutch: 'Enkelhandige verwurging' },
      { id: 7, name: 'Katate-jime', japanese: '片手絞', dutch: 'Enkelhandige verwurging' },
      { id: 8, name: 'Ryote-jime', japanese: '両手絞', dutch: 'Tweehandige verwurging' },
      { id: 9, name: 'Sode-guruma-jime', japanese: '袖車絞', dutch: 'Mouw wiel verwurging' },
      { id: 10, name: 'Tsukkomi-jime', japanese: '突込絞', dutch: 'Indrukken verwurging' },
      { id: 11, name: 'Sankaku-jime', japanese: '三角絞', dutch: 'Driehoeksverwurging' },
    ]
  },
  {
    key: 'armklemmen',
    label: 'Armklemmen',
    labelJp: '関節技',
    techniques: [
      { id: 1, name: 'Juji-gatame', japanese: '十字固', dutch: 'Kruisarmklem' },
      { id: 2, name: 'Ude-garami', japanese: '腕緘', dutch: 'Armstrekker' },
      { id: 3, name: 'Ude-gatame', japanese: '腕固', dutch: 'Armklem' },
      { id: 4, name: 'Hiza-gatame', japanese: '膝固', dutch: 'Knieklem' },
      { id: 5, name: 'Waki-gatame', japanese: '腋固', dutch: 'Onderarmklem' },
      { id: 6, name: 'Hara-gatame', japanese: '腹固', dutch: 'Buikklem' },
      { id: 7, name: 'Ashi-gatame', japanese: '足固', dutch: 'Beenklem' },
      { id: 8, name: 'Te-gatame', japanese: '手固', dutch: 'Handklem' },
      { id: 9, name: 'Sankaku-gatame', japanese: '三角固', dutch: 'Driehoeksklem' },
    ]
  },
];
