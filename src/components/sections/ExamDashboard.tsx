'use client';

import { useState, type ReactNode } from 'react';
import { ChevronDown, ChevronUp, Play, X } from 'lucide-react';
import { AnimatedCard, AnimatedButton, subtleHover } from '@/components/ui/animated-card';
import { useT } from '@/i18n/LangContext';
import { techDutchFor } from '@/i18n/content';

// ==========================================================================
// TYPES
// ==========================================================================
interface Technique {
  id: string;
  nameJa: string;
  nameNl: string;
  forbidden?: boolean;
  youtubeId?: string;
}

interface Category {
  nameNl: string;
  nameJa: string;
  icon: string;
  techniques: Technique[];
}

interface BeltLevel {
  id: string;
  name: string;
  kyu: number | null;
  color: string;
  isSlip: boolean;
}

interface BeltRequirements {
  requirements: Record<string, number>;
  nageKomi: number;
  kantelTechnieken: number;
}

// ==========================================================================
// DATA
// ==========================================================================
const BELT_LEVELS: BeltLevel[] = [
  { id: 'wit', name: 'Witte band', kyu: null, color: 'white', isSlip: false },
  { id: 'wit-gele-slip', name: 'Witte band met gele slip', kyu: null, color: 'slip-white-yellow', isSlip: true },
  { id: 'geel', name: 'Gele band', kyu: 5, color: 'yellow', isSlip: false },
  { id: 'geel-oranje-slip', name: 'Gele band met oranje slip', kyu: null, color: 'slip-yellow-orange', isSlip: true },
  { id: 'oranje', name: 'Oranje band', kyu: 4, color: 'orange', isSlip: false },
  { id: 'oranje-groene-slip', name: 'Oranje band met groene slip', kyu: null, color: 'slip-orange-green', isSlip: true },
  { id: 'groen', name: 'Groene band', kyu: 3, color: 'green', isSlip: false },
  { id: 'groen-blauwe-slip', name: 'Groene band met blauwe slip', kyu: null, color: 'slip-green-blue', isSlip: true },
  { id: 'blauw', name: 'Blauwe band', kyu: 2, color: 'blue', isSlip: false },
  { id: 'blauw-bruine-slip', name: 'Blauwe band met bruine slip', kyu: null, color: 'slip-blue-brown', isSlip: true },
  { id: 'bruin', name: 'Bruine band', kyu: 1, color: 'brown', isSlip: false },
];

const CATEGORIES: Record<string, Category> = {
  'ukemi-waza': {
    nameNl: 'Valbreektechnieken',
    nameJa: 'Ukemi-waza',
    icon: '受',
    techniques: [
      { id: 'ukemi-1', nameJa: 'Ushiro-ukemi', nameNl: 'Achterwaarts vallen', youtubeId: '_g7rvsxTkz8' },
      { id: 'ukemi-2', nameJa: 'Yoko-ukemi', nameNl: 'Zijwaarts vallen', youtubeId: 'JCwK1Ia4jsc' },
      { id: 'ukemi-3', nameJa: 'Mae-ukemi', nameNl: 'Voorwaarts vallen', youtubeId: 'veM5RFdjo0U' },
      { id: 'ukemi-4', nameJa: 'Zenpo-kaiten', nameNl: 'Voorwaarts rollen', youtubeId: 'kbiLot6laks' },
    ]
  },
  'ashi-waza': {
    nameNl: 'Beenworpen',
    nameJa: 'Ashi-waza',
    icon: '足',
    techniques: [
      { id: 'ashi-1', nameJa: 'O-soto-gari', nameNl: 'Grote buitenwaartse veeg', youtubeId: 'c-A_nP7mKAc' },
      { id: 'ashi-2', nameJa: 'De-ashi-barai', nameNl: 'Voorwaartse voetveeg', youtubeId: '4BUUvqxi_Kk' },
      { id: 'ashi-3', nameJa: 'Hiza-guruma', nameNl: 'Knie-wiel', youtubeId: 'JPJx9-oAVns' },
      { id: 'ashi-4', nameJa: 'Ko-soto-gake', nameNl: 'Kleine binnenwaartse haak', youtubeId: '8b6kY4s4zH4' },
      { id: 'ashi-5', nameJa: 'O-uchi-gari', nameNl: 'Grote binnenwaartse veeg', youtubeId: '0itJFhV9pDQ' },
      { id: 'ashi-6', nameJa: 'Ko-uchi-gari', nameNl: 'Kleine binnenwaartse veeg', youtubeId: '3Jb3tZvr9Ng' },
      { id: 'ashi-7', nameJa: 'Okuri-ashi-barai', nameNl: 'Dubbele voetveeg', youtubeId: 'nw1ZdRjrdRI' },
      { id: 'ashi-8', nameJa: 'O-soto-guruma', nameNl: 'Grote buitenwaartse wiel', youtubeId: '92KbCm6pQeI' },
      { id: 'ashi-9', nameJa: 'O-soto-otoshi', nameNl: 'Grote buitenwaartse val', youtubeId: '2DsVvDw7b8g' },
      { id: 'ashi-10', nameJa: 'Ko-soto-gari', nameNl: 'Kleine buitenwaartse veeg', youtubeId: 'jeQ541ScLB4' },
      { id: 'ashi-11', nameJa: 'Sasae-tsurikomi-ashi', nameNl: 'Ondersteunende oplichtende voet', youtubeId: '699i--pvYmE' },
      { id: 'ashi-12', nameJa: 'Harai-tsurikomi-ashi', nameNl: 'Veeg-oplichtende voet', youtubeId: 'gGPXvWL8VbE' },
      { id: 'ashi-13', nameJa: 'Soto-gake', nameNl: 'Buitenwaartse haak' },
      { id: 'ashi-14', nameJa: 'Ko-uchi-makikomi', nameNl: 'Kleine binnenwaartse meidraai', youtubeId: '_1eygIXLD_w' },
      { id: 'ashi-15', nameJa: 'Ashi-guruma', nameNl: 'Been-wiel', youtubeId: 'ROeayhvom9U' },
    ]
  },
  'koshi-waza': {
    nameNl: 'Heupworpen',
    nameJa: 'Koshi-waza',
    icon: '腰',
    techniques: [
      { id: 'koshi-1', nameJa: 'Uki-goshi', nameNl: 'Zwevende heupworp', youtubeId: 'bPKwtB4lyOQ' },
      { id: 'koshi-2', nameJa: 'Kubi-nage', nameNl: 'Nekworp', youtubeId: 'F-4fyNwx52w' },
      { id: 'koshi-3', nameJa: 'Tsuri-goshi', nameNl: 'Opgetilde heupworp', youtubeId: '51Htlp7xEvE' },
      { id: 'koshi-4', nameJa: 'Koshi-guruma', nameNl: 'Heup-wiel', youtubeId: 'SU7Id6uVJ44' },
      { id: 'koshi-5', nameJa: 'Harai-goshi', nameNl: 'Heupveeg', youtubeId: 'qTo8HlAAkOo' },
      { id: 'koshi-6', nameJa: 'Hane-goshi', nameNl: 'Springende heupworp', youtubeId: 'M9_7De6A1kk' },
      { id: 'koshi-7', nameJa: 'Ushiro-goshi', nameNl: 'Achterwaartse heupworp', youtubeId: 'ORIYstuxYT8' },
      { id: 'koshi-8', nameJa: 'Tsurikomi-goshi', nameNl: 'Opgetilde heupworp', youtubeId: 'McfzA0yRVt4' },
      { id: 'koshi-9', nameJa: 'Utsuri-goshi', nameNl: 'Veranderende heupworp', youtubeId: '4pQd_bEnlf0' },
      { id: 'koshi-10', nameJa: 'Uchi-mata', nameNl: 'Binnenwaartse dijworp', youtubeId: 'iUpSu5J-bgw' },
      { id: 'koshi-11', nameJa: 'O-goshi', nameNl: 'Grote heupworp', youtubeId: 'yhu1mfy2vJ4' },
      { id: 'koshi-12', nameJa: 'Ko-tsuri-goshi', nameNl: 'Kleine opgetilde heupworp', youtubeId: 'aNrgTx4--L0' },
      { id: 'koshi-13', nameJa: 'O-guruma', nameNl: 'Groot wiel', youtubeId: 'SnZciTAY9vc' },
      { id: 'koshi-14', nameJa: 'Yama-arashi', nameNl: 'Bergstorm', youtubeId: 'MGlyKmSuzdc' },
      { id: 'koshi-15', nameJa: 'Obi-goshi', nameNl: 'Riemplaats heupworp' },
    ]
  },
  'kata-waza': {
    nameNl: 'Schouderworpen',
    nameJa: 'Kata-waza',
    icon: '肩',
    techniques: [
      { id: 'kata-1', nameJa: 'Ippon-seoi-nage', nameNl: 'Eenarmige schouderworp', youtubeId: 'FQnOlCxo4oI' },
      { id: 'kata-2', nameJa: 'Seoi-nage', nameNl: 'Schouderworp', youtubeId: 'zIq0xI0ogxk' },
      { id: 'kata-3', nameJa: 'Kata-guruma', nameNl: 'Schouder-wiel', youtubeId: 'cnHRhSy8yi4' },
      { id: 'kata-4', nameJa: 'Seoi-otoshi', nameNl: 'Schouderval', youtubeId: 'vu1TMVNnq34' },
      { id: 'kata-5', nameJa: 'Hidari-kata-seoi', nameNl: 'Linker schouderworp' },
      { id: 'kata-6', nameJa: 'Seoi-age', nameNl: 'Schouder optilling' },
    ]
  },
  'te-waza': {
    nameNl: 'Armworpen',
    nameJa: 'Te-waza',
    icon: '手',
    techniques: [
      { id: 'te-1', nameJa: 'Tai-otoshi', nameNl: 'Lichaamsval', youtubeId: '4x6S3Q-Ktv8' },
      { id: 'te-2', nameJa: 'Uki-otoshi', nameNl: 'Zwevende val', youtubeId: '6H5tmncOY4Q' },
      { id: 'te-3', nameJa: 'Hiji-otoshi', nameNl: 'Elleboogval', youtubeId: 'oEI1bdbubVU' },
      { id: 'te-4', nameJa: 'Sukui-nage', nameNl: 'Scheppende worp', youtubeId: 'vU6aJ2kFxoI' },
      { id: 'te-5', nameJa: 'Mochiage-otoshi', nameNl: 'Optillende val' },
      { id: 'te-6', nameJa: 'Sumi-otoshi', nameNl: 'Hoekval', youtubeId: 'lLU9wv52ni0' },
      { id: 'te-7', nameJa: 'Obi-otoshi', nameNl: 'Riemval', youtubeId: 'ff8U2TVZIYI' },
      { id: 'te-8', nameJa: 'Kata-ashi-dori', nameNl: 'Eenbeenshouderworp', youtubeId: 'VVoMqFNVGfc' },
      { id: 'te-9', nameJa: 'Ryo-ashi-dori', nameNl: 'Tweebenenschouderworp', youtubeId: 'gYwnUP0Uz-w' },
    ]
  },
  'sutemi-waza': {
    nameNl: 'Offerworpen',
    nameJa: 'Sutemi-waza',
    icon: '捨',
    techniques: [
      { id: 'sutemi-1', nameJa: 'Tomoe-nage', nameNl: 'Cirkelworp', youtubeId: '880WbHvHv6A' },
      { id: 'sutemi-2', nameJa: 'Yoko-tomoe', nameNl: 'Zijwaartse cirkelworp', youtubeId: 'lNzMK4hk-zQ' },
      { id: 'sutemi-3', nameJa: 'Maki-tomoe', nameNl: 'Oprollende cirkelworp', youtubeId: 'H8rnXEfyZsU' },
      { id: 'sutemi-4', nameJa: 'Soto-makikomi', nameNl: 'Buitenwaartse meidraai', youtubeId: 'bWG9O1BVKtQ' },
      { id: 'sutemi-5', nameJa: 'Yoko-gake', nameNl: 'Zijwaartse val', youtubeId: 'tP1Sj1uDfSo' },
      { id: 'sutemi-6', nameJa: 'Tani-otoshi', nameNl: 'Vallei-val', youtubeId: '3b9Me3Fohpk' },
      { id: 'sutemi-7', nameJa: 'Sumi-gaeshi', nameNl: 'Hoekomdraaiing', youtubeId: '5VhduA5xkbA' },
      { id: 'sutemi-8', nameJa: 'Uki-waza', nameNl: 'Zwevende worp', youtubeId: 'weVOpJ63gII' },
      { id: 'sutemi-9', nameJa: 'Kani-basami', nameNl: 'Schaarworp', forbidden: true, youtubeId: 'OR-HGHnarYc' },
      { id: 'sutemi-10', nameJa: 'Yoko-otoshi', nameNl: 'Zijwaartse val', youtubeId: 'MnNG67pF_a0' },
      { id: 'sutemi-11', nameJa: 'Hane-makikomi', nameNl: 'Springende meidraai', youtubeId: '6CRBGLGz9j8' },
      { id: 'sutemi-12', nameJa: 'Ura-nage', nameNl: 'Achterwaartse worp', youtubeId: 'Fgi9b8DJ5sQ' },
      { id: 'sutemi-13', nameJa: 'Yoko-guruma', nameNl: 'Zijwaarts wiel', youtubeId: 'MehP6I5cY2c' },
      { id: 'sutemi-14', nameJa: 'Yoko-wakare', nameNl: 'Zijwaartse scheiding', youtubeId: 'bp1tscHlePI' },
      { id: 'sutemi-15', nameJa: 'Tawara-gaeshi', nameNl: 'Rijstbal-omdraaiing', youtubeId: 'TmTWgrmViZc' },
    ]
  },
  'osaekomi-waza': {
    nameNl: 'Houdgrepen',
    nameJa: 'Osaekomi-waza',
    icon: '固',
    techniques: [
      { id: 'osaekomi-1', nameJa: 'Kesa-gatame', nameNl: 'Scarf-houdgreep', youtubeId: 'NDaQuJOFBYk' },
      { id: 'osaekomi-2', nameJa: 'Kuzure-kesa-gatame', nameNl: 'Gewijzigde scarf-houdgreep', youtubeId: 'Q2fb9jaoUFQ' },
      { id: 'osaekomi-3', nameJa: 'Kata-gatame', nameNl: 'Schouder-houdgreep', youtubeId: 'zQR3IOXxO_Q' },
      { id: 'osaekomi-4', nameJa: 'Ushiro-kesa-gatame', nameNl: 'Achterwaartse scarf-houdgreep', youtubeId: 'SBapox2M2dE' },
      { id: 'osaekomi-5', nameJa: 'Makura-kesa-gatame', nameNl: 'Kussen scarf-houdgreep', youtubeId: '2z_vnz6W-mo' },
      { id: 'osaekomi-6', nameJa: 'Yoko-shiho-gatame', nameNl: 'Zijwaartse vierpunt-houdgreep', youtubeId: 'TT7XJVSEQxA' },
      { id: 'osaekomi-7', nameJa: 'Kuzure-yoko-shiho-gatame', nameNl: 'Gewijzigde zijwaartse vierpunt-houdgreep', youtubeId: 'lIt5vywPBF0' },
      { id: 'osaekomi-8', nameJa: 'Kami-shiho-gatame', nameNl: 'Boven vierpunt-houdgreep', youtubeId: 'HFuMjOv0WN8' },
      { id: 'osaekomi-9', nameJa: 'Kuzure-kami-shiho-gatame', nameNl: 'Gewijzigde boven vierpunt-houdgreep', youtubeId: 'YUrogQWdwiY' },
      { id: 'osaekomi-10', nameJa: 'Tate-shiho-gatame', nameNl: 'Verticale vierpunt-houdgreep', youtubeId: '55-rFmBx53g' },
      { id: 'osaekomi-11', nameJa: 'Kuzure-tate-shiho-gatame', nameNl: 'Gewijzigde verticale vierpunt-houdgreep', youtubeId: 'i9VUQhqxYJU' },
      { id: 'osaekomi-12', nameJa: 'Uki-gatame', nameNl: 'Zwevende houdgreep', youtubeId: 'e_lAjik1SUM' },
      { id: 'osaekomi-13', nameJa: 'Ura-gatame', nameNl: 'Achterwaartse houdgreep', youtubeId: 'eeAHZB0v3XY' },
      { id: 'osaekomi-14', nameJa: 'Sankaku-gatame', nameNl: 'Driehoek-houdgreep', youtubeId: 'fcnFgWDY0p0' },
    ]
  },
  'shime-waza': {
    nameNl: 'Wurgingen',
    nameJa: 'Shime-waza',
    icon: '締',
    techniques: [
      { id: 'shime-1', nameJa: 'Nami-juji-jime', nameNl: 'Gewone kruisverwurging', youtubeId: 'k2cHry9HByQ' },
      { id: 'shime-2', nameJa: 'Gyaku-juji-jime', nameNl: 'Omgekeerde kruisverwurging', youtubeId: 't3tQriIPdlI' },
      { id: 'shime-3', nameJa: 'Kata-juji-jime', nameNl: 'Eenarmige kruisverwurging', youtubeId: '3VZVUAmiMD8' },
      { id: 'shime-4', nameJa: 'Hadaka-jime', nameNl: 'Naakte verwurging', youtubeId: '9f0n8jez7iA' },
      { id: 'shime-5', nameJa: 'Okuri-eri-jime', nameNl: 'Dubbele reversverwurging', youtubeId: 'EiqyoVcIAi8' },
      { id: 'shime-6', nameJa: 'Kataha-jime', nameNl: 'Eenzijdige vleugelverwurging', youtubeId: 'yaTGgRjnwB8' },
      { id: 'shime-7', nameJa: 'Katate-jime', nameNl: 'Eenhandige verwurging', youtubeId: 'cHeIs-fSqwE' },
      { id: 'shime-8', nameJa: 'Ryote-jime', nameNl: 'Tweehandige verwurging', youtubeId: '-RHC4V7TQiY' },
      { id: 'shime-9', nameJa: 'Sode-guruma-jime', nameNl: 'Mouw-wiel verwurging', youtubeId: 'E3nvQzClcAU' },
      { id: 'shime-10', nameJa: 'Tsukkomi-jime', nameNl: 'Stoot-verwurging', youtubeId: 'dKKpnD3eLcY' },
      { id: 'shime-11', nameJa: 'Sankaku-jime', nameNl: 'Driehoek-verwurging', youtubeId: 'lq1CUBRAm7s' },
      { id: 'shime-12', nameJa: 'Do-jime', nameNl: 'Romp-verwurging', forbidden: true, youtubeId: 'D_0fFcoIbvY' },
    ]
  },
  'kansetsu-waza': {
    nameNl: 'Armklemmen',
    nameJa: 'Kansetsu-waza',
    icon: '極',
    techniques: [
      { id: 'kansetsu-1', nameJa: 'Juji-gatame', nameNl: 'Kruis-armklem', youtubeId: 'OWgSOlCuMXw' },
      { id: 'kansetsu-2', nameJa: 'Ude-garami', nameNl: 'Gekruiste armklem', youtubeId: 'AIlTvZb4RlE' },
      { id: 'kansetsu-3', nameJa: 'Ude-gatame', nameNl: 'Arm-houdgreep', youtubeId: 'SBf0aTma1VI' },
      { id: 'kansetsu-4', nameJa: 'Hiza-gatame', nameNl: 'Knie-armklem', youtubeId: 'H2HtAJdiJcE' },
      { id: 'kansetsu-5', nameJa: 'Waki-gatame', nameNl: 'Oksel-armklem', youtubeId: '8F5p1zuJRG0' },
      { id: 'kansetsu-6', nameJa: 'Hara-gatame', nameNl: 'Buik-armklem', youtubeId: 'ZzEycg8R_9M' },
      { id: 'kansetsu-7', nameJa: 'Ashi-gatame', nameNl: 'Been-armklem', youtubeId: 'ClY7g_pX-4s' },
      { id: 'kansetsu-8', nameJa: 'Te-gatame', nameNl: 'Hand-armklem', youtubeId: '6DnvhY0tQVM' },
      { id: 'kansetsu-9', nameJa: 'Sankaku-gatame', nameNl: 'Driehoek-armklem', youtubeId: 'WefAmW4azhk' },
      { id: 'kansetsu-10', nameJa: 'Ashi-garami', nameNl: 'Been-klem', forbidden: true },
    ]
  }
};

// Rode pictogrammen per categorie — zelfde symbolen als de vorige emoji's (🛡️🦵🔄💪🤚⬇️🔒😤🦾), nu in clubrood
const CAT_ICONS: Record<string, ReactNode> = {
  // 🛡️ Valbreektechnieken
  'ukemi-waza': (
    <>
      <path d="M16 3 L26 7 V15 Q26 23 16 28 Q6 23 6 15 V7 Z" />
      <path d="M11 14 L15 18 L21 11" />
    </>
  ),
  // 🦵 Beenworpen
  'ashi-waza': (
    <>
      <path d="M10 3 H17 Q19 9 17 14 Q15 18 17 22 L17 24 H24 Q26 24 26 26 Q26 27 24 27 H10 L10 22 Q12 18 10 14 Q8 9 10 3 Z" />
    </>
  ),
  // 🔄 Heupworpen
  'koshi-waza': (
    <>
      <path d="M8 14 A 8 8 0 0 1 22 8" />
      <path d="M22 8 L18.5 8.5 M22 8 L21.5 4.5" />
      <path d="M24 18 A 8 8 0 0 1 10 24" />
      <path d="M10 24 L13.5 23.5 M10 24 L10.5 27.5" />
    </>
  ),
  // 💪 Armworpen (biceps)
  'kata-waza': (
    <>
      <path d="M3 26 L3 19 Q3 10 10 10 Q16 10 17 16 L17 26 Z" />
      <path d="M17 16 L19.5 8" strokeWidth="4.5" />
      <circle cx="21" cy="5" r="4.5" />
    </>
  ),
  // 🤚 Handworpen
  'te-waza': (
    <>
      <path d="M11 15 V23 Q11 27 15 27 H17 Q21 27 21 23 V15" />
      <path d="M11 15 V7 M14.3 15 V5 M17.7 15 V5 M21 15 V7" />
      <path d="M11 18 L5.5 15" />
    </>
  ),
  // ⬇️ Offerworpen
  'sutemi-waza': (
    <>
      <path d="M16 4 V26" />
      <path d="M16 26 L8 18 M16 26 L24 18" />
    </>
  ),
  // 🔒 Houdgrepen
  'osaekomi-waza': (
    <>
      <path d="M9 15 H23 V26 H9 Z" />
      <path d="M12.5 15 V11 A3.5 3.5 0 0 1 19.5 11 V15" />
      <circle cx="16" cy="20.5" r="1.4" fill="#a90000" stroke="none" />
    </>
  ),
  // 😤 Wurgingen
  'shime-waza': (
    <>
      <circle cx="16" cy="17" r="9" />
      <path d="M10.5 14.5 L14 16 M21.5 14.5 L18 16" />
      <path d="M12.5 21.5 H19.5" />
      <path d="M5 10 Q7.5 8 5.5 5.5" />
      <path d="M27 10 Q24.5 8 26.5 5.5" />
    </>
  ),
  // 🦾 Armklemmen
  'kansetsu-waza': (
    <>
      <circle cx="5" cy="20" r="2.5" />
      <path d="M7.5 20 L14.5 20" />
      <circle cx="17" cy="20" r="2.5" />
      <path d="M19 18 L24 10" />
      <path d="M20.5 15 L22.5 16 M22 12.5 L24 13.5" />
      <circle cx="25.5" cy="7" r="2.8" />
    </>
  ),
};

const BELT_REQUIREMENTS: Record<string, BeltRequirements> = {
  'wit': { requirements: { 'ashi-waza': 1, 'koshi-waza': 1, 'kata-waza': 1, 'te-waza': 1, 'sutemi-waza': 0, 'osaekomi-waza': 2, 'shime-waza': 0, 'kansetsu-waza': 0 }, nageKomi: 3, kantelTechnieken: 0 },
  'wit-gele-slip': { requirements: { 'ashi-waza': 2, 'koshi-waza': 2, 'kata-waza': 1, 'te-waza': 1, 'sutemi-waza': 0, 'osaekomi-waza': 3, 'shime-waza': 0, 'kansetsu-waza': 0 }, nageKomi: 5, kantelTechnieken: 1 },
  'geel': { requirements: { 'ashi-waza': 3, 'koshi-waza': 3, 'kata-waza': 2, 'te-waza': 2, 'sutemi-waza': 0, 'osaekomi-waza': 4, 'shime-waza': 0, 'kansetsu-waza': 0 }, nageKomi: 7, kantelTechnieken: 2 },
  'geel-oranje-slip': { requirements: { 'ashi-waza': 4, 'koshi-waza': 4, 'kata-waza': 3, 'te-waza': 3, 'sutemi-waza': 0, 'osaekomi-waza': 5, 'shime-waza': 0, 'kansetsu-waza': 0 }, nageKomi: 9, kantelTechnieken: 3 },
  'oranje': { requirements: { 'ashi-waza': 6, 'koshi-waza': 6, 'kata-waza': 3, 'te-waza': 4, 'sutemi-waza': 0, 'osaekomi-waza': 7, 'shime-waza': 0, 'kansetsu-waza': 0 }, nageKomi: 11, kantelTechnieken: 3 },
  'oranje-groene-slip': { requirements: { 'ashi-waza': 7, 'koshi-waza': 7, 'kata-waza': 4, 'te-waza': 5, 'sutemi-waza': 1, 'osaekomi-waza': 8, 'shime-waza': 2, 'kansetsu-waza': 2 }, nageKomi: 13, kantelTechnieken: 2 },
  'groen': { requirements: { 'ashi-waza': 9, 'koshi-waza': 9, 'kata-waza': 4, 'te-waza': 6, 'sutemi-waza': 3, 'osaekomi-waza': 9, 'shime-waza': 4, 'kansetsu-waza': 3 }, nageKomi: 15, kantelTechnieken: 3 },
  'groen-blauwe-slip': { requirements: { 'ashi-waza': 10, 'koshi-waza': 10, 'kata-waza': 5, 'te-waza': 7, 'sutemi-waza': 6, 'osaekomi-waza': 10, 'shime-waza': 6, 'kansetsu-waza': 5 }, nageKomi: 17, kantelTechnieken: 4 },
  'blauw': { requirements: { 'ashi-waza': 12, 'koshi-waza': 12, 'kata-waza': 5, 'te-waza': 8, 'sutemi-waza': 9, 'osaekomi-waza': 11, 'shime-waza': 8, 'kansetsu-waza': 6 }, nageKomi: 18, kantelTechnieken: 4 },
  'blauw-bruine-slip': { requirements: { 'ashi-waza': 13, 'koshi-waza': 13, 'kata-waza': 6, 'te-waza': 9, 'sutemi-waza': 12, 'osaekomi-waza': 13, 'shime-waza': 10, 'kansetsu-waza': 8 }, nageKomi: 19, kantelTechnieken: 5 },
  'bruin': { requirements: { 'ashi-waza': 15, 'koshi-waza': 15, 'kata-waza': 6, 'te-waza': 9, 'sutemi-waza': 15, 'osaekomi-waza': 14, 'shime-waza': 12, 'kansetsu-waza': 10 }, nageKomi: 20, kantelTechnieken: 5 }
};

const CATEGORY_ORDER = ['ukemi-waza', 'ashi-waza', 'koshi-waza', 'kata-waza', 'te-waza', 'sutemi-waza', 'osaekomi-waza', 'shime-waza', 'kansetsu-waza'];

// Belt color mapping
const BELT_COLORS: Record<string, string> = {
  'white': 'linear-gradient(180deg, #ffffff 0%, #f0f0f0 50%, #e0e0e0 100%)',
  'yellow': 'linear-gradient(180deg, #FFE135 0%, #FFD700 50%, #DAA520 100%)',
  'orange': 'linear-gradient(180deg, #FFA500 0%, #FF8C00 50%, #CC7000 100%)',
  'green': 'linear-gradient(180deg, #228B22 0%, #006400 50%, #004d00 100%)',
  'blue': 'linear-gradient(180deg, #4169E1 0%, #0000CD 50%, #00008B 100%)',
  'brown': 'linear-gradient(180deg, #8B4513 0%, #654321 50%, #3d2817 100%)',
  'slip-white-yellow': 'linear-gradient(90deg, #ffffff 0%, #ffffff 45%, #FFE135 55%, #FFD700 100%)',
  'slip-yellow-orange': 'linear-gradient(90deg, #FFD700 0%, #FFD700 45%, #FFA500 55%, #FF8C00 100%)',
  'slip-orange-green': 'linear-gradient(90deg, #FF8C00 0%, #FF8C00 45%, #228B22 55%, #006400 100%)',
  'slip-green-blue': 'linear-gradient(90deg, #006400 0%, #006400 45%, #4169E1 55%, #0000CD 100%)',
  'slip-blue-brown': 'linear-gradient(90deg, #0000CD 0%, #0000CD 45%, #8B4513 55%, #654321 100%)',
};

// ==========================================================================
// COMPONENT
// ==========================================================================
export function ExamDashboard() {
  const { t, lang } = useT();
  const [selectedBeltId, setSelectedBeltId] = useState('wit');
  const [viewMode, setViewMode] = useState<'all' | 'new'>('all');
  const [showDirectTransition, setShowDirectTransition] = useState(false);
  const [fromBeltId, setFromBeltId] = useState('wit');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [videoModal, setVideoModal] = useState<{ youtubeId: string; nameJa: string; nameNl: string } | null>(null);

  const selectedBelt = BELT_LEVELS.find(b => b.id === selectedBeltId)!;
  const fromBelt = BELT_LEVELS.find(b => b.id === fromBeltId);
  const beltReq = BELT_REQUIREMENTS[selectedBeltId];

  // Get previous belt requirements (for "new" mode)
  function getPreviousBeltRequirements(): BeltRequirements | null {
    if (showDirectTransition) return BELT_REQUIREMENTS[fromBeltId] || null;
    const idx = BELT_LEVELS.findIndex(b => b.id === selectedBeltId);
    if (idx === 0) return null;
    return BELT_REQUIREMENTS[BELT_LEVELS[idx - 1].id] || null;
  }

  const prevBeltReq = getPreviousBeltRequirements();

  // Toggle category expand/collapse
  function toggleCategory(catId: string) {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(catId)) {
        next.delete(catId);
      } else {
        next.add(catId);
      }
      return next;
    });
  }

  function expandAll() {
    setExpandedCategories(new Set(CATEGORY_ORDER));
  }

  function collapseAll() {
    setExpandedCategories(new Set());
  }

  // Render belt buttons
 function renderBeltButtons() {
    return (
      <div className="flex flex-wrap gap-3">
        {BELT_LEVELS.map(belt => {
          const isActive = selectedBeltId === belt.id;
          const bgColor = BELT_COLORS[belt.color] || '#ccc';

          return (
            <AnimatedButton key={belt.id} onClick={() => { setSelectedBeltId(belt.id); setShowDirectTransition(false); }}>
              <div className={`relative w-12 h-6 rounded transition-all duration-300 ${isActive ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-[#a90000]' : 'hover:scale-105'}`} style={{ background: bgColor, boxShadow: isActive ? '0 4px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)' : '0 2px 4px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2)' }} title={t(belt.name)}>
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity">
                  {t(belt.name)}
                </span>
              </div>
            </AnimatedButton>
          );
        })}
      </div>
    );
  }

  // Render categories
  function renderCategories() {
    return (
      <div className="space-y-2">
        {CATEGORY_ORDER.map(catId => {
          const cat = CATEGORIES[catId];
          if (!cat) return null;

          const total = catId === 'ukemi-waza' ? 4 : (beltReq.requirements[catId] || 0);
          const prev = catId === 'ukemi-waza' ? 4 : (prevBeltReq?.requirements[catId] || 0);
          const newCount = total - prev;

          // Ukemi (valbreektechnieken) are always shown — they're basic white belt fundamentals.
          // Other categories: skip in "new" mode if no new techniques.
          if (viewMode === 'new' && newCount === 0 && catId !== 'ukemi-waza') return null;

          const displayCount = viewMode === 'new' ? newCount : total;
          const isNew = viewMode === 'new' && newCount > 0 && catId !== 'ukemi-waza';
          const isExpanded = expandedCategories.has(catId);

          // Get techniques to display
          const techniques = catId === 'ukemi-waza'
            ? cat.techniques
            : (viewMode === 'new' ? cat.techniques.slice(prev, total) : cat.techniques.slice(0, total));

          return (
            <AnimatedCard key={catId} variants={subtleHover}>
              <div className="border-b border-gray-200 last:border-0">
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(catId)}
                  className="w-full p-3 sm:p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-sm shrink-0">
                    <svg viewBox="0 0 32 32" className="w-9 h-9 sm:w-11 sm:h-11" fill="none" stroke="#a90000" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      {CAT_ICONS[catId]}
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-gray-800 text-sm sm:text-base">{t(cat.nameNl)}</div>
                    <div className="text-xs sm:text-sm text-[#a90000] font-medium">{cat.nameJa}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isNew && (
                    <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
                      +{newCount} nieuw
                    </span>
                  )}
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center text-lg font-bold ${isNew ? 'bg-gradient-to-br from-green-500 to-green-600 text-white' : 'bg-gradient-to-br from-[#a90000] to-[#8c0000] text-white'} shadow`}>
                    {catId === 'ukemi-waza' ? 4 : displayCount}
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>

              {/* Expanded Content — always show both counts + technique names */}
              {isExpanded && (
                <div className="px-3 sm:px-4 pb-4 bg-gradient-to-b from-gray-50 to-white animate-fadeIn">
                  <div className="grid gap-2 pt-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {techniques.map((tech, idx) => {
                      const num = catId === 'ukemi-waza' ? (idx + 1) : (viewMode === 'new' ? (prev + idx + 1) : (idx + 1));

                      return (
                        <div key={tech.id} className={`p-2 sm:p-3 rounded-lg border-l-4 shadow-sm hover:shadow-md transition-all ${tech.forbidden ? 'border-l-red-500 bg-red-50' : 'border-l-[#a90000] bg-white'}`}>
                          <div className="flex items-start gap-2">
                            <span className={`font-semibold text-sm flex-1 ${tech.forbidden ? 'text-red-500' : 'text-gray-800'}`}>
                              {num}. {tech.nameJa}
                            </span>
                            {tech.youtubeId && (
                              <AnimatedButton onClick={() => { setVideoModal({ youtubeId: tech.youtubeId!, nameJa: tech.nameJa, nameNl: tech.nameNl }); }} variants={subtleHover}>
                                <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-[#a90000] hover:bg-[#8c0000] text-white flex items-center justify-center transition-colors shadow" title={`${t('Video')}: ${tech.nameJa}`}>
                                  <Play className="w-3.5 h-3.5 ml-0.5" />
                                </div>
                              </AnimatedButton>
                            )}
                          </div>
                          <span className="block text-xs text-gray-500 mt-0.5">{techDutchFor(tech.nameNl, lang)}</span>
                          {tech.forbidden && (
                            <span className="inline-block mt-1 px-1.5 py-0.5 bg-red-100 text-red-500 text-[10px] font-semibold rounded">
                              verboden
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            </AnimatedCard>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#a90000] to-[#8c0000] rounded-lg p-4 sm:p-5 text-white shadow-lg overflow-hidden relative">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M20 0L40 20L20 40L0 20z\'/%3E%3C/g%3E%3C/svg%3E")' }}></div>
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold relative z-10">{t('Exameneisen')}</h1>
        <p className="text-white/80 mt-1 text-xs sm:text-sm relative z-10">{t('Kies je bandniveau voor de exameneisen')}</p>
      </div>

      {/* Control Panel */}
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-5 relative overflow-hidden border-t-4 border-gradient-to-r from-[#a90000] via-[#DC143C] to-[#FFD700]">
        <div className="space-y-4">
          {/* Belt Buttons */}
          <div>
            <label className="block text-sm font-semibold text-[#a90000] mb-2 uppercase tracking-wide">{t('Band selecteren')}</label>
            {renderBeltButtons()}
            <div className="mt-8 p-3 bg-gray-50 rounded-lg border-l-4 border-[#a90000]">
              <span className="text-sm text-gray-600">{t('Geselecteerd:')} </span>
              <strong className="text-sm text-[#a90000]">{selectedBelt.name}</strong>
              {selectedBelt.kyu && <span className="text-sm text-gray-500 ml-1">({selectedBelt.kyu}e kyu)</span>}
            </div>
          </div>

          {/* View Mode Toggle */}
          <div>
            <label className="block text-sm font-semibold text-[#a90000] mb-2 uppercase tracking-wide">{t('Weergave')}</label>
            <div className="flex rounded-lg overflow-hidden border-2 border-[#a90000] bg-white">
              <button
                onClick={() => setViewMode('all')}
                className={`flex-1 py-2 px-3 text-sm font-semibold transition-all ${viewMode === 'all' ? 'bg-[#a90000] text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                {t('Alles')}
              </button>
              <button
                onClick={() => setViewMode('new')}
                className={`flex-1 py-2 px-3 text-sm font-semibold transition-all border-l-2 border-[#a90000] ${viewMode === 'new' ? 'bg-[#DC143C] text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                {t('Alleen nieuw')}
              </button>
            </div>
          </div>

          {/* Nieuw vanaf — keus van welke band je over gaat */}
          <div>
            <label className="block text-sm font-semibold text-[#a90000] mb-2 uppercase tracking-wide">{t('Nieuw vanaf')}</label>
            <div className="flex flex-wrap gap-2">
              {(() => {
                const idx = BELT_LEVELS.findIndex(b => b.id === selectedBeltId)
                const opts = [BELT_LEVELS[idx - 1], BELT_LEVELS[idx - 2]].filter(Boolean)
                if (!opts.length) return <span className="text-xs text-gray-500">{t('Eerste niveau — alles is nieuw')}</span>
                return opts.map(b => {
                  const actief = viewMode === 'new' && (showDirectTransition ? fromBeltId === b.id : b.id === opts[0].id)
                  return (
                    <button
                      key={b.id}
                      onClick={() => { setFromBeltId(b.id); setShowDirectTransition(b.id !== opts[0].id); setViewMode('new'); }}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border-2 transition-all ${actief ? 'border-[#DC143C] bg-[#DC143C] text-white' : 'border-gray-300 text-gray-600 hover:border-[#DC143C] hover:text-[#DC143C]'}`}
                    >
                      Nieuw vanaf {t(b.name)}
                    </button>
                  )
                })
              })()}
            </div>
            <p className="text-[11px] text-gray-500 mt-1.5">{t('Gebruik dit als je een band of slip overslaat — er worden dan meer technieken verwacht.')}</p>
          </div>
        </div>
      </div>

      {/* Content Panel */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Content Header */}
        <div className="bg-gradient-to-r from-[#a90000] to-[#8c0000] p-3 sm:p-4 flex justify-between items-center relative text-white">
          <h2 className="text-base sm:text-lg font-bold">
            {showDirectTransition ? `${t(fromBelt?.name || '')} → ${t(selectedBelt.name)}` : `${t('Exameneisen')} ${t(selectedBelt.name)}`}
          </h2>
          <div className="flex gap-2">
            <AnimatedButton onClick={expandAll} variants={subtleHover}>
              <div className="px-3 py-1.5 text-xs font-semibold bg-white/15 hover:bg-white/25 rounded border border-white/20 backdrop-blur-sm transition-all text-white">
                {t('Alles openen')}
              </div>
            </AnimatedButton>
            <AnimatedButton onClick={collapseAll} variants={subtleHover}>
              <div className="px-3 py-1.5 text-xs font-semibold bg-white/15 hover:bg-white/25 rounded border border-white/20 backdrop-blur-sm transition-all text-white">
                {t('Alles sluiten')}
              </div>
            </AnimatedButton>
          </div>
        </div>

        {/* Categories */}
        {renderCategories()}

        {/* Extra Info */}
        <div className="border-t-3 border-[#a90000] bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-[#a90000] mb-3 uppercase tracking-wide">{t('Extra eisen')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <AnimatedCard variants={subtleHover}>
              <div className="flex items-center justify-between p-3 sm:p-4 bg-white rounded-lg shadow hover:shadow-lg transition-all">
                <div>
                  <div className="font-bold text-gray-800">Nage-komi</div>
                  <div className="text-xs text-gray-500 mt-0.5">{t('Vrije worpen in 1 minuut')}</div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-br from-[#a90000] to-[#DC143C] bg-clip-text text-transparent">
                  {beltReq.nageKomi}
                </div>
              </div>
            </AnimatedCard>
            <AnimatedCard variants={subtleHover}>
              <div className="flex items-center justify-between p-3 sm:p-4 bg-white rounded-lg shadow hover:shadow-lg transition-all">
                <div>
                  <div className="font-bold text-gray-800">Kanteltechnieken</div>
                  <div className="text-xs text-gray-500 mt-0.5">{t('Aantal kanteltechnieken')}</div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-br from-[#a90000] to-[#DC143C] bg-clip-text text-transparent">
                  {beltReq.kantelTechnieken}
                </div>
              </div>
            </AnimatedCard>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {videoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setVideoModal(null)}>
          <div className="relative w-full max-w-3xl bg-white rounded-lg overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#a90000] to-[#8c0000] p-4 flex items-center justify-between">
              <div>
                <h3 className="text-white font-bold text-lg">{videoModal.nameJa}</h3>
                <p className="text-white/80 text-sm">{techDutchFor(videoModal.nameNl, lang)}</p>
              </div>
              <button
                onClick={() => setVideoModal(null)}
                className="w-10 h-10 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Video Embed */}
            <div className="aspect-video w-full">
              <iframe
                src={`https://www.youtube.com/embed/${videoModal.youtubeId}?rel=0`}
                title={videoModal.nameJa}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
