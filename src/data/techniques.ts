// Source: Kimi K2.6 JSON structure + YouTube links from old Weebly site
// Base file: /mnt/c/ai/projecten/michigami/judo-examens-dashboard/data/exameneisen.json

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

// Mapping from Kimi JSON categories to our component keys
const categoryMap: Record<string, { key: string; label: string; labelJp: string }> = {
  'ukemi-waza': { key: 'valbreken', label: 'Valbreken', labelJp: '受身' },
  'ashi-waza': { key: 'beenworpen', label: 'Beenworpen', labelJp: '足技' },
  'koshi-waza': { key: 'heupworpen', label: 'Heupworpen', labelJp: '腰技' },
  'kata-waza': { key: 'schouderworpen', label: 'Schouderworpen', labelJp: '肩技' },
  'te-waza': { key: 'armworpen', label: 'Armworpen', labelJp: '手技' },
  'sutemi-waza': { key: 'offerworpen', label: 'Offerworpen', labelJp: '捨身技' },
  'osaekomi-waza': { key: 'houdgrepen', label: 'Houdgrepen', labelJp: '押込技' },
  'shime-waza': { key: 'wurgingen', label: 'Wurgingen', labelJp: '絞技' },
  'kansetsu-waza': { key: 'armklemmen', label: 'Armklemmen', labelJp: '関節技' },
};

// Techniques from Kimi JSON + YouTube links from old Weebly site
export const techniqueCategories: TechniqueCategory[] = [
  {
    key: 'valbreken',
    label: 'Valbreken',
    labelJp: '受身',
    techniques: [
      { id: 1, name: 'Ushiro-ukemi', japanese: '後受身', dutch: 'Achterwaarts vallen', youtubeId: '_g7rvsxTkz8' },
      { id: 2, name: 'Yoko-ukemi', japanese: '横受身', dutch: 'Zijwaarts vallen', youtubeId: 'JCwK1Ia4jsc' },
      { id: 3, name: 'Mae-ukemi', japanese: '前受身', dutch: 'Voorwaarts vallen', youtubeId: 'veM5RFdjo0U' },
      { id: 4, name: 'Zenpo-kaiten-ukemi', japanese: '前方回転受身', dutch: 'Voorwaartse rolval', youtubeId: 'kbiLot6laks' },
    ]
  },
  {
    key: 'heupworpen',
    label: 'Heupworpen',
    labelJp: '腰技',
    techniques: [
      { id: 1, name: 'Uki-goshi', japanese: '浮腰', dutch: 'Zwevende heupworp', youtubeId: 'bPKwtB4lyOQ' },
      { id: 2, name: 'Kubi-nage', japanese: '首投', dutch: 'Nekworp', youtubeId: 'F-4fyNwx52w' },
      { id: 3, name: 'Tsuri-goshi', japanese: '釣腰', dutch: 'Optillen heup', youtubeId: '51Htlp7xEvE' },
      { id: 4, name: 'Koshi-guruma', japanese: '腰車', dutch: 'Heup wiel', youtubeId: 'SU7Id6uVJ44' },
      { id: 5, name: 'Harai-goshi', japanese: '払腰', dutch: 'Vegen heup', youtubeId: 'qTo8HlAAkOo' },
      { id: 6, name: 'Hane-goshi', japanese: '跳腰', dutch: 'Springende heupworp', youtubeId: 'M9_7De6A1kk' },
      { id: 7, name: 'Ushiro-goshi', japanese: '後腰', dutch: 'Achterwaartse heupworp', youtubeId: 'ORIYstuxYT8' },
      { id: 8, name: 'Tsurikomi-goshi', japanese: '釣込腰', dutch: 'Trekken en optillen heup', youtubeId: 'McfzA0yRVt4' },
      { id: 9, name: 'Utsuri-goshi', japanese: '移腰', dutch: 'Verplaatsende heupworp', youtubeId: '4pQd_bEnlf0' },
      { id: 10, name: 'Uchi-mata', japanese: '内股', dutch: 'Binnenwaartse dij', youtubeId: 'iUpSu5J-bgw' },
      { id: 11, name: 'O-goshi', japanese: '大腰', dutch: 'Grote heupworp', youtubeId: 'yhu1mfy2vJ4' },
      { id: 12, name: 'Ko-tsuri-goshi', japanese: '小釣腰', dutch: 'Kleine optil heup' },
      { id: 13, name: 'O-guruma', japanese: '大車', dutch: 'Groot wiel', youtubeId: 'SnZciTAY9vc' },
      { id: 14, name: 'Yama-arashi', japanese: '山嵐', dutch: 'Bergstorm', youtubeId: 'MGlyKmSuzdc' },
      { id: 15, name: 'Obi-goshi', japanese: '帯腰', dutch: 'Gordel heupworp' },
    ]
  },
  {
    key: 'beenworpen',
    label: 'Beenworpen',
    labelJp: '足技',
    techniques: [
      { id: 1, name: 'O-soto-gari', japanese: '大外刈', dutch: 'Groot buitenwaarts maaien', youtubeId: 'c-A_nP7mKAc' },
      { id: 2, name: 'De-ashi-barai', japanese: '出足払', dutch: 'Voorwaarts voet vegen', youtubeId: '4BUUvqxi_Kk' },
      { id: 3, name: 'Hiza-guruma', japanese: '膝車', dutch: 'Knie wiel', youtubeId: 'JPJx9-oAVns' },
      { id: 4, name: 'Ko-soto-gake', japanese: '小外掛', dutch: 'Klein buitenwaarts haken', youtubeId: '8b6kY4s4zH4' },
      { id: 5, name: 'O-uchi-gari', japanese: '大内刈', dutch: 'Groot binnenwaarts maaien', youtubeId: '0itJFhV9pDQ' },
      { id: 6, name: 'Ko-uchi-gari', japanese: '小内刈', dutch: 'Klein binnenwaarts maaien', youtubeId: '3Jb3tZvr9Ng' },
      { id: 7, name: 'Okuri-ashi-barai', japanese: '送足払', dutch: 'Beide benen vegen', youtubeId: 'nw1ZdRjrdRI' },
      { id: 8, name: 'O-soto-guruma', japanese: '大外車', dutch: 'Groot buitenwaarts wiel', youtubeId: '92KbCm6pQeI' },
      { id: 9, name: 'O-soto-otoshi', japanese: '大外落', dutch: 'Groot buitenwaarts laten vallen', youtubeId: '2DsVvDw7b8g' },
      { id: 10, name: 'Ko-soto-gari', japanese: '小外刈', dutch: 'Klein buitenwaarts maaien', youtubeId: 'jeQ541ScLB4' },
      { id: 11, name: 'Sasae-tsurikomi-ashi', japanese: '支釣込足', dutch: 'Blokkeren trekken optillen been', youtubeId: '699i--pvYmE' },
      { id: 12, name: 'Harai-tsurikomi-ashi', japanese: '払釣込足', dutch: 'Vegen trekken optillen been', youtubeId: 'gGPXvWL8VbE' },
      { id: 13, name: 'Soto-gake', japanese: '外掛', dutch: 'Buitenwaarts haken', youtubeId: '_1eygIXLD_w' },
      { id: 14, name: 'Ko-uchi-makikomi', japanese: '小内巻込', dutch: 'Klein binnenwaarts oprollen', youtubeId: 'ROeayhvom9U' },
      { id: 15, name: 'Ashi-guruma', japanese: '足車', dutch: 'Been wiel' },
    ]
  },
  {
    key: 'schouderworpen',
    label: 'Schouderworpen',
    labelJp: '肩技',
    techniques: [
      { id: 1, name: 'Ippon-seoi-nage', japanese: '一本背負投', dutch: 'Enkelvoudige schouderworp', youtubeId: 'FQnOlCxo4oI' },
      { id: 2, name: 'Seoi-nage', japanese: '背負投', dutch: 'Schouderworp', youtubeId: 'zIq0xI0ogxk' },
      { id: 3, name: 'Kata-guruma', japanese: '肩車', dutch: 'Schouder wiel', youtubeId: 'cnHRhSy8yi4' },
      { id: 4, name: 'Seoi-otoshi', japanese: '背負落', dutch: 'Schouder laten vallen', youtubeId: 'vu1TMVNnq34' },
      { id: 5, name: 'Seoi-age', japanese: '背負上', dutch: 'Schouder optillen' },
    ]
  },
  {
    key: 'armworpen',
    label: 'Armworpen',
    labelJp: '手技',
    techniques: [
      { id: 1, name: 'Tai-otoshi', japanese: '体落', dutch: 'Lichaam laten vallen', youtubeId: '4x6S3Q-Ktv8' },
      { id: 2, name: 'Uki-otoshi', japanese: '浮落', dutch: 'Zwevend laten vallen', youtubeId: '6H5tmncOY4Q' },
      { id: 3, name: 'Hiji-otoshi', japanese: '肘落', dutch: 'Elbow laten vallen', youtubeId: 'oEI1bdbubVU' },
      { id: 4, name: 'Sukui-nage', japanese: '捌投', dutch: 'Opscheppen worp', youtubeId: 'vU6aJ2kFxoI' },
      { id: 5, name: 'Mochiage-otoshi', japanese: '持上落', dutch: 'Optillen laten vallen', youtubeId: '5lFXv3crN30' },
      { id: 6, name: 'Sumi-otoshi', japanese: '隅落', dutch: 'Hoek laten vallen', youtubeId: 'lLU9wv52ni0' },
      { id: 7, name: 'Obi-otoshi', japanese: '帯落', dutch: 'Gordel laten vallen', youtubeId: 'ff8U2TVZIYI' },
      { id: 8, name: 'Kata-ashi-dori', japanese: '片足取', dutch: 'Enkel been grijpen', youtubeId: 'VVoMqFNVGfc' },
      { id: 9, name: 'Ryo-ashi-dori', japanese: '両足取', dutch: 'Beide benen grijpen', youtubeId: 'gYwnUP0Uz-w' },
    ]
  },
  {
    key: 'offerworpen',
    label: 'Offerworpen',
    labelJp: '捨身技',
    techniques: [
      { id: 1, name: 'Tomoe-nage', japanese: '巴投', dutch: 'Boogworp', youtubeId: '880WbHvHv6A' },
      { id: 2, name: 'Yoko-tomoe', japanese: '横巴', dutch: 'Zijwaartse boogworp', youtubeId: 'lNzMK4hk-zQ' },
      { id: 3, name: 'Maki-tomoe', japanese: '巻巴', dutch: 'Oprollen boogworp', youtubeId: 'H8rnXEfyZsU' },
      { id: 4, name: 'Soto-makikomi', japanese: '外巻込', dutch: 'Buitenwaarts oprollen', youtubeId: 'bWG9O1BVKtQ' },
      { id: 5, name: 'Yoko-gake', japanese: '横掛', dutch: 'Zijwaartse haken', youtubeId: 'tP1Sj1uDfSo' },
      { id: 6, name: 'Tani-otoshi', japanese: '谷落', dutch: 'Dal laten vallen', youtubeId: '3b9Me3Fohpk' },
      { id: 7, name: 'Sumi-gaeshi', japanese: '隅返', dutch: 'Hoek draaien', youtubeId: '5VhduA5xkbA' },
      { id: 8, name: 'Uki-waza', japanese: '浮技', dutch: 'Zwevende techniek', youtubeId: 'weVOpJ63gII' },
      { id: 9, name: 'Kani-basami', japanese: '蟹鋏', dutch: 'Krab schaar (verboden)', youtubeId: 'OR-HGHnarYc' },
      { id: 10, name: 'Yoko-otoshi', japanese: '横落', dutch: 'Zijwaarts laten vallen', youtubeId: 'MnNG67pF_a0' },
      { id: 11, name: 'Hane-makikomi', japanese: '跳巻込', dutch: 'Springend oprollen', youtubeId: '6CRBGLGz9j8' },
      { id: 12, name: 'Ura-nage', japanese: '裏投', dutch: 'Achterwaartse worp', youtubeId: 'Fgi9b8DJ5sQ' },
      { id: 13, name: 'Yoko-guruma', japanese: '横車', dutch: 'Zijwaarts wiel', youtubeId: 'MehP6I5cY2c' },
      { id: 14, name: 'Yoko-wakare', japanese: '横分', dutch: 'Zijwaartse scheiding', youtubeId: 'bp1tscHlePI' },
      { id: 15, name: 'Tawara-gaeshi', japanese: '俵返', dutch: 'Hooibaler draaien', youtubeId: 'TmTWgrmViZc' },
    ]
  },
  {
    key: 'houdgrepen',
    label: 'Houdgrepen',
    labelJp: '押込技',
    techniques: [
      { id: 1, name: 'Kesa-gatame', japanese: '袈裟固', dutch: 'Sjaalgreep', youtubeId: 'NDaQuJOFBYk' },
      { id: 2, name: 'Kuzure-kesa-gatame', japanese: '崩袈裟固', dutch: 'Afgebroken sjaalgreep', youtubeId: 'Q2fb9jaoUFQ' },
      { id: 3, name: 'Kata-gatame', japanese: '肩固', dutch: 'Schoudergreep', youtubeId: 'zQR3IOXxO_Q' },
      { id: 4, name: 'Ushiro-kesa-gatame', japanese: '後袈裟固', dutch: 'Achterwaartse sjaalgreep', youtubeId: 'SBapox2M2dE' },
      { id: 5, name: 'Makura-kesa-gatame', japanese: '枕袈裟固', dutch: 'Kussen sjaalgreep', youtubeId: '2z_vnz6W-mo' },
      { id: 6, name: 'Yoko-shiho-gatame', japanese: '横四方固', dutch: 'Zijwaartse vierpuntsgreep', youtubeId: 'TT7XJVSEQxA' },
      { id: 7, name: 'Kuzure-yoko-shiho-gatame / Mune-gatame', japanese: '崩横四方固', dutch: 'Afgebroken zijwaartse vierpuntsgreep', youtubeId: 'lIt5vywPBF0' },
      { id: 8, name: 'Kami-shiho-gatame', japanese: '上四方固', dutch: 'Bovenwaartse vierpuntsgreep', youtubeId: 'HFuMjOv0WN8' },
      { id: 9, name: 'Kuzure-kami-shiho-gatame', japanese: '崩上四方固', dutch: 'Afgebroken bovenwaartse vierpuntsgreep', youtubeId: 'YUrogQWdwiY' },
      { id: 10, name: 'Tate-shiho-gatame', japanese: '縦四方固', dutch: 'Langwaartse vierpuntsgreep', youtubeId: '55-rFmBx53g' },
      { id: 11, name: 'Kuzure-tate-shiho-gatame', japanese: '崩縦四方固', dutch: 'Afgebroken langwaartse vierpuntsgreep', youtubeId: 'i9VUQhqxYJU' },
      { id: 12, name: 'Uki-gatame', japanese: '浮固', dutch: 'Zwevende greep', youtubeId: 'e_lAjik1SUM' },
      { id: 13, name: 'Ura-gatame', japanese: '裏固', dutch: 'Achterwaartse greep', youtubeId: 'eeAHZB0v3XY' },
      { id: 14, name: 'Sankaku-gatame', japanese: '三角固', dutch: 'Driehoeksgreep', youtubeId: 'fcnFgWDY0p0' },
    ]
  },
  {
    key: 'wurgingen',
    label: 'Wurgingen',
    labelJp: '絞技',
    techniques: [
      { id: 1, name: 'Nami-juji-jime', japanese: '波十字絞', dutch: 'Golf kruisverwurging', youtubeId: 'k2cHry9HByQ' },
      { id: 2, name: 'Gyaku-juji-jime', japanese: '逆十字絞', dutch: 'Omgekeerde kruisverwurging', youtubeId: 't3tQriIPdlI' },
      { id: 3, name: 'Kata-juji-jime', japanese: '片十字絞', dutch: 'Enkelzijdige kruisverwurging', youtubeId: '3VZVUAmiMD8' },
      { id: 4, name: 'Hadaka-jime', japanese: '裸絞', dutch: 'Naakte verwurging', youtubeId: '9f0n8jez7iA' },
      { id: 5, name: 'Okuri-eri-jime', japanese: '送襟絞', dutch: 'Schuivende reversverwurging', youtubeId: 'EiqyoVcIAi8' },
      { id: 6, name: 'Kataha-jime', japanese: '片手絞', dutch: 'Enkelhandige verwurging', youtubeId: 'yaTGgRjnwB8' },
      { id: 7, name: 'Katate-jime', japanese: '片手絞', dutch: 'Enkelhandige verwurging', youtubeId: 'cHeIs-fSqwE' },
      { id: 8, name: 'Ryote-jime', japanese: '両手絞', dutch: 'Tweehandige verwurging', youtubeId: '-RHC4V7TQiY' },
      { id: 9, name: 'Sode-guruma-jime', japanese: '袖車絞', dutch: 'Mouw wiel verwurging', youtubeId: 'E3nvQzClcAU' },
      { id: 10, name: 'Tsukkomi-jime', japanese: '突込絞', dutch: 'Indrukken verwurging', youtubeId: 'dKKpnD3eLcY' },
      { id: 11, name: 'Sankaku-jime', japanese: '三角絞', dutch: 'Driehoeksverwurging', youtubeId: 'lq1CUBRAm7s' },
      { id: 12, name: 'Do-jime', japanese: '胴絞', dutch: 'Buik verwurging (verboden)', youtubeId: 'D_0fFcoIbvY' },
    ]
  },
  {
    key: 'armklemmen',
    label: 'Armklemmen',
    labelJp: '関節技',
    techniques: [
      { id: 1, name: 'Juji-gatame', japanese: '十字固', dutch: 'Kruisarmklem', youtubeId: 'OWgSOlCuMXw' },
      { id: 2, name: 'Ude-garami', japanese: '腕緘', dutch: 'Armstrekker', youtubeId: 'AIlTvZb4RlE' },
      { id: 3, name: 'Ude-gatame', japanese: '腕固', dutch: 'Armklem', youtubeId: 'SBf0aTma1VI' },
      { id: 4, name: 'Hiza-gatame', japanese: '膝固', dutch: 'Knieklem', youtubeId: 'H2HtAJdiJcE' },
      { id: 5, name: 'Waki-gatame', japanese: '腋固', dutch: 'Onderarmklem', youtubeId: '8F5p1zuJRG0' },
      { id: 6, name: 'Hara-gatame', japanese: '腹固', dutch: 'Buikklem', youtubeId: 'ZzEycg8R_9M' },
      { id: 7, name: 'Ashi-gatame', japanese: '足固', dutch: 'Beenklem', youtubeId: 'ClY7g_pX-4s' },
      { id: 8, name: 'Te-gatame', japanese: '手固', dutch: 'Handklem', youtubeId: '6DnvhY0tQVM' },
      { id: 9, name: 'Sankaku-gatame', japanese: '三角固', dutch: 'Driehoeksklem', youtubeId: 'WefAmW4azhk' },
    ]
  },
];
