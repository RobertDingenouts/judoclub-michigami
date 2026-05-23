import React from 'react';
import {
  Home, Calendar, Swords, Target, FileText, Info, User,
  Menu, X, ChevronRight, ChevronLeft, MapPin, Clock,
  Play, Eye, EyeOff, CheckCircle2, XCircle, Award, Trophy, Ban,
  Flame, Star, Users, Mail, Facebook, Youtube, ArrowRight,
  BookOpen, Shield, CircleDot, Sparkles, Video, Camera, Filter,
  Plus, List, Layers, Search
} from 'lucide-react';

// Backward compatibility alias - defined first to allow circular reference
export type SectionId =
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
  | 'media-hub'
  | 'timeline'
  | 'diplomas'
  | 'examen-goedkeuren';

export type Section = SectionId;

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
    emoji: '🏠',
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
    emoji: '🥋',
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
    emoji: '📸',
    items: [
      { key: 'nieuws', label: 'Nieuws', icon: <Sparkles className="w-4 h-4" /> },
      { key: 'foto-galerij', label: "Foto's", icon: <Camera className="w-4 h-4" /> },
      { key: 'video-galerij', label: "Video's", icon: <Video className="w-4 h-4" /> },
    ],
  },
];

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

// Re-export sectionLabels for backward compatibility
export const sectionLabels: Record<Section, string> = {
  home: 'Home',
  agenda: 'Agenda',
  technieken: 'Technieken',
  exameneisen: 'Exameneisen',
  cursusjapans: 'Cursus Japans',
  formulieren: 'Formulieren',
  info: 'Info',
  login: 'Inloggen',
  leden: 'Lid Worden',
  lestijden: 'Lestijden',
  'band-knopen': 'Band Knopen',
  'foto-galerij': 'Foto Galerij',
  'video-galerij': 'Video Galerij',
  locatie: 'Locatie',
  contact: 'Contact',
  nieuws: 'Nieuws',
  techniekenkaart: 'Techniekenkaart',
  juridisch: 'Juridisch',
  'club-hub': 'Club Hub',
  'judoschool-hub': 'Judo School Hub',
  'media-hub': 'Media Hub',
  timeline: 'Geschiedenis',
  diplomas: 'Mijn Diplomas',
  'examen-goedkeuren': 'Examen Goedkeuren',
};
