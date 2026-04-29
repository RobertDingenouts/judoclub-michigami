// Gestructureerde exameneisen voor Judoclub Michigami Steenbergen
// Dit bestand bevat alle exameneisen voor Kyu-graden (wit t/m bruin)

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface Technique {
  id: string;
  nameJa: string;           // Japanse naam
  nameNl: string;           // Nederlandse vertaling
  forbidden?: boolean;      // Of de techniek verboden is in competitie
  description?: string;     // Optionele beschrijving
  videoUrl?: string;        // Optionele link naar uitlegvideo
}

export interface TechniqueCategory {
  id: string;
  nameJa: string;           // Japanse naam
  nameNl: string;           // Nederlandse vertaling
  techniques: Technique[];
}

export interface MainCategory {
  id: string;
  nameJa: string;
  nameNl: string;
  subcategories: TechniqueCategory[];
}

export interface BeltLevel {
  id: string;               // bv. "wit", "gele-slip", "geel"
  name: string;             // Volledige naam
  kyu: number | null;       // Kyu-graad (6 = wit, 1 = bruin), null voor slips
  color: string;            // CSS kleur
  colorName: string;        // Kleurnaam in het Nederlands
  isSlip: boolean;          // Of het een slip is
  parentBelt?: string;      // De band waar de slip op komt (voor slips)
}

export interface ExamRequirement {
  categoryId: string;       // ID van de categorie
  count: number;            // Aantal technieken dat gekend moet worden
}

export interface BeltRequirements {
  beltId: string;
  requirements: ExamRequirement[];
  nageKomi: number;         // Aantal worpen in 1 minuut
  kantelTechnieken: number; // Aantal kanteltechnieken
  ukemiWaza: number;        // Aantal valbreektechnieken (altijd 4)
}

// ============================================================================
// BANDEN EN SLIPS
// ============================================================================

export const beltLevels: BeltLevel[] = [
  { id: 'wit', name: 'Witte band', kyu: 6, color: '#FFFFFF', colorName: 'Wit', isSlip: false },
  { id: 'wit-gele-slip', name: 'Witte band met gele slip', kyu: null, color: '#FFFF00', colorName: 'Gele slip', isSlip: true, parentBelt: 'wit' },
  { id: 'geel', name: 'Gele band', kyu: 5, color: '#FFFF00', colorName: 'Geel', isSlip: false },
  { id: 'geel-oranje-slip', name: 'Gele band met oranje slip', kyu: null, color: '#FFA500', colorName: 'Oranje slip', isSlip: true, parentBelt: 'geel' },
  { id: 'oranje', name: 'Oranje band', kyu: 4, color: '#FFA500', colorName: 'Oranje', isSlip: false },
  { id: 'oranje-groene-slip', name: 'Oranje band met groene slip', kyu: null, color: '#008000', colorName: 'Groene slip', isSlip: true, parentBelt: 'oranje' },
  { id: 'groen', name: 'Groene band', kyu: 3, color: '#008000', colorName: 'Groen', isSlip: false },
  { id: 'groen-blauwe-slip', name: 'Groene band met blauwe slip', kyu: null, color: '#0000FF', colorName: 'Blauwe slip', isSlip: true, parentBelt: 'groen' },
  { id: 'blauw', name: 'Blauwe band', kyu: 2, color: '#0000FF', colorName: 'Blauw', isSlip: false },
  { id: 'blauw-bruine-slip', name: 'Blauwe band met bruine slip', kyu: null, color: '#8B4513', colorName: 'Bruine slip', isSlip: true, parentBelt: 'blauw' },
  { id: 'bruin', name: 'Bruine band', kyu: 1, color: '#8B4513', colorName: 'Bruin', isSlip: false },
];

// ============================================================================
// TECHNIEKEN - UKEMI-WAZA (VALBREEKTECHNIEKEN)
// ============================================================================

export const ukemiWaza: TechniqueCategory = {
  id: 'ukemi-waza',
  nameJa: 'Ukemi-waza',
  nameNl: 'Valbreektechnieken',
  techniques: [
    { id: 'ukemi-1', nameJa: 'Ushiro-ukemi', nameNl: 'Achterwaarts vallen' },
    { id: 'ukemi-2', nameJa: 'Yoko-ukemi', nameNl: 'Zijwaarts vallen' },
    { id: 'ukemi-3', nameJa: 'Mae-ukemi', nameNl: 'Voorwaarts vallen' },
    { id: 'ukemi-4', nameJa: 'Zenpo-kaiten', nameNl: 'Voorwaarts rollen' },
  ]
};

// ============================================================================
// TECHNIEKEN - NAGE-WAZA (WERPTECHNIEKEN)
// ============================================================================

export const nageWaza: MainCategory = {
  id: 'nage-waza',
  nameJa: 'Nage-waza',
  nameNl: 'Werptechnieken',
  subcategories: [
    // ASHI-WAZA (Beenworpen)
    {
      id: 'ashi-waza',
      nameJa: 'Ashi-waza',
      nameNl: 'Beenworpen',
      techniques: [
        { id: 'ashi-1', nameJa: 'O-soto-gari', nameNl: 'Grote buitenwaartse veeg' },
        { id: 'ashi-2', nameJa: 'De-ashi-barai', nameNl: 'Voorwaartse voetveeg' },
        { id: 'ashi-3', nameJa: 'Hiza-guruma', nameNl: 'Knie-wiel' },
        { id: 'ashi-4', nameJa: 'Ko-soto-gake', nameNl: 'Kleine binnenwaartse haak' },
        { id: 'ashi-5', nameJa: 'O-uchi-gari', nameNl: 'Grote binnenwaartse veeg' },
        { id: 'ashi-6', nameJa: 'Ko-uchi-gari', nameNl: 'Kleine binnenwaartse veeg' },
        { id: 'ashi-7', nameJa: 'Okuri-ashi-barai', nameNl: 'Dubbele voetveeg' },
        { id: 'ashi-8', nameJa: 'O-soto-guruma', nameNl: 'Grote buitenwaartse wiel' },
        { id: 'ashi-9', nameJa: 'O-soto-otoshi', nameNl: 'Grote buitenwaartse val' },
        { id: 'ashi-10', nameJa: 'Ko-soto-gari', nameNl: 'Kleine buitenwaartse veeg' },
        { id: 'ashi-11', nameJa: 'Sasae-tsurikomi-ashi', nameNl: 'Ondersteunende oplichtende voet' },
        { id: 'ashi-12', nameJa: 'Harai-tsurikomi-ashi', nameNl: 'Veeg-oplichtende voet' },
        { id: 'ashi-13', nameJa: 'Soto-gake', nameNl: 'Buitenwaartse haak' },
        { id: 'ashi-14', nameJa: 'Ko-uchi-makikomi', nameNl: 'Kleine binnenwaartse meidraai' },
        { id: 'ashi-15', nameJa: 'Ashi-guruma', nameNl: 'Been-wiel' },
      ]
    },
    // KOSHI-WAZA (Heupworpen)
    {
      id: 'koshi-waza',
      nameJa: 'Koshi-waza',
      nameNl: 'Heupworpen',
      techniques: [
        { id: 'koshi-1', nameJa: 'Uki-goshi', nameNl: 'Zwevende heupworp' },
        { id: 'koshi-2', nameJa: 'Kubi-nage', nameNl: 'Nekworp' },
        { id: 'koshi-3', nameJa: 'Tsuri-goshi', nameNl: 'Opgetilde heupworp' },
        { id: 'koshi-4', nameJa: 'Koshi-guruma', nameNl: 'Heup-wiel' },
        { id: 'koshi-5', nameJa: 'Harai-goshi', nameNl: 'Heupveeg' },
        { id: 'koshi-6', nameJa: 'Hane-goshi', nameNl: 'Springende heupworp' },
        { id: 'koshi-7', nameJa: 'Ushiro-goshi', nameNl: 'Achterwaartse heupworp' },
        { id: 'koshi-8', nameJa: 'Tsurikomi-goshi', nameNl: 'Opgetilde heupworp' },
        { id: 'koshi-9', nameJa: 'Utsuri-goshi', nameNl: 'Veranderende heupworp' },
        { id: 'koshi-10', nameJa: 'Uchi-mata', nameNl: 'Binnenwaartse dijworp' },
        { id: 'koshi-11', nameJa: 'O-goshi', nameNl: 'Grote heupworp' },
        { id: 'koshi-12', nameJa: 'Ko-tsuri-goshi', nameNl: 'Kleine opgetilde heupworp' },
        { id: 'koshi-13', nameJa: 'O-guruma', nameNl: 'Groot wiel' },
        { id: 'koshi-14', nameJa: 'Yama-arashi', nameNl: 'Bergstorm' },
        { id: 'koshi-15', nameJa: 'Obi-goshi', nameNl: 'Riemplaats heupworp' },
      ]
    },
    // KATA-WAZA (Schouderworpen) - 6 technieken
    {
      id: 'kata-waza',
      nameJa: 'Kata-waza',
      nameNl: 'Schouderworpen',
      techniques: [
        { id: 'kata-1', nameJa: 'Ippon-seoi-nage', nameNl: 'Eenarmige schouderworp' },
        { id: 'kata-2', nameJa: 'Seoi-nage', nameNl: 'Schouderworp' },
        { id: 'kata-3', nameJa: 'Kata-guruma', nameNl: 'Schouder-wiel' },
        { id: 'kata-4', nameJa: 'Seoi-otoshi', nameNl: 'Schouderval' },
        { id: 'kata-5', nameJa: 'Hidari-kata-seoi', nameNl: 'Linker schouderworp' },
        { id: 'kata-6', nameJa: 'Seoi-age', nameNl: 'Schouder optilling' },
      ]
    },
    // TE-WAZA (Armworpen)
    {
      id: 'te-waza',
      nameJa: 'Te-waza',
      nameNl: 'Armworpen',
      techniques: [
        { id: 'te-1', nameJa: 'Tai-otoshi', nameNl: 'Lichaamsval' },
        { id: 'te-2', nameJa: 'Uki-otoshi', nameNl: 'Zwevende val' },
        { id: 'te-3', nameJa: 'Hiji-otoshi', nameNl: 'Elleboogval' },
        { id: 'te-4', nameJa: 'Sukui-nage', nameNl: 'Scheppende worp' },
        { id: 'te-5', nameJa: 'Mochiage-otoshi', nameNl: 'Optillende val' },
        { id: 'te-6', nameJa: 'Sumi-otoshi', nameNl: 'Hoekval' },
        { id: 'te-7', nameJa: 'Obi-otoshi', nameNl: 'Riemval' },
        { id: 'te-8', nameJa: 'Kata-ashi-dori', nameNl: 'Eenbeenshouderworp' },
        { id: 'te-9', nameJa: 'Ryo-ashi-dori', nameNl: 'Tweebenenschouderworp' },
      ]
    },
    // SUTEMI-WAZA (Offerworpen)
    {
      id: 'sutemi-waza',
      nameJa: 'Sutemi-waza',
      nameNl: 'Offerworpen',
      techniques: [
        { id: 'sutemi-1', nameJa: 'Tomoe-nage', nameNl: 'Cirkelworp' },
        { id: 'sutemi-2', nameJa: 'Yoko-tomoe', nameNl: 'Zijwaartse cirkelworp' },
        { id: 'sutemi-3', nameJa: 'Maki-tomoe', nameNl: 'Oprollende cirkelworp' },
        { id: 'sutemi-4', nameJa: 'Soto-makikomi', nameNl: 'Buitenwaartse meidraai' },
        { id: 'sutemi-5', nameJa: 'Yoko-gake', nameNl: 'Zijwaartse val' },
        { id: 'sutemi-6', nameJa: 'Tani-otoshi', nameNl: 'Vallei-val' },
        { id: 'sutemi-7', nameJa: 'Sumi-gaeshi', nameNl: 'Hoekomdraaiing' },
        { id: 'sutemi-8', nameJa: 'Uki-waza', nameNl: 'Zwevende worp' },
        { id: 'sutemi-9', nameJa: 'Kani-basami', nameNl: 'Schaarworp', forbidden: true },
        { id: 'sutemi-10', nameJa: 'Yoko-otoshi', nameNl: 'Zijwaartse val' },
        { id: 'sutemi-11', nameJa: 'Hane-makikomi', nameNl: 'Springende meidraai' },
        { id: 'sutemi-12', nameJa: 'Ura-nage', nameNl: 'Achterwaartse worp' },
        { id: 'sutemi-13', nameJa: 'Yoko-guruma', nameNl: 'Zijwaarts wiel' },
        { id: 'sutemi-14', nameJa: 'Yoko-wakare', nameNl: 'Zijwaartse scheiding' },
        { id: 'sutemi-15', nameJa: 'Tawara-gaeshi', nameNl: 'Rijstbal-omdraaiing' },
      ]
    },
  ]
};

// ============================================================================
// TECHNIEKEN - KATAME-WAZA (CONTROLETECHNIEKEN)
// ============================================================================

export const katameWaza: MainCategory = {
  id: 'katame-waza',
  nameJa: 'Katame-waza',
  nameNl: 'Controletechnieken',
  subcategories: [
    // OSAEKOMI-WAZA (Houdgrepen)
    {
      id: 'osaekomi-waza',
      nameJa: 'Osaekomi-waza',
      nameNl: 'Houdgrepen',
      techniques: [
        { id: 'osaekomi-1', nameJa: 'Kesa-gatame', nameNl: 'Scarf-houdgreep' },
        { id: 'osaekomi-2', nameJa: 'Kuzure-kesa-gatame', nameNl: 'Gewijzigde scarf-houdgreep' },
        { id: 'osaekomi-3', nameJa: 'Kata-gatame', nameNl: 'Schouder-houdgreep' },
        { id: 'osaekomi-4', nameJa: 'Ushiro-kesa-gatame', nameNl: 'Achterwaartse scarf-houdgreep' },
        { id: 'osaekomi-5', nameJa: 'Makura-kesa-gatame', nameNl: 'Kussen scarf-houdgreep' },
        { id: 'osaekomi-6', nameJa: 'Yoko-shiho-gatame', nameNl: 'Zijwaartse vierpunt-houdgreep' },
        { id: 'osaekomi-7', nameJa: 'Kuzure-yoko-shiho-gatame', nameNl: 'Gewijzigde zijwaartse vierpunt-houdgreep' },
        { id: 'osaekomi-8', nameJa: 'Kami-shiho-gatame', nameNl: 'Boven vierpunt-houdgreep' },
        { id: 'osaekomi-9', nameJa: 'Kuzure-kami-shiho-gatame', nameNl: 'Gewijzigde boven vierpunt-houdgreep' },
        { id: 'osaekomi-10', nameJa: 'Tate-shiho-gatame', nameNl: 'Verticale vierpunt-houdgreep' },
        { id: 'osaekomi-11', nameJa: 'Kuzure-tate-shiho-gatame', nameNl: 'Gewijzigde verticale vierpunt-houdgreep' },
        { id: 'osaekomi-12', nameJa: 'Uki-gatame', nameNl: 'Zwevende houdgreep' },
        { id: 'osaekomi-13', nameJa: 'Ura-gatame', nameNl: 'Achterwaartse houdgreep' },
        { id: 'osaekomi-14', nameJa: 'Sankaku-gatame', nameNl: 'Driehoek-houdgreep' },
      ]
    },
    // SHIME-WAZA (Wurgingen)
    {
      id: 'shime-waza',
      nameJa: 'Shime-waza',
      nameNl: 'Wurgingen',
      techniques: [
        { id: 'shime-1', nameJa: 'Nami-juji-jime', nameNl: 'Gewone kruisverwurging' },
        { id: 'shime-2', nameJa: 'Gyaku-juji-jime', nameNl: 'Omgekeerde kruisverwurging' },
        { id: 'shime-3', nameJa: 'Kata-juji-jime', nameNl: 'Eenarmige kruisverwurging' },
        { id: 'shime-4', nameJa: 'Hadaka-jime', nameNl: 'Naakte verwurging' },
        { id: 'shime-5', nameJa: 'Okuri-eri-jime', nameNl: 'Dubbele reversverwurging' },
        { id: 'shime-6', nameJa: 'Kataha-jime', nameNl: 'Eenzijdige vleugelverwurging' },
        { id: 'shime-7', nameJa: 'Katate-jime', nameNl: 'Eenhandige verwurging' },
        { id: 'shime-8', nameJa: 'Ryote-jime', nameNl: 'Tweehandige verwurging' },
        { id: 'shime-9', nameJa: 'Sode-guruma-jime', nameNl: 'Mouw-wiel verwurging' },
        { id: 'shime-10', nameJa: 'Tsukkomi-jime', nameNl: 'Stoot-verwurging' },
        { id: 'shime-11', nameJa: 'Sankaku-jime', nameNl: 'Driehoek-verwurging' },
        { id: 'shime-12', nameJa: 'Do-jime', nameNl: 'Romp-verwurging', forbidden: true },
      ]
    },
    // KANSETSU-WAZA (Armklemmen)
    {
      id: 'kansetsu-waza',
      nameJa: 'Kansetsu-waza',
      nameNl: 'Armklemmen',
      techniques: [
        { id: 'kansetsu-1', nameJa: 'Juji-gatame', nameNl: 'Kruis-armklem' },
        { id: 'kansetsu-2', nameJa: 'Ude-garami', nameNl: 'Gekruiste armklem' },
        { id: 'kansetsu-3', nameJa: 'Ude-gatame', nameNl: 'Arm-houdgreep' },
        { id: 'kansetsu-4', nameJa: 'Hiza-gatame', nameNl: 'Knie-armklem' },
        { id: 'kansetsu-5', nameJa: 'Waki-gatame', nameNl: 'Oksel-armklem' },
        { id: 'kansetsu-6', nameJa: 'Hara-gatame', nameNl: 'Buik-armklem' },
        { id: 'kansetsu-7', nameJa: 'Ashi-gatame', nameNl: 'Been-armklem' },
        { id: 'kansetsu-8', nameJa: 'Te-gatame', nameNl: 'Hand-armklem' },
        { id: 'kansetsu-9', nameJa: 'Sankaku-gatame', nameNl: 'Driehoek-armklem' },
        { id: 'kansetsu-10', nameJa: 'Ashi-garami', nameNl: 'Been-klem', forbidden: true },
      ]
    },
  ]
};

// ============================================================================
// EXAMENEISEN PER BAND/SLIP
// ============================================================================

export const beltRequirements: BeltRequirements[] = [
  // Kata-waza correcte aantallen: 1,1,2,3,3,4,4,5,5,6,6 (geen decimalen!)
  {
    beltId: 'wit',
    requirements: [
      { categoryId: 'ashi-waza', count: 1 },
      { categoryId: 'koshi-waza', count: 1 },
      { categoryId: 'kata-waza', count: 1 },
      { categoryId: 'te-waza', count: 1 },
      { categoryId: 'sutemi-waza', count: 0 },
      { categoryId: 'osaekomi-waza', count: 2 },
      { categoryId: 'shime-waza', count: 0 },
      { categoryId: 'kansetsu-waza', count: 0 },
    ],
    nageKomi: 3,
    kantelTechnieken: 0,
    ukemiWaza: 4,
  },
  {
    beltId: 'wit-gele-slip',
    requirements: [
      { categoryId: 'ashi-waza', count: 2 },
      { categoryId: 'koshi-waza', count: 2 },
      { categoryId: 'kata-waza', count: 1 },
      { categoryId: 'te-waza', count: 1 },
      { categoryId: 'sutemi-waza', count: 0 },
      { categoryId: 'osaekomi-waza', count: 3 },
      { categoryId: 'shime-waza', count: 0 },
      { categoryId: 'kansetsu-waza', count: 0 },
    ],
    nageKomi: 5,
    kantelTechnieken: 1,
    ukemiWaza: 4,
  },
  {
    beltId: 'geel',
    requirements: [
      { categoryId: 'ashi-waza', count: 3 },
      { categoryId: 'koshi-waza', count: 3 },
      { categoryId: 'kata-waza', count: 2 },
      { categoryId: 'te-waza', count: 2 },
      { categoryId: 'sutemi-waza', count: 0 },
      { categoryId: 'osaekomi-waza', count: 4 },
      { categoryId: 'shime-waza', count: 0 },
      { categoryId: 'kansetsu-waza', count: 0 },
    ],
    nageKomi: 7,
    kantelTechnieken: 2,
    ukemiWaza: 4,
  },
  {
    beltId: 'geel-oranje-slip',
    requirements: [
      { categoryId: 'ashi-waza', count: 4 },
      { categoryId: 'koshi-waza', count: 4 },
      { categoryId: 'kata-waza', count: 3 },
      { categoryId: 'te-waza', count: 3 },
      { categoryId: 'sutemi-waza', count: 0 },
      { categoryId: 'osaekomi-waza', count: 5 },
      { categoryId: 'shime-waza', count: 0 },
      { categoryId: 'kansetsu-waza', count: 0 },
    ],
    nageKomi: 9,
    kantelTechnieken: 3,
    ukemiWaza: 4,
  },
  {
    beltId: 'oranje',
    requirements: [
      { categoryId: 'ashi-waza', count: 6 },
      { categoryId: 'koshi-waza', count: 6 },
      { categoryId: 'kata-waza', count: 3 },
      { categoryId: 'te-waza', count: 4 },
      { categoryId: 'sutemi-waza', count: 0 },
      { categoryId: 'osaekomi-waza', count: 7 },
      { categoryId: 'shime-waza', count: 0 },
      { categoryId: 'kansetsu-waza', count: 0 },
    ],
    nageKomi: 11,
    kantelTechnieken: 3,
    ukemiWaza: 4,
  },
  {
    beltId: 'oranje-groene-slip',
    requirements: [
      { categoryId: 'ashi-waza', count: 7 },
      { categoryId: 'koshi-waza', count: 7 },
      { categoryId: 'kata-waza', count: 4 },
      { categoryId: 'te-waza', count: 5 },
      { categoryId: 'sutemi-waza', count: 1 },
      { categoryId: 'osaekomi-waza', count: 8 },
      { categoryId: 'shime-waza', count: 2 },
      { categoryId: 'kansetsu-waza', count: 2 },
    ],
    nageKomi: 13,
    kantelTechnieken: 2,
    ukemiWaza: 4,
  },
  {
    beltId: 'groen',
    requirements: [
      { categoryId: 'ashi-waza', count: 9 },
      { categoryId: 'koshi-waza', count: 9 },
      { categoryId: 'kata-waza', count: 4 },
      { categoryId: 'te-waza', count: 6 },
      { categoryId: 'sutemi-waza', count: 3 },
      { categoryId: 'osaekomi-waza', count: 9 },
      { categoryId: 'shime-waza', count: 4 },
      { categoryId: 'kansetsu-waza', count: 3 },
    ],
    nageKomi: 15,
    kantelTechnieken: 3,
    ukemiWaza: 4,
  },
  {
    beltId: 'groen-blauwe-slip',
    requirements: [
      { categoryId: 'ashi-waza', count: 10 },
      { categoryId: 'koshi-waza', count: 10 },
      { categoryId: 'kata-waza', count: 5 },
      { categoryId: 'te-waza', count: 7 },
      { categoryId: 'sutemi-waza', count: 6 },
      { categoryId: 'osaekomi-waza', count: 10 },
      { categoryId: 'shime-waza', count: 6 },
      { categoryId: 'kansetsu-waza', count: 5 },
    ],
    nageKomi: 17,
    kantelTechnieken: 4,
    ukemiWaza: 4,
  },
  {
    beltId: 'blauw',
    requirements: [
      { categoryId: 'ashi-waza', count: 12 },
      { categoryId: 'koshi-waza', count: 12 },
      { categoryId: 'kata-waza', count: 5 },
      { categoryId: 'te-waza', count: 8 },
      { categoryId: 'sutemi-waza', count: 9 },
      { categoryId: 'osaekomi-waza', count: 11 },
      { categoryId: 'shime-waza', count: 8 },
      { categoryId: 'kansetsu-waza', count: 6 },
    ],
    nageKomi: 18,
    kantelTechnieken: 4,
    ukemiWaza: 4,
  },
  {
    beltId: 'blauw-bruine-slip',
    requirements: [
      { categoryId: 'ashi-waza', count: 13 },
      { categoryId: 'koshi-waza', count: 13 },
      { categoryId: 'kata-waza', count: 6 },
      { categoryId: 'te-waza', count: 9 },
      { categoryId: 'sutemi-waza', count: 12 },
      { categoryId: 'osaekomi-waza', count: 13 },
      { categoryId: 'shime-waza', count: 10 },
      { categoryId: 'kansetsu-waza', count: 8 },
    ],
    nageKomi: 19,
    kantelTechnieken: 5,
    ukemiWaza: 4,
  },
  {
    beltId: 'bruin',
    requirements: [
      { categoryId: 'ashi-waza', count: 15 },
      { categoryId: 'koshi-waza', count: 15 },
      { categoryId: 'kata-waza', count: 6 },
      { categoryId: 'te-waza', count: 9 },
      { categoryId: 'sutemi-waza', count: 15 },
      { categoryId: 'osaekomi-waza', count: 14 },
      { categoryId: 'shime-waza', count: 12 },
      { categoryId: 'kansetsu-waza', count: 10 },
    ],
    nageKomi: 20,
    kantelTechnieken: 5,
    ukemiWaza: 4,
  },
];

// ============================================================================
// HELPER FUNCTIES
// ============================================================================

// Haal alle categorieën op (voor iteratie)
export const getAllCategories = (): TechniqueCategory[] => {
  const categories: TechniqueCategory[] = [];
  
  // Ukemi-waza (valbreken)
  categories.push(ukemiWaza);
  
  // Nage-waza subcategorieën
  nageWaza.subcategories.forEach(sub => categories.push(sub));
  
  // Katame-waza subcategorieën
  katameWaza.subcategories.forEach(sub => categories.push(sub));
  
  return categories;
};

// Haal categorie op ID
export const getCategoryById = (id: string): TechniqueCategory | undefined => {
  return getAllCategories().find(cat => cat.id === id);
};

// Haal band niveau op ID
export const getBeltById = (id: string): BeltLevel | undefined => {
  return beltLevels.find(belt => belt.id === id);
};

// Haal exameneisen op voor een band
export const getRequirementsForBelt = (beltId: string): BeltRequirements | undefined => {
  return beltRequirements.find(req => req.beltId === beltId);
};

// Haal cumulatieve eisen op (alles wat gekend moet worden tot aan een band)
export const getCumulativeRequirements = (targetBeltId: string): { categoryId: string; count: number }[] => {
  const targetIndex = beltLevels.findIndex(belt => belt.id === targetBeltId);
  if (targetIndex === -1) return [];
  
  const cumulative: Map<string, number> = new Map();
  
  for (let i = 0; i <= targetIndex; i++) {
    const requirements = getRequirementsForBelt(beltLevels[i].id);
    if (requirements) {
      requirements.requirements.forEach(req => {
        const current = cumulative.get(req.categoryId) || 0;
        cumulative.set(req.categoryId, Math.max(current, req.count));
      });
    }
  }
  
  return Array.from(cumulative.entries()).map(([categoryId, count]) => ({
    categoryId,
    count
  }));
};

// Haal nieuwe eisen op voor een specifiek niveau (wat er nieuw bij komt)
export const getNewRequirements = (targetBeltId: string): { categoryId: string; count: number }[] => {
  const targetIndex = beltLevels.findIndex(belt => belt.id === targetBeltId);
  if (targetIndex === -1) return [];
  
  const currentRequirements = getRequirementsForBelt(targetBeltId);
  if (!currentRequirements) return [];
  
  if (targetIndex === 0) {
    // Voor witte band is alles "nieuw"
    return currentRequirements.requirements;
  }
  
  const previousBeltId = beltLevels[targetIndex - 1].id;
  const previousRequirements = getRequirementsForBelt(previousBeltId);
  
  if (!previousRequirements) return currentRequirements.requirements;
  
  const newRequirements: { categoryId: string; count: number }[] = [];
  
  currentRequirements.requirements.forEach(currentReq => {
    const prevReq = previousRequirements.requirements.find(r => r.categoryId === currentReq.categoryId);
    const prevCount = prevReq?.count || 0;
    const newCount = currentReq.count - prevCount;
    
    if (newCount > 0) {
      newRequirements.push({
        categoryId: currentReq.categoryId,
        count: newCount
      });
    }
  });
  
  return newRequirements;
};

// Bereken directe overgang tussen banden (zonder slips)
export const getDirectBeltTransition = (fromBeltId: string, toBeltId: string): { categoryId: string; count: number }[] => {
  const fromRequirements = getRequirementsForBelt(fromBeltId);
  const toRequirements = getRequirementsForBelt(toBeltId);
  
  if (!fromRequirements || !toRequirements) return [];
  
  const additionalRequirements: { categoryId: string; count: number }[] = [];
  
  toRequirements.requirements.forEach(toReq => {
    const fromReq = fromRequirements.requirements.find(r => r.categoryId === toReq.categoryId);
    const fromCount = fromReq?.count || 0;
    const additionalCount = toReq.count - fromCount;
    
    if (additionalCount > 0) {
      additionalRequirements.push({
        categoryId: toReq.categoryId,
        count: additionalCount
      });
    }
  });
  
  return additionalRequirements;
};

// Alleen banden (geen slips)
export const getOnlyBelts = (): BeltLevel[] => {
  return beltLevels.filter(belt => !belt.isSlip);
};

// Alleen slips
export const getOnlySlips = (): BeltLevel[] => {
  return beltLevels.filter(belt => belt.isSlip);
};
