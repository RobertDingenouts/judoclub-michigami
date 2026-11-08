// Belt levels (including slips)
export interface BeltLevel {
  id: string;
  name: string;
  kyu: number | null;
  color: string;
  colorName: string;
  isSlip: boolean;
  parentBelt?: string;
  sortOrder: number;
}

export interface TechniqueCategory {
  id: string;
  parent: string | null;
  nameJa: string;
  nameNl: string;
}

export interface Technique {
  id: string;
  nameJa: string;
  nameNl: string;
  forbidden: boolean;
}

export interface BeltRequirement {
  beltId: string;
  requirements: Record<string, number>; // categoryId -> count
  nageKomi: number;
  kantelTechnieken: number;
  ukemiWaza: number;
}

export const beltLevels: BeltLevel[] = [
  { id: "wit", name: "Witte band", kyu: 6, color: "#FFFFFF", colorName: "Wit", isSlip: false, sortOrder: 1 },
  { id: "wit-gele-slip", name: "Witte band met gele slip", kyu: null, color: "#FFFF00", colorName: "Gele slip", isSlip: true, parentBelt: "wit", sortOrder: 2 },
  { id: "geel", name: "Gele band", kyu: 5, color: "#FFFF00", colorName: "Geel", isSlip: false, sortOrder: 3 },
  { id: "geel-oranje-slip", name: "Gele band met oranje slip", kyu: null, color: "#FFA500", colorName: "Oranje slip", isSlip: true, parentBelt: "geel", sortOrder: 4 },
  { id: "oranje", name: "Oranje band", kyu: 4, color: "#FFA500", colorName: "Oranje", isSlip: false, sortOrder: 5 },
  { id: "oranje-groene-slip", name: "Oranje band met groene slip", kyu: null, color: "#008000", colorName: "Groene slip", isSlip: true, parentBelt: "oranje", sortOrder: 6 },
  { id: "groen", name: "Groene band", kyu: 3, color: "#008000", colorName: "Groen", isSlip: false, sortOrder: 7 },
  { id: "groen-blauwe-slip", name: "Groene band met blauwe slip", kyu: null, color: "#0000FF", colorName: "Blauwe slip", isSlip: true, parentBelt: "groen", sortOrder: 8 },
  { id: "blauw", name: "Blauwe band", kyu: 2, color: "#0000FF", colorName: "Blauw", isSlip: false, sortOrder: 9 },
  { id: "blauw-bruine-slip", name: "Blauwe band met bruine slip", kyu: null, color: "#8B4513", colorName: "Bruine slip", isSlip: true, parentBelt: "blauw", sortOrder: 10 },
  { id: "bruin", name: "Bruine band", kyu: 1, color: "#8B4513", colorName: "Bruin", isSlip: false, sortOrder: 11 }
];

export const techniqueCategories: TechniqueCategory[] = [
  { id: "ukemi-waza", parent: null, nameJa: "Ukemi-waza", nameNl: "Valbreektechnieken" },
  { id: "nage-waza", parent: null, nameJa: "Nage-waza", nameNl: "Werptechnieken" },
  { id: "ashi-waza", parent: "nage-waza", nameJa: "Ashi-waza", nameNl: "Beenworpen" },
  { id: "koshi-waza", parent: "nage-waza", nameJa: "Koshi-waza", nameNl: "Heupworpen" },
  { id: "kata-waza", parent: "nage-waza", nameJa: "Kata-waza", nameNl: "Schouderworpen" },
  { id: "te-waza", parent: "nage-waza", nameJa: "Te-waza", nameNl: "Armworpen" },
  { id: "sutemi-waza", parent: "nage-waza", nameJa: "Sutemi-waza", nameNl: "Offerworpen" },
  { id: "katame-waza", parent: null, nameJa: "Katame-waza", nameNl: "Controletechnieken" },
  { id: "osaekomi-waza", parent: "katame-waza", nameJa: "Osaekomi-waza", nameNl: "Houdgrepen" },
  { id: "shime-waza", parent: "katame-waza", nameJa: "Shime-waza", nameNl: "Wurgingen" },
  { id: "kansetsu-waza", parent: "katame-waza", nameJa: "Kansetsu-waza", nameNl: "Armklemmen" }
];

// ALL techniques per category
export const techniques: Record<string, Technique[]> = {
  "ukemi-waza": [
    { id: "ukemi-1", nameJa: "Ushiro-ukemi", nameNl: "Achterwaartse val", forbidden: false },
    { id: "ukemi-2", nameJa: "Yoko-ukemi", nameNl: "Zijwaartse val", forbidden: false },
    { id: "ukemi-3", nameJa: "Mae-ukemi", nameNl: "Voorwaartse val", forbidden: false },
    { id: "ukemi-4", nameJa: "Zenpo-kaiten", nameNl: "Voorwaartse judorol", forbidden: false }
  ],
  "ashi-waza": [
    { id: "ashi-1", nameJa: "O-soto-gari", nameNl: "Grote buitenwaartse maai", forbidden: false },
    { id: "ashi-2", nameJa: "De-ashi-barai", nameNl: "Voetveeg", forbidden: false },
    { id: "ashi-3", nameJa: "Hiza-guruma", nameNl: "Kniewiel", forbidden: false },
    { id: "ashi-4", nameJa: "Ko-soto-gake", nameNl: "Kleine buitenwaartse haak", forbidden: false },
    { id: "ashi-5", nameJa: "O-uchi-gari", nameNl: "Grote binnenwaartse maai", forbidden: false },
    { id: "ashi-6", nameJa: "Ko-uchi-gari", nameNl: "Kleine binnenwaartse maai", forbidden: false },
    { id: "ashi-7", nameJa: "Okuri-ashi-barai", nameNl: "Beide voeten vegen", forbidden: false },
    { id: "ashi-8", nameJa: "O-soto-guruma", nameNl: "Groot buitenwaarts wiel", forbidden: false },
    { id: "ashi-9", nameJa: "O-soto-otoshi", nameNl: "Grote buitenwaartse val", forbidden: false },
    { id: "ashi-10", nameJa: "Ko-soto-gari", nameNl: "Kleine buitenwaartse maai", forbidden: false },
    { id: "ashi-11", nameJa: "Sasae-tsurikomi-ashi", nameNl: "Blokkerende hef-trek voetworp", forbidden: false },
    { id: "ashi-12", nameJa: "Harai-tsurikomi-ashi", nameNl: "Hef-trek voetveeg", forbidden: false },
    { id: "ashi-13", nameJa: "Soto-gake", nameNl: "Buitenwaartse haak", forbidden: false },
    { id: "ashi-14", nameJa: "Ko-uchi-makikomi", nameNl: "Kleine binnenwaartse oprolworp", forbidden: false },
    { id: "ashi-15", nameJa: "Ashi-guruma", nameNl: "Beenwiel", forbidden: false }
  ],
  "koshi-waza": [
    { id: "koshi-1", nameJa: "Uki-goshi", nameNl: "Drijvende heupworp", forbidden: false },
    { id: "koshi-2", nameJa: "Kubi-nage", nameNl: "Nekworp", forbidden: false },
    { id: "koshi-3", nameJa: "Tsuri-goshi", nameNl: "Hef-heupworp", forbidden: false },
    { id: "koshi-4", nameJa: "Koshi-guruma", nameNl: "Heupwiel", forbidden: false },
    { id: "koshi-5", nameJa: "Harai-goshi", nameNl: "Heupveeg", forbidden: false },
    { id: "koshi-6", nameJa: "Hane-goshi", nameNl: "Springende heupworp", forbidden: false },
    { id: "koshi-7", nameJa: "Ushiro-goshi", nameNl: "Achterwaartse heupworp", forbidden: false },
    { id: "koshi-8", nameJa: "Tsurikomi-goshi", nameNl: "Hef-trek heupworp", forbidden: false },
    { id: "koshi-9", nameJa: "Utsuri-goshi", nameNl: "Verplaatsende heupworp", forbidden: false },
    { id: "koshi-10", nameJa: "Uchi-mata", nameNl: "Binnenwaartse dijworp", forbidden: false },
    { id: "koshi-11", nameJa: "O-goshi", nameNl: "Grote heupworp", forbidden: false },
    { id: "koshi-12", nameJa: "Ko-tsuri-goshi", nameNl: "Kleine hef-heupworp", forbidden: false },
    { id: "koshi-13", nameJa: "O-guruma", nameNl: "Groot wiel", forbidden: false },
    { id: "koshi-14", nameJa: "Yama-arashi", nameNl: "Bergstorm", forbidden: false },
    { id: "koshi-15", nameJa: "Obi-goshi", nameNl: "Band-heupworp", forbidden: false }
  ],
  "kata-waza": [
    { id: "kata-1", nameJa: "Ippon-seoi-nage", nameNl: "Eénpunts schouderworp", forbidden: false },
    { id: "kata-2", nameJa: "Seoi-nage", nameNl: "Schouderworp", forbidden: false },
    { id: "kata-3", nameJa: "Kata-guruma", nameNl: "Schouderwiel", forbidden: false },
    { id: "kata-4", nameJa: "Seoi-otoshi", nameNl: "Schouderval", forbidden: false },
    { id: "kata-5", nameJa: "Hidari-kata-seoi", nameNl: "Linkse schouderworp", forbidden: false },
    { id: "kata-6", nameJa: "Seoi-age", nameNl: "Opgetilde schouderworp", forbidden: false }
  ],
  "te-waza": [
    { id: "te-1", nameJa: "Tai-otoshi", nameNl: "Lichaamsval", forbidden: false },
    { id: "te-2", nameJa: "Uki-otoshi", nameNl: "Drijvende val", forbidden: false },
    { id: "te-3", nameJa: "Hiji-otoshi", nameNl: "Elleboogval", forbidden: false },
    { id: "te-4", nameJa: "Sukui-nage", nameNl: "Schepworp", forbidden: false },
    { id: "te-5", nameJa: "Mochiage-otoshi", nameNl: "Opgetilde val", forbidden: false },
    { id: "te-6", nameJa: "Sumi-otoshi", nameNl: "Hoekval", forbidden: false },
    { id: "te-7", nameJa: "Obi-otoshi", nameNl: "Band-val", forbidden: false },
    { id: "te-8", nameJa: "Kata-ashi-dori", nameNl: "Grijpen van één been", forbidden: false },
    { id: "te-9", nameJa: "Ryo-ashi-dori", nameNl: "Grijpen van beide benen", forbidden: false }
  ],
  "sutemi-waza": [
    { id: "sutemi-1", nameJa: "Tomoe-nage", nameNl: "Cirkelworp", forbidden: false },
    { id: "sutemi-2", nameJa: "Yoko-tomoe", nameNl: "Zijwaartse cirkelworp", forbidden: false },
    { id: "sutemi-3", nameJa: "Maki-tomoe", nameNl: "Oprollende cirkelworp", forbidden: false },
    { id: "sutemi-4", nameJa: "Soto-makikomi", nameNl: "Buitenwaartse oprolworp", forbidden: false },
    { id: "sutemi-5", nameJa: "Yoko-gake", nameNl: "Zijwaartse haak", forbidden: false },
    { id: "sutemi-6", nameJa: "Tani-otoshi", nameNl: "Dalval", forbidden: false },
    { id: "sutemi-7", nameJa: "Sumi-gaeshi", nameNl: "Hoek-overname", forbidden: false },
    { id: "sutemi-8", nameJa: "Uki-waza", nameNl: "Drijvende offerworp", forbidden: false },
    { id: "sutemi-9", nameJa: "Kani-basami", nameNl: "Schaarworp", forbidden: true },
    { id: "sutemi-10", nameJa: "Yoko-otoshi", nameNl: "Zijwaartse val", forbidden: false },
    { id: "sutemi-11", nameJa: "Hane-makikomi", nameNl: "Springende oprolworp", forbidden: false },
    { id: "sutemi-12", nameJa: "Ura-nage", nameNl: "Achterwaartse worp", forbidden: false },
    { id: "sutemi-13", nameJa: "Yoko-guruma", nameNl: "Zijwaarts wiel", forbidden: false },
    { id: "sutemi-14", nameJa: "Yoko-wakare", nameNl: "Zijwaartse scheiding", forbidden: false },
    { id: "sutemi-15", nameJa: "Tawara-gaeshi", nameNl: "Rijstbaal-overname", forbidden: false }
  ],
  "osaekomi-waza": [
    { id: "osaekomi-1", nameJa: "Kesa-gatame", nameNl: "Zijwaartse houdgreep", forbidden: false },
    { id: "osaekomi-2", nameJa: "Kuzure-kesa-gatame", nameNl: "Variatie op kesa-gatame", forbidden: false },
    { id: "osaekomi-3", nameJa: "Kata-gatame", nameNl: "Schouderhoudgreep", forbidden: false },
    { id: "osaekomi-4", nameJa: "Ushiro-kesa-gatame", nameNl: "Omgekeerde kesa-gatame", forbidden: false },
    { id: "osaekomi-5", nameJa: "Makura-kesa-gatame", nameNl: "Hoofdkussen kesa-gatame", forbidden: false },
    { id: "osaekomi-6", nameJa: "Yoko-shiho-gatame", nameNl: "Zijwaartse 4-punten houdgreep", forbidden: false },
    { id: "osaekomi-7", nameJa: "Kuzure-yoko-shiho-gatame", nameNl: "Variatie op yoko-shiho-gatame", forbidden: false },
    { id: "osaekomi-8", nameJa: "Kami-shiho-gatame", nameNl: "Houdgreep vanaf hoofdeinde", forbidden: false },
    { id: "osaekomi-9", nameJa: "Kuzure-kami-shiho-gatame", nameNl: "Variatie op kami-shiho-gatame", forbidden: false },
    { id: "osaekomi-10", nameJa: "Tate-shiho-gatame", nameNl: "Gestrekte 4-punten houdgreep", forbidden: false },
    { id: "osaekomi-11", nameJa: "Kuzure-tate-shiho-gatame", nameNl: "Variatie op tate-shiho-gatame", forbidden: false },
    { id: "osaekomi-12", nameJa: "Uki-gatame", nameNl: "Drijvende houdgreep", forbidden: false },
    { id: "osaekomi-13", nameJa: "Ura-gatame", nameNl: "Omgekeerde houdgreep", forbidden: false },
    { id: "osaekomi-14", nameJa: "Sankaku-gatame", nameNl: "Driehoeks-armklem", forbidden: false }
  ],
  "shime-waza": [
    { id: "shime-1", nameJa: "Nami-juji-jime", nameNl: "Normale gekruiste verwurging", forbidden: false },
    { id: "shime-2", nameJa: "Gyaku-juji-jime", nameNl: "Omgekeerde gekruiste verwurging", forbidden: false },
    { id: "shime-3", nameJa: "Kata-juji-jime", nameNl: "Half gekruiste verwurging", forbidden: false },
    { id: "shime-4", nameJa: "Hadaka-jime", nameNl: "Naakte verwurging", forbidden: false },
    { id: "shime-5", nameJa: "Okuri-eri-jime", nameNl: "Verwurging met beide revers", forbidden: false },
    { id: "shime-6", nameJa: "Kataha-jime", nameNl: "Verwurging met één vleugel", forbidden: false },
    { id: "shime-7", nameJa: "Katate-jime", nameNl: "Eénhandige verwurging", forbidden: false },
    { id: "shime-8", nameJa: "Ryote-jime", nameNl: "Tweehandige verwurging", forbidden: false },
    { id: "shime-9", nameJa: "Sode-guruma-jime", nameNl: "Mouw-wiel verwurging", forbidden: false },
    { id: "shime-10", nameJa: "Tsukkomi-jime", nameNl: "Instekende verwurging", forbidden: false },
    { id: "shime-11", nameJa: "Sankaku-jime", nameNl: "Driehoeksverwurging", forbidden: false },
    { id: "shime-12", nameJa: "Do-jime", nameNl: "Romp-verwurging", forbidden: true }
  ],
  "kansetsu-waza": [
    { id: "kansetsu-1", nameJa: "Juji-gatame", nameNl: "Gekruiste armklem", forbidden: false },
    { id: "kansetsu-2", nameJa: "Ude-garami", nameNl: "Gestrengelde armklem", forbidden: false },
    { id: "kansetsu-3", nameJa: "Ude-gatame", nameNl: "Arm-houdgreep/klem", forbidden: false },
    { id: "kansetsu-4", nameJa: "Hiza-gatame", nameNl: "Knie-armklem", forbidden: false },
    { id: "kansetsu-5", nameJa: "Waki-gatame", nameNl: "Okselklem", forbidden: false },
    { id: "kansetsu-6", nameJa: "Hara-gatame", nameNl: "Buikklem", forbidden: false },
    { id: "kansetsu-7", nameJa: "Ashi-gatame", nameNl: "Been-armklem", forbidden: false },
    { id: "kansetsu-8", nameJa: "Te-gatame", nameNl: "Hand-armklem", forbidden: false },
    { id: "kansetsu-9", nameJa: "Sankaku-gatame", nameNl: "Driehoeks-armklem", forbidden: false },
    { id: "kansetsu-10", nameJa: "Ashi-garami", nameNl: "Been-klem", forbidden: true }
  ]
};

export const beltRequirements: BeltRequirement[] = [
  { beltId: "wit", requirements: { "ashi-waza": 1, "koshi-waza": 1, "kata-waza": 1, "te-waza": 1, "sutemi-waza": 0, "osaekomi-waza": 2, "shime-waza": 0, "kansetsu-waza": 0 }, nageKomi: 3, kantelTechnieken: 0, ukemiWaza: 4 },
  { beltId: "wit-gele-slip", requirements: { "ashi-waza": 2, "koshi-waza": 2, "kata-waza": 1, "te-waza": 1, "sutemi-waza": 0, "osaekomi-waza": 3, "shime-waza": 0, "kansetsu-waza": 0 }, nageKomi: 5, kantelTechnieken: 1, ukemiWaza: 4 },
  { beltId: "geel", requirements: { "ashi-waza": 3, "koshi-waza": 3, "kata-waza": 2, "te-waza": 2, "sutemi-waza": 0, "osaekomi-waza": 4, "shime-waza": 0, "kansetsu-waza": 0 }, nageKomi: 7, kantelTechnieken: 2, ukemiWaza: 4 },
  { beltId: "geel-oranje-slip", requirements: { "ashi-waza": 4, "koshi-waza": 4, "kata-waza": 3, "te-waza": 3, "sutemi-waza": 0, "osaekomi-waza": 5, "shime-waza": 0, "kansetsu-waza": 0 }, nageKomi: 9, kantelTechnieken: 3, ukemiWaza: 4 },
  { beltId: "oranje", requirements: { "ashi-waza": 6, "koshi-waza": 6, "kata-waza": 3, "te-waza": 4, "sutemi-waza": 0, "osaekomi-waza": 7, "shime-waza": 0, "kansetsu-waza": 0 }, nageKomi: 11, kantelTechnieken: 3, ukemiWaza: 4 },
  { beltId: "oranje-groene-slip", requirements: { "ashi-waza": 7, "koshi-waza": 7, "kata-waza": 4, "te-waza": 5, "sutemi-waza": 1, "osaekomi-waza": 8, "shime-waza": 2, "kansetsu-waza": 2 }, nageKomi: 13, kantelTechnieken: 2, ukemiWaza: 4 },
  { beltId: "groen", requirements: { "ashi-waza": 9, "koshi-waza": 9, "kata-waza": 4, "te-waza": 6, "sutemi-waza": 3, "osaekomi-waza": 9, "shime-waza": 4, "kansetsu-waza": 3 }, nageKomi: 15, kantelTechnieken: 3, ukemiWaza: 4 },
  { beltId: "groen-blauwe-slip", requirements: { "ashi-waza": 10, "koshi-waza": 10, "kata-waza": 5, "te-waza": 7, "sutemi-waza": 6, "osaekomi-waza": 10, "shime-waza": 6, "kansetsu-waza": 5 }, nageKomi: 17, kantelTechnieken: 4, ukemiWaza: 4 },
  { beltId: "blauw", requirements: { "ashi-waza": 12, "koshi-waza": 12, "kata-waza": 5, "te-waza": 8, "sutemi-waza": 9, "osaekomi-waza": 11, "shime-waza": 8, "kansetsu-waza": 6 }, nageKomi: 18, kantelTechnieken: 4, ukemiWaza: 4 },
  { beltId: "blauw-bruine-slip", requirements: { "ashi-waza": 13, "koshi-waza": 13, "kata-waza": 6, "te-waza": 9, "sutemi-waza": 12, "osaekomi-waza": 13, "shime-waza": 10, "kansetsu-waza": 8 }, nageKomi: 19, kantelTechnieken: 5, ukemiWaza: 4 },
  { beltId: "bruin", requirements: { "ashi-waza": 15, "koshi-waza": 15, "kata-waza": 6, "te-waza": 9, "sutemi-waza": 15, "osaekomi-waza": 14, "shime-waza": 12, "kansetsu-waza": 10 }, nageKomi: 20, kantelTechnieken: 5, ukemiWaza: 4 }
];

// Helper function: get techniques assigned to a specific belt (first N from each category based on requirements)
export function getTechniquesForBelt(beltId: string): Record<string, Technique[]> {
  const req = beltRequirements.find(r => r.beltId === beltId);
  if (!req) return {};

  const result: Record<string, Technique[]> = {};
  for (const [catId, count] of Object.entries(req.requirements)) {
    if (count > 0 && techniques[catId]) {
      result[catId] = techniques[catId].filter(t => !t.forbidden).slice(0, count);
    }
  }
  // Always include ukemi
  result["ukemi-waza"] = techniques["ukemi-waza"];
  return result;
}

// Helper: get NEW techniques for a specific belt (those not in previous belt)
export function getNewTechniquesForBelt(beltId: string): Record<string, Technique[]> {
  const belt = beltLevels.find(b => b.id === beltId);
  if (!belt) return {};

  const currentTechs = getTechniquesForBelt(beltId);

  // Find previous belt (the one with sortOrder - 1)
  const prevBelt = beltLevels.find(b => b.sortOrder === belt.sortOrder - 1);
  const prevTechs = prevBelt ? getTechniquesForBelt(prevBelt.id) : {};

  const newTechs: Record<string, Technique[]> = {};
  for (const [catId, techs] of Object.entries(currentTechs)) {
    const prevCatTechs = prevTechs[catId] || [];
    const prevIds = new Set(prevCatTechs.map(t => t.id));
    const newInCat = techs.filter(t => !prevIds.has(t.id));
    if (newInCat.length > 0) {
      newTechs[catId] = newInCat;
    }
  }

  return newTechs;
}

// Get the parent belt for a slip belt
export function getParentBelt(beltId: string): BeltLevel | undefined {
  const belt = beltLevels.find(b => b.id === beltId);
  if (!belt || !belt.parentBelt) return undefined;
  return beltLevels.find(b => b.id === belt.parentBelt);
}

// Get the category info by id
export function getCategoryInfo(catId: string): TechniqueCategory | undefined {
  return techniqueCategories.find(c => c.id === catId);
}
