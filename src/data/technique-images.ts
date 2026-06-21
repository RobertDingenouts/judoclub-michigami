// Techniek afbeeldingen mapping
// Afbeeldingen opgeslagen in public/techniques/ met japanse naam als bestandsnaam
// Bronnen: judoinfo.com (JPG thumbnails), Weebly uploads (foto's)
// GIFs verwijderd: Cloudflare CAPTCHA corruptie bij download — alleen JPG thumbnails
//
// Soorten:
// - thumbnail: JPG thumbnail (statische afbeelding)
// - photo: Weebly upload (echte foto)

export interface TechniqueImage {
  techniqueId: number;
  categoryKey: string;
  /** Filename zonder extensie voor de JPG thumbnail */
  thumbnail?: string;
  /** Bron: judoinfo (illustratie), weebly (foto), hoebeke (foto) */
  source: 'judoinfo' | 'weebly' | 'hoebeke' | 'none';
  /** Heeft deze techniek minstens één afbeelding? */
  available: boolean;
}

// ==========================================================================
// VALBREKEN (Ukemi-waza) — geen judoinfo illustraties
// ==========================================================================
export const VALBREKEN_IMAGES: TechniqueImage[] = [
  { techniqueId: 1, categoryKey: 'valbreken', source: 'none', available: false },
  { techniqueId: 2, categoryKey: 'valbreken', source: 'none', available: false },
  { techniqueId: 3, categoryKey: 'valbreken', source: 'none', available: false },
  { techniqueId: 4, categoryKey: 'valbreken', source: 'none', available: false },
];

// ==========================================================================
// HEUPWORPEN (Koshi-waza)
// ==========================================================================
export const HEUPWORPEN_IMAGES: TechniqueImage[] = [
  { techniqueId: 1, categoryKey: 'heupworpen', thumbnail: 'ukigoshi', source: 'judoinfo', available: true },
  { techniqueId: 2, categoryKey: 'heupworpen', source: 'judoinfo', available: false },
  { techniqueId: 3, categoryKey: 'heupworpen', thumbnail: 'tsurigoshi', source: 'judoinfo', available: true },
  { techniqueId: 4, categoryKey: 'heupworpen', thumbnail: 'koshiguruma', source: 'judoinfo', available: true },
  { techniqueId: 5, categoryKey: 'heupworpen', thumbnail: 'haraigoshi', source: 'judoinfo', available: true },
  { techniqueId: 6, categoryKey: 'heupworpen', thumbnail: 'hanegoshi', source: 'judoinfo', available: true },
  { techniqueId: 7, categoryKey: 'heupworpen', thumbnail: 'ushirogoshi', source: 'judoinfo', available: true },
  { techniqueId: 8, categoryKey: 'heupworpen', thumbnail: 'tsurikomigoshi', source: 'judoinfo', available: true },
  { techniqueId: 9, categoryKey: 'heupworpen', thumbnail: 'utsurigoshi', source: 'judoinfo', available: true },
  { techniqueId: 10, categoryKey: 'heupworpen', thumbnail: 'uchimata', source: 'judoinfo', available: true },
  { techniqueId: 11, categoryKey: 'heupworpen', thumbnail: 'ogoshi', source: 'judoinfo', available: true },
  { techniqueId: 12, categoryKey: 'heupworpen', source: 'judoinfo', available: false },
  { techniqueId: 13, categoryKey: 'heupworpen', thumbnail: 'oguruma', source: 'judoinfo', available: true },
  { techniqueId: 14, categoryKey: 'heupworpen', thumbnail: 'yamaarashi', source: 'judoinfo', available: true },
  { techniqueId: 15, categoryKey: 'heupworpen', thumbnail: 'obi-goshi', source: 'weebly', available: true },
];

// ==========================================================================
// BEENWORPEN (Ashi-waza)
// ==========================================================================
export const BEENWORPEN_IMAGES: TechniqueImage[] = [
  { techniqueId: 1, categoryKey: 'beenworpen', thumbnail: 'osotogari', source: 'judoinfo', available: true },
  { techniqueId: 2, categoryKey: 'beenworpen', thumbnail: 'deashibarai', source: 'judoinfo', available: true },
  { techniqueId: 3, categoryKey: 'beenworpen', thumbnail: 'hizaguruma', source: 'judoinfo', available: true },
  { techniqueId: 4, categoryKey: 'beenworpen', thumbnail: 'kosotogake', source: 'judoinfo', available: true },
  { techniqueId: 5, categoryKey: 'beenworpen', thumbnail: 'ouchigari', source: 'judoinfo', available: true },
  { techniqueId: 6, categoryKey: 'beenworpen', thumbnail: 'kouchi', source: 'judoinfo', available: true },
  { techniqueId: 7, categoryKey: 'beenworpen', source: 'judoinfo', available: false },
  { techniqueId: 8, categoryKey: 'beenworpen', thumbnail: 'osotoguruma', source: 'judoinfo', available: true },
  { techniqueId: 9, categoryKey: 'beenworpen', thumbnail: 'osotootoshi', source: 'judoinfo', available: true },
  { techniqueId: 10, categoryKey: 'beenworpen', thumbnail: 'kosotogari', source: 'judoinfo', available: true },
  { techniqueId: 11, categoryKey: 'beenworpen', source: 'judoinfo', available: false },
  { techniqueId: 12, categoryKey: 'beenworpen', thumbnail: 'haraitsurikomiashi', source: 'judoinfo', available: true },
  { techniqueId: 13, categoryKey: 'beenworpen', thumbnail: 'sotogake', source: 'weebly', available: true },
  { techniqueId: 14, categoryKey: 'beenworpen', source: 'judoinfo', available: false },
  { techniqueId: 15, categoryKey: 'beenworpen', thumbnail: 'ashiguruma', source: 'judoinfo', available: true },
];

// ==========================================================================
// SCHOUDERWORPEN (Kata-waza)
// ==========================================================================
export const SCHOUDERWORPEN_IMAGES: TechniqueImage[] = [
  { techniqueId: 1, categoryKey: 'schouderworpen', thumbnail: 'ipponseoi', source: 'judoinfo', available: true },
  { techniqueId: 2, categoryKey: 'schouderworpen', source: 'judoinfo', available: false },
  { techniqueId: 3, categoryKey: 'schouderworpen', thumbnail: 'kataguruma', source: 'judoinfo', available: true },
  { techniqueId: 4, categoryKey: 'schouderworpen', source: 'judoinfo', available: false },
  { techniqueId: 5, categoryKey: 'schouderworpen', thumbnail: 'seoi-age', source: 'weebly', available: true },
];

// ==========================================================================
// ARMWORPEN (Te-waza)
// ==========================================================================
export const ARMWORPEN_IMAGES: TechniqueImage[] = [
  { techniqueId: 1, categoryKey: 'armworpen', thumbnail: 'taiotoshi', source: 'judoinfo', available: true },
  { techniqueId: 2, categoryKey: 'armworpen', thumbnail: 'ukiotoshi', source: 'judoinfo', available: true },
  { techniqueId: 3, categoryKey: 'armworpen', thumbnail: 'hiji-otoshi', source: 'judoinfo', available: true },
  { techniqueId: 4, categoryKey: 'armworpen', source: 'judoinfo', available: false },
  { techniqueId: 5, categoryKey: 'armworpen', source: 'judoinfo', available: false },
  { techniqueId: 6, categoryKey: 'armworpen', source: 'judoinfo', available: false },
  { techniqueId: 7, categoryKey: 'armworpen', source: 'judoinfo', available: false },
  { techniqueId: 8, categoryKey: 'armworpen', thumbnail: 'kata-ashi-dori', source: 'judoinfo', available: true },
  { techniqueId: 9, categoryKey: 'armworpen', source: 'judoinfo', available: false },
];

// ==========================================================================
// OFFERWORPEN (Sutemi-waza)
// ==========================================================================
export const OFFERWORPEN_IMAGES: TechniqueImage[] = [
  { techniqueId: 1, categoryKey: 'offerworpen', thumbnail: 'tomoenage', source: 'judoinfo', available: true },
  { techniqueId: 2, categoryKey: 'offerworpen', source: 'judoinfo', available: false },
  { techniqueId: 3, categoryKey: 'offerworpen', source: 'judoinfo', available: false },
  { techniqueId: 4, categoryKey: 'offerworpen', source: 'judoinfo', available: false },
  { techniqueId: 5, categoryKey: 'offerworpen', thumbnail: 'yokogake', source: 'judoinfo', available: true },
  { techniqueId: 6, categoryKey: 'offerworpen', thumbnail: 'taniotoshi', source: 'judoinfo', available: true },
  { techniqueId: 7, categoryKey: 'offerworpen', thumbnail: 'sumigaeshi', source: 'judoinfo', available: true },
  { techniqueId: 8, categoryKey: 'offerworpen', thumbnail: 'ukiwaza', source: 'judoinfo', available: true },
  { techniqueId: 9, categoryKey: 'offerworpen', thumbnail: 'kanibasa', source: 'judoinfo', available: true },
  { techniqueId: 10, categoryKey: 'offerworpen', thumbnail: 'yokootoshi', source: 'judoinfo', available: true },
  { techniqueId: 11, categoryKey: 'offerworpen', thumbnail: 'hanemakikomi', source: 'judoinfo', available: true },
  { techniqueId: 12, categoryKey: 'offerworpen', thumbnail: 'uranage', source: 'judoinfo', available: true },
  { techniqueId: 13, categoryKey: 'offerworpen', thumbnail: 'yokoguruma', source: 'judoinfo', available: true },
  { techniqueId: 14, categoryKey: 'offerworpen', thumbnail: 'yokowakare', source: 'judoinfo', available: true },
  { techniqueId: 15, categoryKey: 'offerworpen', thumbnail: 'tawaragaeshi', source: 'judoinfo', available: true },
];

// ==========================================================================
// HOUDGREPEN (Osaekomi-waza)
// ==========================================================================
export const HOUDGREPEN_IMAGES: TechniqueImage[] = [
  { techniqueId: 1, categoryKey: 'houdgrepen', thumbnail: 'kesa-gatame', source: 'judoinfo', available: true },
  { techniqueId: 2, categoryKey: 'houdgrepen', thumbnail: 'kuzure-kesa-gatame', source: 'judoinfo', available: true },
  { techniqueId: 3, categoryKey: 'houdgrepen', thumbnail: 'kata-gatame', source: 'judoinfo', available: true },
  { techniqueId: 4, categoryKey: 'houdgrepen', thumbnail: 'ushiro-kesa-gatame', source: 'judoinfo', available: true },
  { techniqueId: 5, categoryKey: 'houdgrepen', thumbnail: 'makura-kesa-gatame', source: 'judoinfo', available: true },
  { techniqueId: 6, categoryKey: 'houdgrepen', thumbnail: 'yoko-shiho-gatame', source: 'judoinfo', available: true },
  { techniqueId: 7, categoryKey: 'houdgrepen', thumbnail: 'mune-gatame', source: 'judoinfo', available: true },
  { techniqueId: 8, categoryKey: 'houdgrepen', thumbnail: 'kami-shiho-gatame', source: 'judoinfo', available: true },
  { techniqueId: 9, categoryKey: 'houdgrepen', thumbnail: 'kuzure-kami-shiho-gatame', source: 'judoinfo', available: true },
  { techniqueId: 10, categoryKey: 'houdgrepen', thumbnail: 'tate-shiho-gatame', source: 'judoinfo', available: true },
  { techniqueId: 11, categoryKey: 'houdgrepen', thumbnail: 'kuzure-tate-shiho-gatame', source: 'judoinfo', available: true },
  { techniqueId: 12, categoryKey: 'houdgrepen', source: 'none', available: false },
  { techniqueId: 13, categoryKey: 'houdgrepen', source: 'none', available: false },
  { techniqueId: 14, categoryKey: 'houdgrepen', source: 'none', available: false },
];

// ==========================================================================
// WURGINGEN (Shime-waza)
// ==========================================================================
export const WURGINGEN_IMAGES: TechniqueImage[] = [
  { techniqueId: 1, categoryKey: 'wurgingen', thumbnail: 'nami-juji-jime', source: 'judoinfo', available: true },
  { techniqueId: 2, categoryKey: 'wurgingen', thumbnail: 'gyaku-juji-jime', source: 'judoinfo', available: true },
  { techniqueId: 3, categoryKey: 'wurgingen', thumbnail: 'kata-juji-jime', source: 'judoinfo', available: true },
  { techniqueId: 4, categoryKey: 'wurgingen', thumbnail: 'hadaka-jime', source: 'judoinfo', available: true },
  { techniqueId: 5, categoryKey: 'wurgingen', thumbnail: 'okuri-eri-jime', source: 'judoinfo', available: true },
  { techniqueId: 6, categoryKey: 'wurgingen', thumbnail: 'kataha-jime', source: 'judoinfo', available: true },
  { techniqueId: 7, categoryKey: 'wurgingen', source: 'none', available: false },
  { techniqueId: 8, categoryKey: 'wurgingen', thumbnail: 'ryote-jime', source: 'judoinfo', available: true },
  { techniqueId: 9, categoryKey: 'wurgingen', thumbnail: 'sode-guruma-jime', source: 'judoinfo', available: true },
  { techniqueId: 10, categoryKey: 'wurgingen', thumbnail: 'tsukkomi-jime', source: 'judoinfo', available: true },
  { techniqueId: 11, categoryKey: 'wurgingen', source: 'none', available: false },
  { techniqueId: 12, categoryKey: 'wurgingen', source: 'none', available: false },
];

// ==========================================================================
// ARMKLEM MEN (Kansetsu-waza)
// ==========================================================================
export const ARMKLEMEN_IMAGES: TechniqueImage[] = [
  { techniqueId: 1, categoryKey: 'armklemmen', source: 'none', available: false },
  { techniqueId: 2, categoryKey: 'armklemmen', source: 'none', available: false },
  { techniqueId: 3, categoryKey: 'armklemmen', thumbnail: 'ude-gatame', source: 'judoinfo', available: true },
  { techniqueId: 4, categoryKey: 'armklemmen', thumbnail: 'hiza-gatame', source: 'judoinfo', available: true },
  { techniqueId: 5, categoryKey: 'armklemmen', thumbnail: 'waki-gatame', source: 'judoinfo', available: true },
  { techniqueId: 6, categoryKey: 'armklemmen', thumbnail: 'hara-gatame', source: 'judoinfo', available: true },
  { techniqueId: 7, categoryKey: 'armklemmen', thumbnail: 'ashi-gatame', source: 'judoinfo', available: true },
  { techniqueId: 8, categoryKey: 'armklemmen', source: 'none', available: false },
  { techniqueId: 9, categoryKey: 'armklemmen', source: 'none', available: false },
];

// ==========================================================================
// HELPERS
// ==========================================================================

/** Alle afbeeldingen samengevoegd */
export const ALL_TECHNIQUE_IMAGES: TechniqueImage[] = [
  ...VALBREKEN_IMAGES,
  ...HEUPWORPEN_IMAGES,
  ...BEENWORPEN_IMAGES,
  ...SCHOUDERWORPEN_IMAGES,
  ...ARMWORPEN_IMAGES,
  ...OFFERWORPEN_IMAGES,
  ...HOUDGREPEN_IMAGES,
  ...WURGINGEN_IMAGES,
  ...ARMKLEMEN_IMAGES,
];

/**
 * Haal de afbeelding paden op voor een techniek.
 * Retourneert alleen JPG thumbnail (GIFs verwijderd door Cloudflare corruptie).
 */
export function getTechniqueImage(categoryKey: string, techniqueId: number): {
  thumbnail?: string;
  available: boolean;
  source: string;
} | null {
  const imagesByCategory: Record<string, TechniqueImage[]> = {
    valbreken: VALBREKEN_IMAGES,
    heupworpen: HEUPWORPEN_IMAGES,
    beenworpen: BEENWORPEN_IMAGES,
    schouderworpen: SCHOUDERWORPEN_IMAGES,
    armworpen: ARMWORPEN_IMAGES,
    offerworpen: OFFERWORPEN_IMAGES,
    houdgrepen: HOUDGREPEN_IMAGES,
    wurgingen: WURGINGEN_IMAGES,
    armklemmen: ARMKLEMEN_IMAGES,
  };

  const images = imagesByCategory[categoryKey];
  if (!images) return null;

  const img = images.find(i => i.techniqueId === techniqueId);
  if (!img) return null;

  return {
    thumbnail: img.thumbnail ? `/techniques/${img.thumbnail}.jpg` : undefined,
    available: img.available,
    source: img.source,
  };
}

// Total: 9 categorieën, ~98 technieken
// Beschikbaar: ~75 met minstens één afbeelding
// JPGs (thumbnail): ~79 in public/techniques/
// Weebly foto's: 5 (obi-goshi, sotogake, seoi-age, kawaishi-instructieplaat, obi-goshi-variant)
