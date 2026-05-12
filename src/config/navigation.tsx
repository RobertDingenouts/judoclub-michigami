import React from 'react';
import {
  Home, Calendar, Swords, Target, FileText, Info, User,
  Menu, X, ChevronRight, ChevronLeft, MapPin, Clock,
  Play, Eye, EyeOff, CheckCircle2, XCircle, Award, Trophy, Ban,
  Flame, Star, Users, Mail, Facebook, Youtube, ArrowRight,
  BookOpen, Shield, CircleDot, Sparkles, Video, Camera, Filter,
  Plus, List, Layers, Search
} from 'lucide-react';

// ============ TYPES ============
export type Section =
  | 'home'
  | 'agenda'
  | 'technieken'
  | 'exameneisen'
  | 'cursusjapans'
  | 'formulieren'
  | 'info'
  | 'login'
  | 'leden'
  | 'lestijden'
  | 'band-knopen'
  | 'foto-galerij'
  | 'video-galerij'
  | 'locatie'
  | 'contact'
  | 'nieuws'
  | 'techniekenkaart'
  | 'juridisch'
  | 'club-hub'
  | 'judoschool-hub'
  | 'media-hub';

export interface NavItem {
  key: Section;
  label: string;
  icon: React.ReactNode;
}

export interface NavGroup {
  label: string;
  emoji: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    label: 'Club',
    emoji: '\u{1F3E0}',
    items: [
      { key: 'home', label: 'Home', icon: <Home className="w-4 h-4" /> },
      { key: 'agenda', label: 'Agenda', icon: <Calendar className="w-4 h-4" /> },
      { key: 'info', label: 'Over Ons', icon: <Info className="w-4 h-4" /> },
      { key: 'leden', label: 'Lid Worden', icon: <Users className="w-4 h-4" /> },
      { key: 'lestijden', label: 'Lestijden', icon: <Clock className="w-4 h-4" /> },
      { key: 'locatie', label: 'Locatie', icon: <MapPin className="w-4 h-4" /> },
      { key: 'contact', label: 'Contact', icon: <Mail className="w-4 h-4" /> },
      { key: 'juridisch', label: 'Juridisch', icon: <Shield className="w-4 h-4" /> },
    ],
  },
  {
    label: 'Judo School',
    emoji: '\u{1F94B}',
    items: [
      { key: 'technieken', label: 'Technieken', icon: <Swords className="w-4 h-4" /> },
      { key: 'exameneisen', label: 'Exameneisen', icon: <Target className="w-4 h-4" /> },
      { key: 'cursusjapans', label: 'Cursus Japans', icon: <BookOpen className="w-4 h-4" /> },
      { key: 'techniekenkaart', label: 'Techniekenkaart', icon: <Layers className="w-4 h-4" /> },
      { key: 'band-knopen', label: 'Band Knopen', icon: <Shield className="w-4 h-4" /> },
    ],
  },
  {
    label: 'Media',
    emoji: '\u{1F4F8}',
    items: [
      { key: 'nieuws', label: 'Nieuws', icon: <Sparkles className="w-4 h-4" /> },
      { key: 'foto-galerij', label: "Foto's", icon: <Camera className="w-4 h-4" /> },
      { key: 'video-galerij', label: "Video's", icon: <Video className="w-4 h-4" /> },
    ],
  },
];

// Alle items voor search
export const allNavItems: NavItem[] = navGroups.flatMap(g => g.items);

export const mobileNavItems: NavItem[] = [
  { key: 'home', label: 'Home', icon: <Home className="w-5 h-5" /> },
  { key: 'agenda', label: 'Agenda', icon: <Calendar className="w-5 h-5" /> },
  { key: 'technieken', label: 'Technieken', icon: <Swords className="w-5 h-5" /> },
  { key: 'exameneisen', label: 'Exameneisen', icon: <Target className="w-5 h-5" /> },
  { key: 'leden', label: 'Lid Worden', icon: <Users className="w-5 h-5" /> },
];

export const groupHubMap: Record<string, Section> = {
  'Club': 'club-hub',
  'Judo School': 'judoschool-hub',
  'Media': 'media-hub',
};

// ============ ITEM DESCRIPTIONS & COLORS ============
export const itemDescriptions: Record<string, string> = {
  // Club
  'home': 'Welkom & overzicht',
  'agenda': 'Evenementen & data',
  'leden': 'Lidmaatschap & kosten',
  'lestijden': 'Trainingstijden',
  'locatie': 'Onze locaties',
  'info': 'Geschiedenis & leiding',
  'contact': 'Neem contact op',
  'juridisch': 'Privacy & voorwaarden',
  // Judo School
  'technieken': 'Alle judotechnieken',
  'exameneisen': 'Eisen per bandniveau',
  'cursusjapans': 'Japanse termen leren',
  'techniekenkaart': 'Overzicht kaarten',
  'band-knopen': 'Hoe je judoband knoopt',
  // Media
  'nieuws': 'Nieuwsberichten',
  'foto-galerij': 'Fotoalbum',
  'video-galerij': 'Videogalerij',
};

export const itemColors: Record<string, { color: string; bg: string }> = {
  'home': { color: '#c00000', bg: '#fff2f2' },
  'agenda': { color: '#c00000', bg: '#fff2f2' },
  'leden': { color: '#8c0000', bg: '#fff2f2' },
  'lestijden': { color: '#c00000', bg: '#fce8e8' },
  'locatie': { color: '#8c0000', bg: '#fff2f2' },
  'info': { color: '#c00000', bg: '#fff2f2' },
  'contact': { color: '#8c0000', bg: '#fff2f2' },
  'juridisch': { color: '#6c757d', bg: '#f4f5f6' },
  'technieken': { color: '#8c0000', bg: '#fff2f2' },
  'exameneisen': { color: '#c00000', bg: '#fce8e8' },
  'cursusjapans': { color: '#c00000', bg: '#fce8e8' },
  'techniekenkaart': { color: '#8c0000', bg: '#fff2f2' },
  'band-knopen': { color: '#c00000', bg: '#fce8e8' },
  'nieuws': { color: '#c00000', bg: '#fff2f2' },
  'foto-galerij': { color: '#8c0000', bg: '#fff2f2' },
  'video-galerij': { color: '#c00000', bg: '#fce8e8' },
};

// ============ EMOJI MAP ============
export function getEmojiIcon(emoji: string, className = "w-5 h-5") {
  switch (emoji) {
    case 'ban': return <Ban className={`${className} text-[#c00000]`} />;
    case 'medal': return <Trophy className={`${className} text-[#c00000]`} />;
    case 'champagne': return <Sparkles className={`${className} text-[#c00000]`} />;
    case 'xmark': return <XCircle className={`${className} text-[#c00000]`} />;
    default: return <CircleDot className={`${className} text-[#c00000]`} />;
  }
}
