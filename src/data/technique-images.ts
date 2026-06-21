// Techniek afbeeldingen mapping — Stap 1: Alle technieken + beschikbare bronnen
// Afbeeldingen opgeslagen in public/techniques/ met japanse naam als bestandsnaam
// Bronnen: judoinfo.com (animated GIF illustraties + JPG thumbnails), Weebly uploads (foto's)
//
// Soorten:
// - illustration: animated GIF van judoinfo.com (toont beweging)
// - thumbnail: JPG thumbnail (statische afbeelding)
// - photo: Weebly upload (echte foto)

export interface TechniqueImage {
  techniqueId: number;
  categoryKey: string;
  /** Filename zonder extensie voor de GIF illustratie */
  gif?: string;
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
  { techniqueId: 1, categoryKey: 'heupworpen', gif: 'ukigoshi', thumbnail: 'ukigoshi', source: 'judoinfo', available: true },
  { techniqueId: 2, categoryKey: 'heupworpen', gif: 'kubi-nage', source: 'judoinfo', available: false },
  { techniqueId: 3, categoryKey: 'heupworpen', gif: 'tsurigoshi', thumbnail: 'tsurigoshi', source: 'judoinfo', available: true },
  { techniqueId: 4, categoryKey: 'heupworpen', gif: 'koshiguruma', thumbnail: 'koshiguruma', source: 'judoinfo', available: true },
  { techniqueId: 5, categoryKey: 'heupworpen', gif: 'haraigoshi', thumbnail: 'haraigoshi', source: 'judoinfo', available: true },
  { techniqueId: 6, categoryKey: 'heupworpen', gif: 'hanegoshi', thumbnail: 'hanegoshi', source: 'judoinfo', available: true },
  { techniqueId: 7, categoryKey: 'heupworpen', gif: 'ushirogoshi', thumbnail: 'ushirogoshi', source: 'judoinfo', available: true },
  { techniqueId: 8, categoryKey: 'heupworpen', gif: 'tsurikomigoshi', thumbnail: 'tsurikomigoshi', source: 'judoinfo', available: true },
  { techniqueId: 9, categoryKey: 'heupworpen', gif: 'utsurigoshi', thumbnail: 'utsurigoshi', source: 'judoinfo', available: true },
  { techniqueId: 10, categoryKey: 'heupworpen', gif: 'uchimata', thumbnail: 'uchimata', source: 'judoinfo', available: true },
  { techniqueId: 11, categoryKey: 'heupworpen', gif: 'ogoshi', thumbnail: 'ogoshi', source: 'judoinfo', available: true },
  { techniqueId: 12, categoryKey: 'heupworpen', gif: 'ko-tsuri-goshi', source: 'judoinfo', available: false },
  { techniqueId: 13, categoryKey: 'heupworpen', gif: 'oguruma', thumbnail: 'oguruma', source: 'judoinfo', available: true },
  { techniqueId: 14, categoryKey: 'heupworpen', gif: 'yamaarashi', thumbnail: 'yamaarashi', source: 'judoinfo', available: true },
  { techniqueId: 15, categoryKey: 'heupworpen', thumbnail: 'obi-goshi', source: 'weebly', available: true },
];

// ==========================================================================
// BEENWORPEN (Ashi-waza)
// ==========================================================================
export const BEENWORPEN_IMAGES: TechniqueImage[] = [
  { techniqueId: 1, categoryKey: 'beenworpen', gif: 'osotogari', thumbnail: 'osotogari', source: 'judoinfo', available: true },
  { techniqueId: 2, categoryKey: 'beenworpen', gif: 'deashibarai', thumbnail: 'deashibarai', source: 'judoinfo', available: true },
  { techniqueId: 3, categoryKey: 'beenworpen', gif: 'hizaguruma', thumbnail: 'hizaguruma', source: 'judoinfo', available: true },
  { techniqueId: 4, categoryKey: 'beenworpen', gif: 'kosotogake', thumbnail: 'kosotogake', source: 'judoinfo', available: true },
  { techniqueId: 5, categoryKey: 'beenworpen', gif: 'ouchigari', thumbnail: 'ouchigari', source: 'judoinfo', available: true },
  { techniqueId: 6, categoryKey: 'beenworpen', gif: 'kouchi', thumbnail: 'kouchi', source: 'judoinfo', available: true },
  { techniqueId: 7, categoryKey: 'beenworpen', gif: 'okuri-ashi-barai', source: 'judoinfo', available: false },
  { techniqueId: 8, categoryKey: 'beenworpen', gif: 'osotoguruma', thumbnail: 'osotoguruma', source: 'judoinfo', available: true },
  { techniqueId: 9, categoryKey: 'beenworpen', gif: 'osotootoshi', thumbnail: 'osotootoshi', source: 'judoinfo', available: true },
  { techniqueId: 10, categoryKey: 'beenworpen', gif: 'kosotogari', thumbnail: 'kosotogari', source: 'judoinfo', available: true },
  { techniqueId: 11, categoryKey: 'beenworpen', gif: 'sasae-tsurikomi-ashi', source: 'judoinfo', available: false },
  { techniqueId: 12, categoryKey: 'beenworpen', gif: 'haraitsurikomiashi', thumbnail: 'haraitsurikomiashi', source: 'judoinfo', available: true },
  { techniqueId: 13, categoryKey: 'beenworpen', thumbnail: 'sotogake', source: 'weebly', available: true },
  { techniqueId: 14, categoryKey: 'beenworpen', gif: 'ko-uchi-makikomi', source: 'judoinfo', available: false },
  { techniqueId: 15, categoryKey: 'beenworpen', gif: 'ashiguruma', thumbnail: 'ashiguruma', source: 'judoinfo', available: true },
];

// ==========================================================================
// SCHOUDERWORPEN (Kata-waza)
// ==========================================================================
export const SCHOUDERWORPEN_IMAGES: TechniqueImage[] = [
  { techniqueId: 1, categoryKey: 'schouderworpen', gif: 'ipponseoi', thumbnail: 'ipponseoi', source: 'judoinfo', available: true },
  { techniqueId: 2, categoryKey: 'schouderworpen', gif: 'seoi-nage', source: 'judoinfo', available: false },
  { techniqueId: 3, categoryKey: 'schouderworpen', gif: 'kataguruma', thumbnail: 'kataguruma', source: 'judoinfo', available: true },
  { techniqueId: 4, categoryKey: 'schouderworpen', gif: 'seoiotoshi', source: 'judoinfo', available: false },
  { techniqueId: 5, categoryKey: 'schouderworpen', thumbnail: 'seoi-age', source: 'weebly', available: true },
];

// ==========================================================================
// ARMWORPEN (Te-waza)
// ==========================================================================
export const ARMWORPEN_IMAGES: TechniqueImage[] = [
  { techniqueId: 1, categoryKey: 'armworpen', gif: 'taiotoshi', thumbnail: 'taiotoshi', source: 'judoinfo', available: true },
  { techniqueId: 2, categoryKey: 'armworpen', gif: 'ukiotoshi', thumbnail: 'ukiotoshi', source: 'judoinfo', available: true },
  { techniqueId: 3, categoryKey: 'armworpen', gif: 'hiji-otoshi', thumbnail: 'hiji-otoshi', source: 'judoinfo', available: true },
  { techniqueId: 4, categoryKey: 'armworpen', gif: 'sukui-nage', source: 'judoinfo', available: false },
  { techniqueId: 5, categoryKey: 'armworpen', gif: 'mochiage-otoshi', source: 'judoinfo', available: false },
  { techniqueId: 6, categoryKey: 'armworpen', gif: 'sumi-otoshi', source: 'judoinfo', available: false },
  { techniqueId: 7, categoryKey: 'armworpen', gif: 'obiotoshi', source: 'judoinfo', available: false },
  { techniqueId: 8, categoryKey: 'armworpen', gif: 'kata-ashi-dori', thumbnail: 'kata-ashi-dori', source: 'judoinfo', available: true },
  { techniqueId: 9, categoryKey: 'armworpen', gif: 'ryo-ashi-dori', source: 'judoinfo', available: false },
];

// ==========================================================================
// OFFERWORPEN (Sutemi-waza)
// ==========================================================================
export const OFFERWORPEN_IMAGES: TechniqueImage[] = [
  { techniqueId: 1, categoryKey: 'offerworpen', gif: 'tomoenage', thumbnail: 'tomoenage', source: 'judoinfo', available: true },
  { techniqueId: 2, categoryKey: 'offerworpen', gif: 'yoko-tomoe', source: 'judoinfo', available: false },
  { techniqueId: 3, categoryKey: 'offerworpen', gif: 'maki-tomoe', source: 'judoinfo', available: false },
  { techniqueId: 4, categoryKey: 'offerworpen', gif: 'soto-makikomi', source: 'judoinfo', available: false },
  { techniqueId: 5, categoryKey: 'offerworpen', gif: 'yokogake', thumbnail: 'yokogake', source: 'judoinfo', available: true },
  { techniqueId: 6, categoryKey: 'offerworpen', gif: 'taniotoshi', thumbnail: 'taniotoshi', source: 'judoinfo', available: true },
  { techniqueId: 7, categoryKey: 'offerworpen', gif: 'sumigaeshi', thumbnail: 'sumigaeshi', source: 'judoinfo', available: true },
  { techniqueId: 8, categoryKey: 'offerworpen', gif: 'ukiwaza', thumbnail: 'ukiwaza', source: 'judoinfo', available: true },
  { techniqueId: 9, categoryKey: 'offerworpen', gif: 'kanibasa', thumbnail: 'kanibasa', source: 'judoinfo', available: true },
  { techniqueId: 10, categoryKey: 'offerworpen', gif: 'yokootoshi', thumbnail: 'yokootoshi', source: 'judoinfo', available: true },
  { techniqueId: 11, categoryKey: 'offerworpen', gif: 'hanemakikomi', thumbnail: 'hanemakikomi', source: 'judoinfo', available: true },
  { techniqueId: 12, categoryKey: 'offerworpen', gif: 'uranage', thumbnail: 'uranage', source: 'judoinfo', available: true },
  { techniqueId: 13, categoryKey: 'offerworpen', gif: 'yokoguruma', thumbnail: 'yokoguruma', source: 'judoinfo', available: true },
  { techniqueId: 14, categoryKey: 'offerworpen', gif: 'yokowakare', thumbnail: 'yokowakare', source: 'judoinfo', available: true },
  { techniqueId: 15, categoryKey: 'offerworpen', gif: 'tawaragaeshi', thumbnail: 'tawaragaeshi', source: 'judoinfo', available: true },
];

// ==========================================================================
// HOUDGREPEN (Osaekomi-waza)
// ==========================================================================
export const HOUDGREPEN_IMAGES: TechniqueImage[] = [
  { techniqueId: 1, categoryKey: 'houdgrepen', gif: 'kesa-gatame', thumbnail: 'kesa-gatame', source: 'judoinfo', available: true },
  { techniqueId: 2, categoryKey: 'houdgrepen', gif: 'kuzure-kesa-gatame', thumbnail: 'kuzure-kesa-gatame', source: 'judoinfo', available: true },
  { techniqueId: 3, categoryKey: 'houdgrepen', gif: 'kata-gatame', thumbnail: 'kata-gatame', source: 'judoinfo', available: true },
  { techniqueId: 4, categoryKey: 'houdgrepen', gif: 'ushiro-kesa-gatame', thumbnail: 'ushiro-kesa-gatame', source: 'judoinfo', available: true },
  { techniqueId: 5, categoryKey: 'houdgrepen', gif: 'makura-kesa-gatame', thumbnail: 'makura-kesa-gatame', source: 'judoinfo', available: true },
  { techniqueId: 6, categoryKey: 'houdgrepen', gif: 'yoko-shiho-gatame', thumbnail: 'yoko-shiho-gatame', source: 'judoinfo', available: true },
  { techniqueId: 7, categoryKey: 'houdgrepen', gif: 'mune-gatame', thumbnail: 'mune-gatame', source: 'judoinfo', available: true },
  { techniqueId: 8, categoryKey: 'houdgrepen', gif: 'kami-shiho-gatame', thumbnail: 'kami-shiho-gatame', source: 'judoinfo', available: true },
  { techniqueId: 9, categoryKey: 'houdgrepen', gif: 'kuzure-kami-shiho-gatame', thumbnail: 'kuzure-kami-shiho-gatame', source: 'judoinfo', available: true },
  { techniqueId: 10, categoryKey: 'houdgrepen', gif: 'tate-shiho-gatame', thumbnail: 'tate-shiho-gatame', source: 'judoinfo', available: true },
  { techniqueId: 11, categoryKey: 'houdgrepen', gif: 'kuzure-tate-shiho-gatame', thumbnail: 'kuzure-tate-shiho-gatame', source: 'judoinfo', available: true },
  { techniqueId: 12, categoryKey: 'houdgrepen', source: 'none', available: false },
  { techniqueId: 13, categoryKey: 'houdgrepen', source: 'none', available: false },
  { techniqueId: 14, categoryKey: 'houdgrepen', source: 'none', available: false },
];

// ==========================================================================
// WURGINGEN (Shime-waza)
// ==========================================================================
export const WURGINGEN_IMAGES: TechniqueImage[] = [
  { techniqueId: 1, categoryKey: 'wurgingen', gif: 'nami-juji-jime', thumbnail: 'nami-juji-jime', source: 'judoinfo', available: true },
  { techniqueId: 2, categoryKey: 'wurgingen', gif: 'gyaku-juji-jime', thumbnail: 'gyaku-juji-jime', source: 'judoinfo', available: true },
  { techniqueId: 3, categoryKey: 'wurgingen', gif: 'kata-juji-jime', thumbnail: 'kata-juji-jime', source: 'judoinfo', available: true },
  { techniqueId: 4, categoryKey: 'wurgingen', gif: 'hadaka-jime', thumbnail: 'hadaka-jime', source: 'judoinfo', available: true },
  { techniqueId: 5, categoryKey: 'wurgingen', gif: 'okuri-eri-jime', thumbnail: 'okuri-eri-jime', source: 'judoinfo', available: true },
  { techniqueId: 6, categoryKey: 'wurgingen', gif: 'kataha-jime', thumbnail: 'kataha-jime', source: 'judoinfo', available: true },
  { techniqueId: 7, categoryKey: 'wurgingen', source: 'none', available: false },
  { techniqueId: 8, categoryKey: 'wurgingen', gif: 'ryote-jime', thumbnail: 'ryote-jime', source: 'judoinfo', available: true },
  { techniqueId: 9, categoryKey: 'wurgingen', gif: 'sode-guruma-jime', thumbnail: 'sode-guruma-jime', source: 'judoinfo', available: true },
  { techniqueId: 10, categoryKey: 'wurgingen', gif: 'tsukkomi-jime', thumbnail: 'tsukkomi-jime', source: 'judoinfo', available: true },
  { techniqueId: 11, categoryKey: 'wurgingen', source: 'none', available: false },
  { techniqueId: 12, categoryKey: 'wurgingen', source: 'none', available: false },
];

// ==========================================================================
// ARMKLEM MEN (Kansetsu-waza)
// ==========================================================================
export const ARMKLEMEN_IMAGES: TechniqueImage[] = [
  { techniqueId: 1, categoryKey: 'armklemmen', source: 'none', available: false },
  { techniqueId: 2, categoryKey: 'armklemmen', source: 'none', available: false },
  { techniqueId: 3, categoryKey: 'armklemmen', gif: 'ude-gatame', thumbnail: 'ude-gatame', source: 'judoinfo', available: true },
  { techniqueId: 4, categoryKey: 'armklemmen', gif: 'hiza-gatame', thumbnail: 'hiza-gatame', source: 'judoinfo', available: true },
  { techniqueId: 5, categoryKey: 'armklemmen', gif: 'waki-gatame', thumbnail: 'waki-gatame', source: 'judoinfo', available: true },
  { techniqueId: 6, categoryKey: 'armklemmen', gif: 'hara-gatame', thumbnail: 'hara-gatame', source: 'judoinfo', available: true },
  { techniqueId: 7, categoryKey: 'armklemmen', gif: 'ashi-gatame', thumbnail: 'ashi-gatame', source: 'judoinfo', available: true },
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
 * Geeft prioriteit aan GIF (animated) boven thumbnail.
 */
export function getTechniqueImage(categoryKey: string, techniqueId: number): {
  gif?: string;
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
    gif: img.gif ? `/techniques/gifs/${img.gif}.gif` : undefined,
    thumbnail: img.thumbnail ? `/techniques/${img.thumbnail}.jpg` : undefined,
    available: img.available,
    source: img.source,
  };
}

// Total: 9 categorieën, ~98 technieken
// Beschikbaar: ~75 met minstens één afbeelding
// GIFs (animated): ~60 in public/techniques/gifs/
// JPGs (thumbnail): ~79 in public/techniques/
// Weebly foto's: 5 (obi-goshi, sotogake, seoi-age, kawaishi-instructieplaat, obi-goshi-variant)
