'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ExamDashboard } from '@/components/sections/ExamDashboard';
import { JapaneseCourseSection } from '@/components/sections/JapaneseCourseSection';
import { MembershipSection } from '@/components/sections/MembershipSection';
import { ScheduleSection } from '@/components/sections/ScheduleSection';
import { BeltKnotsSection } from '@/components/sections/BeltKnotsSection';
import { PhotoGallery } from '@/components/gallery/PhotoGallery';
import { VideoGallery } from '@/components/gallery/VideoGallery';
import { LocationSection } from '@/components/sections/LocationSection';
import { ContactSection } from '@/components/sections/ContactSection';
import { NewsSection } from '@/components/sections/NewsSection';
import { TechniquesCardSection } from '@/components/sections/TechniquesCardSection';
import { LegalSection } from '@/components/sections/LegalSection';
import { clubInfo } from '@/data/club-info';
import { agendaItems, type AgendaItem } from '@/data/agenda';
import { newsArchive } from '@/data/news-archive';
import { techniqueCategories, type TechniqueCategory, type Technique } from '@/data/techniques';
import {
  beltLevels as examBeltLevels,
  techniqueCategories as examCategories,
  techniques as examTechniques,
  beltRequirements,
  getTechniquesForBelt,
  getNewTechniquesForBelt,
  getCategoryInfo,
  getParentBelt,
  type BeltLevel,
  type Technique as ExamTechnique,
  type TechniqueCategory as ExamTechniqueCategory
} from '@/data/exam-requirements';
import {
  Home, Calendar, Swords, Target, FileText, Info, User,
  Menu, X, ChevronRight, ChevronLeft, MapPin, Clock,
  Play, Eye, EyeOff, CheckCircle2, XCircle, Award, Trophy, Ban,
  Flame, Star, Users, Mail, Facebook, Youtube, ArrowRight,
  BookOpen, Shield, CircleDot, Sparkles, Video, Camera, Filter,
  Plus, List, Layers, Search
} from 'lucide-react';

// ============ TYPES ============
type Section = 
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
  | 'juridisch';

interface NavItem {
  key: Section;
  label: string;
  icon: React.ReactNode;
}

interface NavGroup {
  label: string;
  emoji: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: 'Club',
    emoji: '🏠',
    items: [
      { key: 'home', label: 'Home', icon: <Home className="w-4 h-4" /> },
      { key: 'agenda', label: 'Agenda', icon: <Calendar className="w-4 h-4" /> },
      { key: 'leden', label: 'Lid Worden', icon: <Users className="w-4 h-4" /> },
      { key: 'lestijden', label: 'Lestijden', icon: <Clock className="w-4 h-4" /> },
      { key: 'locatie', label: 'Locatie', icon: <MapPin className="w-4 h-4" /> },
      { key: 'info', label: 'Over Ons', icon: <Info className="w-4 h-4" /> },
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
      { key: 'foto-galerij', label: 'Foto\'s', icon: <Camera className="w-4 h-4" /> },
      { key: 'video-galerij', label: 'Video\'s', icon: <Video className="w-4 h-4" /> },
    ],
  },
];

// Alle items voor search
const allNavItems: NavItem[] = navGroups.flatMap(g => g.items);

const mobileNavItems: NavItem[] = [
  { key: 'home', label: 'Home', icon: <Home className="w-5 h-5" /> },
  { key: 'agenda', label: 'Agenda', icon: <Calendar className="w-5 h-5" /> },
  { key: 'technieken', label: 'Technieken', icon: <Swords className="w-5 h-5" /> },
  { key: 'exameneisen', label: 'Exameneisen', icon: <Target className="w-5 h-5" /> },
  { key: 'leden', label: 'Lid Worden', icon: <Users className="w-5 h-5" /> },
];

// ============ EMOJI MAP ============
function getEmojiIcon(emoji: string, className = "w-5 h-5") {
  switch (emoji) {
    case 'ban': return <Ban className={`${className} text-[#c00000]`} />;
    case 'medal': return <Trophy className={`${className} text-[#c00000]`} />;
    case 'champagne': return <Sparkles className={`${className} text-[#c00000]`} />;
    case 'xmark': return <XCircle className={`${className} text-[#c00000]`} />;
    default: return <CircleDot className={`${className} text-[#c00000]`} />;
  }
}

// ============ LOGO COMPONENT ============
function ClubLogo({ className = "", alt = "Judoclub Michigami" }: { className?: string; alt?: string }) {
  return <img src="/logo.png" alt={alt} className={className} />;
}

// ============ MAIN APP ============
export default function MichigamiApp() {
  const [activeSection, setActiveSection] = useState<Section>('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const scrollAreaRef = useRef(null);

  // Scroll naar boven bij sectie-wissel (behalve agenda)
  useEffect(() => {
    if (activeSection !== 'agenda') {
      const viewport = document.querySelector('[data-slot="scroll-area-viewport"]');
      if (viewport) {
        viewport.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [activeSection]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f8f9fa] w-full overflow-x-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-[#e8eaed] min-h-screen fixed left-0 top-0 z-40">
        <SidebarContent activeSection={activeSection} onSelect={(s) => setActiveSection(s)} />
      </aside>

      {/* Sidebar Content — Mobile: hamburger button + overlay */}
      <div className="md:hidden fixed top-3 left-3 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2.5 rounded-xl bg-white shadow-lg border border-[#e8eaed] hover:shadow-xl transition-shadow"
        >
          {sidebarOpen ? <X className="w-5 h-5 text-gray-600" /> : <Menu className="w-5 h-5 text-gray-600" />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setSidebarOpen(false)}>
          <aside className="w-72 bg-white min-h-screen shadow-xl max-w-[calc(100vw-1rem)]" onClick={(e) => e.stopPropagation()}>
            <SidebarContent activeSection={activeSection} onSelect={(s) => { setActiveSection(s); setSidebarOpen(false); }} />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 md:ml-64 pb-28 sm:pb-20 md:pb-0 w-full min-w-0">
        <ScrollArea className="h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-3.5rem)] md:h-screen w-full">
          <div className="p-2 sm:p-4 md:p-8 max-w-[100vw] mx-auto w-full pb-16 sm:pb-0">
            {activeSection === 'home' && <HomeSection onNavigate={setActiveSection} />}
            {activeSection === 'agenda' && <AgendaSection />}
            {activeSection === 'technieken' && <TechniquesSection />}
            {activeSection === 'exameneisen' && <ExamDashboard />}
            {activeSection === 'cursusjapans' && <JapaneseCourseSection />}
            {activeSection === 'formulieren' && <FormsSection />}
            {activeSection === 'info' && <InfoSection />}
            {activeSection === 'login' && <LoginSection />}
            {activeSection === 'leden' && <MembershipSection />}
            {activeSection === 'lestijden' && <ScheduleSection />}
            {activeSection === 'band-knopen' && <BeltKnotsSection />}
            {activeSection === 'foto-galerij' && <PhotoGallery />}
            {activeSection === 'video-galerij' && <VideoGallery />}
            {activeSection === 'locatie' && <LocationSection />}
            {activeSection === 'contact' && <ContactSection />}
            {activeSection === 'nieuws' && <NewsSection />}
            {activeSection === 'techniekenkaart' && <TechniquesCardSection />}
            {activeSection === 'juridisch' && <LegalSection />}
          </div>
        </ScrollArea>
      </main>

    {/* Bottom Navigation - Mobile only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#e8eaed] shadow-[0_-2px_10px_rgba(0,0,0,0.1)] w-full safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-1 max-w-full">
          {mobileNavItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveSection(item.key)}
              className={`flex flex-col items-center justify-center gap-0.5 px-1.5 py-1 rounded-lg transition-all ${
                activeSection === item.key
                  ? 'text-[#a90000] bg-[#fdf6f6]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {item.icon}
              <span className="text-[10px] font-medium truncate">{item.label}</span>
            </button>
          ))}
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex flex-col items-center justify-center gap-0.5 px-1.5 py-1 rounded-lg text-gray-500 hover:text-gray-700"
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] font-medium truncate">Meer</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

// ============ SIDEBAR ============
function SidebarContent({ activeSection, onSelect }: { activeSection: Section; onSelect: (s: Section) => void }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  const toggleGroup = (label: string) => {
    setOpenGroup(prev => prev === label ? null : label);
  };

  // Filter items by search
  const filteredGroups = searchQuery.trim()
    ? navGroups
        .map(g => ({
          ...g,
          items: g.items.filter(item =>
            item.label.toLowerCase().includes(searchQuery.toLowerCase())
          ),
        }))
        .filter(g => g.items.length > 0)
    : navGroups;

  return (
    <div className="flex flex-col h-full">
      {/* Logo / Brand */}
      <div className="p-4 border-b border-[#e8eaed] flex flex-col items-center">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#fdf6f6] to-white border-2 border-[#a90000]/10 flex items-center justify-center mb-2 shadow-sm">
          <ClubLogo className="w-18 h-18 object-contain" />
        </div>
        <p className="text-[10px] text-gray-400">Opgericht in 1993</p>
      </div>

      {/* Search Bar */}
      <div className="px-3 py-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Zoek..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-[#f8f9fa] border border-[#e8eaed] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#a90000]/30 focus:border-[#a90000] placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-2 py-1">
        <div className="space-y-1">
          {filteredGroups.map((group) => (
            <div key={group.label}>
              {/* Group Header */}
              {!searchQuery.trim() && (
                <button
                  onClick={() => toggleGroup(group.label)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600 transition-colors"
                >
                  <span className="text-sm">{group.emoji}</span>
                  <span>{group.label}</span>
                  <ChevronRight
                    className={`w-3 h-3 ml-auto transition-transform ${
                      openGroup === group.label ? 'rotate-90' : ''
                    }`}
                  />
                </button>
              )}

              {/* Group Items */}
              {(openGroup === group.label || searchQuery.trim()) && (
                <div className="space-y-0.5">
                  {group.items.map((item) => (
                    <button
                      key={item.key}
                      onClick={() => onSelect(item.key)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
                        activeSection === item.key
                          ? 'bg-[#fdf6f6] text-[#a90000] font-medium'
                          : 'text-gray-600 hover:bg-[#f8f9fa] hover:text-gray-800'
                      }`}
                    >
                      {item.icon}
                      <span className="truncate">{item.label}</span>
                      {activeSection === item.key && (
                        <div className="w-1 h-1 rounded-full bg-[#a90000] ml-auto flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Separator */}
              {!searchQuery.trim() && (
                <div className="px-2 py-1">
                  <div className="h-px bg-[#e8eaed]" />
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t border-[#e8eaed]">
        <div className="flex items-center gap-2 justify-center">
          <a href="https://www.facebook.com/judoclubmichigami" target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-md hover:bg-[#f8f9fa] text-gray-400 hover:text-[#a90000] transition-colors">
            <Facebook className="w-4 h-4" />
          </a>
          <a href="mailto:judoclub_michigami@hotmail.com" className="p-1.5 rounded-md hover:bg-[#f8f9fa] text-gray-400 hover:text-[#a90000] transition-colors">
            <Mail className="w-4 h-4" />
          </a>
          <a href="https://www.youtube.com/channel/UC8tXSKppIMF6awS2cj7w50A" target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-md hover:bg-[#f8f9fa] text-gray-400 hover:text-[#a90000] transition-colors">
            <Youtube className="w-4 h-4" />
          </a>
        </div>
        <p className="text-[10px] text-gray-400 text-center mt-1.5">Opgericht in 1993</p>
      </div>
    </div>
  );
}

// ============ HERO SLIDER ============
const heroImages = [
  '/hero/michigami-25jaar-1.jpg',
  '/hero/budodag-actie-1.jpg',
  '/hero/heerle-toernooi-1.jpg',
  '/hero/dojo-2024.jpg',
];

function HeroSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-48 sm:h-56 md:h-72 lg:h-80 overflow-hidden rounded-2xl">
      {heroImages.map((src, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            idx === current ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={src}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        </div>
      ))}

      {/* Content overlay */}
      <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 md:p-8 text-white z-10">
        <div className="flex items-center gap-2 sm:gap-3 mb-2">
          <ClubLogo className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 object-contain flex-shrink-0" />
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Judoclub Michigami</h1>
            <p className="text-white/80 text-xs sm:text-sm">Steenbergen • Opgericht in 1993</p>
          </div>
        </div>
      </div>

      {/* Dots */}
      <div className="absolute bottom-3 right-4 sm:bottom-4 sm:right-6 flex gap-1.5 z-20">
        {heroImages.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`w-2 h-2 rounded-full transition-all ${
              idx === current ? 'bg-white w-5' : 'bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// ============ HOME SECTION ============
function HomeSection({ onNavigate }: { onNavigate: (s: Section) => void }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcomingEvents = agendaItems.filter(i => !i.cancelled && new Date(i.compareDate) >= today).slice(0, 3);

  // Haal nieuwste nieuwsberichten (laatste 3 uit meest recente jaar)
  const latestNews = [];
  for (const year of [...newsArchive].reverse()) {
    latestNews.push(...year.articles.slice(0, 3));
    if (latestNews.length >= 3) break;
  }

  return (
    <div className="space-y-6 pb-4 sm:pb-0">
      {/* Hero Slider */}
      <HeroSlider />

      {/* Quick Links — met mooie icoontjes */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#a90000]" /> Snel naar...
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { key: 'agenda' as Section, label: 'Agenda', desc: 'Evenementen', icon: Calendar, color: '#a90000', bg: '#fdf6f6' },
            { key: 'technieken' as Section, label: 'Technieken', desc: 'Alle technieken', icon: Swords, color: '#e67e22', bg: '#fef5ee' },
            { key: 'exameneisen' as Section, label: 'Examens', desc: 'Per bandniveau', icon: Target, color: '#0054a6', bg: '#eef4fb' },
            { key: 'leden' as Section, label: 'Lid Worden', desc: 'Meld je aan', icon: Users, color: '#27ae60', bg: '#eefbf3' },
            { key: 'lestijden' as Section, label: 'Lestijden', desc: 'Wo & Vr', icon: Clock, color: '#8e44ad', bg: '#f4eef9' },
            { key: 'locatie' as Section, label: 'Locaties', desc: '2 locaties', icon: MapPin, color: '#d35400', bg: '#fdf0ea' },
            { key: 'cursusjapans' as Section, label: 'Cursus Japans', desc: 'Leer + quiz', icon: BookOpen, color: '#2980b9', bg: '#eef6fb' },
            { key: 'contact' as Section, label: 'Contact', desc: 'Neem contact op', icon: Mail, color: '#c0392b', bg: '#fdecea' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all hover:shadow-md hover:-translate-y-0.5 active:scale-95"
              style={{ backgroundColor: item.bg, borderColor: item.color + '20' }}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: item.color + '15' }}>
                <item.icon className="w-6 h-6" style={{ color: item.color }} />
              </div>
              <span className="font-semibold text-sm" style={{ color: item.color }}>{item.label}</span>
              <span className="text-xs text-gray-500">{item.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Widgets row — Agenda + Nieuws */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Agenda Widget */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #fdf6f6 0%, white 100%)' }}>
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Calendar className="w-4 h-4" style={{ color: '#a90000' }} /> Agenda
            </h3>
            <button onClick={() => onNavigate('agenda')} className="text-xs font-medium hover:underline" style={{ color: '#a90000' }}>
              Alles →
            </button>
          </div>
          <div className="p-4 space-y-3">
            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Geen komende evenementen</p>
            ) : upcomingEvents.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#fdf6f6] transition-colors">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-white" style={{ background: 'linear-gradient(135deg, #a90000, #c00000)' }}>
                  {getEmojiIcon(item.emoji, "w-5 h-5")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{item.event}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.displayDate} {item.time !== '-' && `• ${item.time}`}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Nieuws Widget */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #eef6fb 0%, white 100%)' }}>
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4" style={{ color: '#2980b9' }} /> Nieuws
            </h3>
            <button onClick={() => onNavigate('nieuws')} className="text-xs font-medium hover:underline" style={{ color: '#2980b9' }}>
              Alles →
            </button>
          </div>
          <div className="p-4 space-y-3">
            {latestNews.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Geen nieuwsberichten</p>
            ) : latestNews.map((article, idx) => (
              <div key={idx} className="p-2.5 rounded-xl hover:bg-[#eef6fb] transition-colors cursor-pointer" onClick={() => onNavigate('nieuws')}>
                <p className="text-sm font-semibold text-gray-800 line-clamp-2">{article.title}</p>
                <p className="text-xs text-gray-400 mt-1">{article.date || ''}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Training Info — 2 locaties */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Woensdag */}
        <div className="bg-gradient-to-br from-[#fdf6f6] to-white rounded-2xl shadow-sm border border-[#a90000]/10 p-5">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#a9000015' }}>
              <Clock className="w-7 h-7" style={{ color: '#a90000' }} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 text-lg">Woensdagavond</h3>
              <p className="text-sm text-gray-500 mt-0.5">Algemene training — alle leeftijden</p>
              <div className="flex items-center gap-3 mt-3">
                <span className="text-sm font-bold" style={{ color: '#a90000' }}>19:00 - 20:00</span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Oud-Vossemeer
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Vrijdag */}
        <div className="bg-gradient-to-br from-[#eef6fb] to-white rounded-2xl shadow-sm border border-[#2980b9]/10 p-5">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#2980b915' }}>
              <Clock className="w-7 h-7" style={{ color: '#2980b9' }} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 text-lg">Vrijdagavond</h3>
              <div className="space-y-2 mt-1.5">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold" style={{ color: '#2980b9' }}>18:45 - 19:45</span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500">Groep 1 (6-9 jaar)</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold" style={{ color: '#2980b9' }}>19:45 - 20:45</span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500">Groep 2+ (9+ jaar)</span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <MapPin className="w-3 h-3" style={{ color: '#2980b9' }} />
                <span className="text-xs text-gray-500">Steenbergen</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ INFO SECTION (Meer over ons) ============
function InfoSection() {
  return (
    <div className="space-y-6">
      {/* Hero */}
      <Card className="overflow-hidden border-0 shadow-sm sm:shadow-lg">
        <div className="relative bg-gradient-to-br from-[#a90000] via-[#8c0000] to-[#7a0000] text-white p-4 sm:p-6 md:p-10 overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{clubInfo.fullName}</h1>
            <p className="text-white/80 mt-2 text-sm sm:text-base">{clubInfo.tagline}</p>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="history" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-[#f5f5f0]">
          <TabsTrigger value="history" className="text-xs sm:text-sm">Geschiedenis</TabsTrigger>
          <TabsTrigger value="leiding" className="text-xs sm:text-sm">Leiding</TabsTrigger>
          <TabsTrigger value="judo" className="text-xs sm:text-sm">Wat is Judo?</TabsTrigger>
          <TabsTrigger value="lesson" className="text-xs sm:text-sm">Lessen</TabsTrigger>
          <TabsTrigger value="belts" className="text-xs sm:text-sm">Banden</TabsTrigger>
        </TabsList>

    <TabsContent value="history" className="space-y-4 mt-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[#fdf6f6] flex items-center justify-center flex-shrink-0 mt-1">
                  <Calendar className="w-5 h-5 text-[#a90000]" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 mb-2">Onze geschiedenis</h3>
                  {clubInfo.history.split('\n\n').map((paragraph, i) => (
                    <p key={i} className="text-sm text-gray-600 leading-relaxed mb-3 last:mb-0">{paragraph}</p>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-[#fdf6f6] flex items-center justify-center mb-2">
                  <Users className="w-6 h-6 text-[#a90000]" />
                </div>
                <h3 className="font-semibold text-gray-800 text-sm">Groepen</h3>
                <p className="text-xs text-gray-500 mt-1">3 leeftijdsgroepen</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-[#fdf6f6] flex items-center justify-center mb-2">
                  <Clock className="w-6 h-6 text-[#a90000]" />
                </div>
                <h3 className="font-semibold text-gray-800 text-sm">Training</h3>
                <p className="text-xs text-gray-500 mt-1">Woensdag & vrijdag</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => window.open(clubInfo.locations[0].mapsUrl, '_blank')}>
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-[#fdf6f6] flex items-center justify-center mb-2">
                  <MapPin className="w-6 h-6 text-[#a90000]" />
                </div>
                <h3 className="font-semibold text-gray-800 text-sm">Locatie</h3>
                <p className="text-xs text-gray-500 mt-1">{clubInfo.locations[0].address}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ==================== LEIDING TAB ==================== */}
        <TabsContent value="leiding" className="space-y-4 mt-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 sm:p-6 space-y-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#a90000]" /> Huidige leiding
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Sinds 2021 zorgt een nieuwe generatie voor de toekomst van Judoclub Michigami. 
                Drie vrienden die al bijna vanaf de oprichting samen judo oefenen, regionale en internationale wedstrijden doen, 
                en alle drie de zwarte band (3e dan) hebben behaald.
              </p>
              <div className="space-y-3">
                {clubInfo.leadership.current.map((person) => (
                  <div key={person.name} className="p-4 rounded-xl bg-[#fdf6f6] border border-[#fce0e0]">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#a90000] to-[#c00000] text-white flex items-center justify-center flex-shrink-0 font-bold text-sm">
                        {person.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-800">{person.name}</h4>
                        <p className="text-xs font-medium text-[#a90000] mt-0.5">{person.dan} • {person.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 sm:p-6 space-y-3">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Award className="w-5 h-5 text-[#a90000]" /> Oprichter & Erfenis
              </h3>
              <div className="p-4 rounded-xl bg-gradient-to-br from-[#fdf6f6] to-white border border-[#fce0e0]">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8c0000] to-[#a90000] text-white flex items-center justify-center flex-shrink-0 font-bold text-sm">
                    KV
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-800">{clubInfo.leadership.founder.name}</h4>
                    <p className="text-xs font-medium text-[#a90000] mt-0.5">{clubInfo.leadership.founder.dan} • {clubInfo.leadership.founder.role}</p>
                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">{clubInfo.leadership.founder.description}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================== WAT IS JUDO TAB ==================== */}
        <TabsContent value="judo" className="space-y-4 mt-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 sm:p-6 space-y-4">
              <h3 className="font-bold text-gray-800">Wat is judo?</h3>
              {clubInfo.whatIsJudo.split('\n\n').map((paragraph, i) => (
                <p key={i} className="text-sm text-gray-600 leading-relaxed">{paragraph}</p>
              ))}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 sm:p-6 space-y-3">
              <h3 className="font-bold text-gray-800">Voor wie is judo geschikt?</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{clubInfo.philosophy}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lesson" className="space-y-4 mt-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 sm:p-6 space-y-4">
              <h3 className="font-bold text-gray-800">Hoe gaat zo'n judoles?</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{clubInfo.lessonStructure}</p>
              <div className="bg-[#fdf6f6] rounded-xl p-4 space-y-2">
                <h4 className="font-semibold text-sm text-[#a90000]">Tip voor proeflessen</h4>
                <p className="text-xs text-gray-600">Kom je voor het eerst? Trek dan een joggingpak of trainingspak aan zonder scherpe delen (gespen, knopen). Een judopak is de eerste maand niet verplicht!</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 sm:p-6 space-y-3">
              <h3 className="font-bold text-gray-800">Judokleding (judogi)</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Judo wordt beoefend in speciale kleding. Deze judopakken of judogi zijn gemaakt om aan te kunnen trekken. 
                Let op: koop geen karatepak, daar deze niet bestand zijn tegen het trek en duwwerk van de judosport!
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">
                Judo wordt beoefend op de blote voeten. Zorg daarom voor schone voeten en kortgeknipte nagels.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="belts" className="space-y-4 mt-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 sm:p-6 space-y-4">
              <h3 className="font-bold text-gray-800">Judobanden</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Aan de hand van de kleur band die een judoka draagt, kun je zien hoe ver gevorderd hij/zij is. 
                Als beginneling start je met een witte band. De volgorde van banden is:
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  { color: 'bg-white border-gray-300', name: 'Wit' },
                  { color: 'bg-yellow-400', name: 'Geel' },
                  { color: 'bg-orange-500', name: 'Oranje' },
                  { color: 'bg-green-600', name: 'Groen' },
                  { color: 'bg-blue-700', name: 'Blauw' },
                  { color: 'bg-amber-800', name: 'Bruin' },
                  { color: 'bg-gray-900', name: 'Zwart' },
                ].map((belt) => (
                  <div key={belt.name} className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-gray-100 shadow-sm">
                    <div className={`w-6 h-6 rounded-full ${belt.color} border`} />
                    <span className="text-xs font-medium text-gray-700">{belt.name}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Dit zijn de zogenaamde kyu-graden. Om een andere band te verkrijgen moet je examen doen. 
                Ben je nog geen 13, dan zijn er tevens slippen te verdienen — stukken gekleurde band die je kunt verdienen door goed je best te doen tijdens de lessen.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 sm:p-6 space-y-3">
              <h3 className="font-bold text-gray-800">Zwarte band (Dan-graden)</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Na de gekleurde banden van de kyu-graden komt de zwarte band. Om hiervoor examen te mogen doen, moet je minimaal 16 jaar zijn. 
                Je moet dan voor een judocommissie verschijnen van hele hoge judoka's. Zwarte banden noemen ze Dan-graden.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 sm:p-6 space-y-3">
              <h3 className="font-bold text-gray-800">Judo wedstrijden</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Hoewel de meeste judoka's judoën om lekker bezig te zijn, zijn er ook jongens en meisjes die graag meedoen aan wedstrijden. 
                Tijdens deze wedstrijden kun je medailles of bekers winnen. Voor de echte fanatieke judoka's is het zelfs mogelijk om aan internationale wedstrijden deel te nemen.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Contact CTA */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-[#fdf6f6] to-white">
        <CardContent className="p-4 sm:p-6 text-center space-y-3">
          <h3 className="font-bold text-gray-800">Interesse in judo?</h3>
          <p className="text-sm text-gray-600 max-w-lg mx-auto">
            Kom gerust eens kijken op een training - je bent van harte welkom! 
            Als het je bevalt, kun je direct starten met <span className="font-semibold text-[#a90000]">{clubInfo.costs.proeflessen}</span>.
          </p>
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            <Button onClick={() => window.open('https://forms.office.com/r/8Vw9kPcLT6', '_blank')} className="bg-[#a90000] hover:bg-[#8c0000] text-sm">
              Inschrijven
            </Button>
            <Button variant="outline" onClick={() => window.open(`mailto:${clubInfo.email}`)} className="text-sm">
              <Mail className="w-4 h-4 mr-2" /> Neem contact op voor proefles
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============ AGENDA SECTION ============
function AgendaSection() {
  const firstFutureRef = useRef<HTMLElement>(null);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const firstFutureIdx = agendaItems.findIndex(i => !i.cancelled && new Date(i.compareDate) >= today);

  useEffect(() => {
    if (firstFutureRef.current) {
      setTimeout(() => {
        // Scroll within the ScrollArea container
        const scrollContainer = firstFutureRef.current.closest('[data-slot="scroll-area-viewport"]') 
          || firstFutureRef.current.closest('.ScrollAreaViewport')
          || document.querySelector('[data-slot="scroll-area-viewport"]');
        
        if (scrollContainer) {
          const elementTop = firstFutureRef.current.getBoundingClientRect().top + scrollContainer.scrollTop;
          scrollContainer.scrollTo({
            top: elementTop - scrollContainer.clientHeight / 3,
            behavior: 'smooth',
          });
        } else {
          firstFutureRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    }
  }, []);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#a90000] to-[#8c0000] rounded-2xl p-4 sm:p-5 md:p-6 lg:p-8 text-white shadow-lg relative overflow-hidden">
        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold truncate">Judoclub Michigami</h1>
        <p className="text-white/80 mt-1 text-xs sm:text-sm">Activiteitenkalender <span className="font-bold text-[#fce0e0]">2026</span></p>
        <div className="w-10 sm:w-12 md:w-16 h-0.5 sm:h-1 bg-white/30 rounded-full mt-2 sm:mt-3" />
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm overflow-hidden border border-[#e8eaed]">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#fdf6f6]">
              <th className="px-5 py-4 text-left text-xs font-semibold text-[#5c0000] uppercase tracking-wider"><Calendar className="w-4 h-4 inline mr-2" />Datum</th>
              <th className="px-3 py-4 w-10"></th>
              <th className="px-5 py-4 text-left text-xs font-semibold text-[#5c0000] uppercase tracking-wider"><Flame className="w-4 h-4 inline mr-2" />Evenement</th>
              <th className="px-5 py-4 text-left text-xs font-semibold text-[#5c0000] uppercase tracking-wider">Details</th>
              <th className="px-5 py-4 text-left text-xs font-semibold text-[#5c0000] uppercase tracking-wider"><MapPin className="w-4 h-4 inline mr-2" />Locatie</th>
              <th className="px-5 py-4 text-left text-xs font-semibold text-[#5c0000] uppercase tracking-wider"><Clock className="w-4 h-4 inline mr-2" />Tijd/Info</th>
            </tr>
          </thead>
          <tbody>
            {agendaItems.map((item, idx) => {
              const eventDate = new Date(item.compareDate);
              eventDate.setHours(0, 0, 0, 0);
              const isPast = !item.cancelled && eventDate < today;
              const isFirstFuture = idx === firstFutureIdx;

              return (
                <tr
                  key={idx}
                  ref={isFirstFuture ? firstFutureRef : null}
                  className={`border-b border-[#e8eaed] last:border-b-0 transition-colors hover:bg-[#fff2f2] ${
                    item.cancelled ? 'cancelled-event' : isPast ? 'past-event' : ''
                  }`}
                >
                  <td className={`px-5 py-4 font-semibold whitespace-nowrap ${
                    item.cancelled ? 'text-[#c00000] line-through opacity-60' : isPast ? 'text-gray-400 font-medium' : 'text-[#8c0000]'
                  }`}>
                    {item.displayDate}
                  </td>
                  <td className="px-3 py-4 text-center">{getEmojiIcon(item.emoji)}</td>
                  <td className="px-5 py-4">
                    <span className={`font-semibold ${item.cancelled ? 'text-[#c00000]' : isPast ? 'text-gray-400 font-medium' : 'text-[#c00000]'}`}>
                      {item.event}
                    </span>
                    {item.eventSub && (
                      <span className={`block text-sm mt-0.5 ${isPast ? 'text-gray-400' : 'text-gray-500'}`}>
                        {item.eventSub}
                      </span>
                    )}
                  </td>
                  <td className={`px-5 py-4 text-sm ${isPast ? 'text-gray-400' : 'text-gray-600'}`}>
                    {item.details || '-'}
                  </td>
                  <td className="px-5 py-4 text-sm">
                    {item.locationUrl && item.location !== '-' ? (
                      <a href={item.locationUrl} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-1 hover:underline ${isPast ? 'text-gray-400 pointer-events-none line-through' : 'text-[#c00000] hover:text-[#a00000]'}`}>
                        <MapPin className="w-3.5 h-3.5" /> {item.location}
                      </a>
                    ) : (
                      <span className={isPast ? 'text-gray-400' : 'text-gray-600'}>{item.location}</span>
                    )}
                    {item.locationSub && <span className="block text-xs text-gray-400">{item.locationSub}</span>}
                  </td>
                  <td className="px-5 py-4 text-sm">
                    <span className={isPast ? 'text-gray-400' : 'text-gray-600'}>{item.time}</span>
                    {item.inschrijfUrl && !item.cancelled && !isPast && (
                      <a href={item.inschrijfUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1.5 bg-[#d90000] text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-[#b20000] hover:-translate-y-0.5 transition-all shadow-sm">
                        <ArrowRight className="w-3.5 h-3.5" /> {item.inschrijfTekst}
                      </a>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Layout */}
      <div className="md:hidden space-y-3">
        {agendaItems.map((item, idx) => {
          const eventDate = new Date(item.compareDate);
          eventDate.setHours(0, 0, 0, 0);
          const isPast = !item.cancelled && eventDate < today;
          const isFirstFuture = idx === firstFutureIdx;

          return (
            <div
              key={idx}
              ref={isFirstFuture ? firstFutureRef : null}
              className={`bg-white rounded-xl border shadow-sm overflow-hidden ${
                item.cancelled ? 'border-red-200 opacity-60' : isPast ? 'border-gray-200 opacity-60' : 'border-[#ddc0c0]'
              }`}
            >
              <div className={`px-4 py-2 flex items-center gap-2 ${
                item.cancelled ? 'bg-red-50' : isPast ? 'bg-gray-50' : 'bg-[#fdf6f6]'
              }`}>
                {getEmojiIcon(item.emoji, "w-4 h-4")}
                <span className={`text-xs font-semibold ${item.cancelled ? 'text-[#c00000] line-through' : isPast ? 'text-gray-400' : 'text-[#8c0000]'}`}>
                  {item.displayDate}
                </span>
                {item.cancelled && <Badge variant="destructive" className="text-[10px] ml-auto">AFGELAST</Badge>}
                {isPast && !item.cancelled && <Badge variant="secondary" className="text-[10px] ml-auto">Voorbij</Badge>}
              </div>
              <div className="px-4 py-3 space-y-1">
                <p className={`font-semibold text-sm ${item.cancelled ? 'text-[#c00000]' : isPast ? 'text-gray-400' : 'text-[#c00000]'}`}>
                  {item.event} {item.eventSub && <span className="font-normal text-gray-500">{item.eventSub}</span>}
                </p>
                {item.details && <p className="text-xs text-gray-500">{item.details}</p>}
                <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                  {item.location !== '-' && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{item.location}</span>}
                  {item.time !== '-' && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{item.time}</span>}
                </div>
                {item.inschrijfUrl && !item.cancelled && !isPast && (
                  <a href={item.inschrijfUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1.5 bg-[#d90000] text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-[#b20000] transition-colors">
                    <ArrowRight className="w-3.5 h-3.5" /> {item.inschrijfTekst}
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .past-event td { opacity: 0.6; color: #777 !important; }
        .past-event .text-\\[\\#8c0000\\] { color: #888 !important; font-weight: 500; }
        .past-event .text-\\[\\#c00000\\] { color: #888 !important; font-weight: 500; }
        .cancelled-event td { text-decoration: line-through; opacity: 0.6; background-color: #fafafa; }
        .cancelled-event .text-\\[\\#c00000\\] { color: #c00000 !important; text-decoration: line-through; }
      `}</style>
    </div>
  );
}

// ============ TECHNIQUES SECTION ============
function TechniquesSection() {
  const [activeCategory, setActiveCategory] = useState(0);
  const [expandedTech, setExpandedTech] = useState<number | null>(null);
  const [showVideo, setShowVideo] = useState<Record<number, boolean>>({});

  const category = techniqueCategories[activeCategory];

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-[#a90000] to-[#8c0000] rounded-2xl p-4 sm:p-5 text-white shadow-lg overflow-hidden">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold flex items-center gap-1.5 sm:gap-2 truncate"><Swords className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" /> Technieken</h1>
        <p className="text-white/80 mt-1 text-xs sm:text-sm">Alle judotechnieken met video-uitleg</p>
      </div>

     {/* Category Tabs */}
      <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 flex-wrap" style={{ scrollbarWidth: 'thin', WebkitOverflowScrolling: 'touch' }}>
        {techniqueCategories.map((cat, idx) => (
          <button
            key={cat.key}
            onClick={() => { setActiveCategory(idx); setExpandedTech(null); }}
            className={`flex-shrink-0 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-sm font-medium transition-all whitespace-nowrap ${
              activeCategory === idx
                ? 'bg-[#a90000] text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-[#fdf6f6] border border-gray-200'
            }`}
          >
            <span className="hidden sm:inline">{cat.label}</span>
            <span className="sm:hidden truncate max-w-[60px]">{cat.label.split(' ')[0]}</span>
            <span className="ml-1 text-[10px] opacity-70 hidden sm:inline">{cat.labelJp}</span>
          </button>
        ))}
      </div>

      {/* Techniques Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {category.techniques.map((tech) => (
          <Card key={tech.id} className="border-0 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <button
                onClick={() => setExpandedTech(expandedTech === tech.id ? null : tech.id)}
                className="w-full text-left p-3 md:p-4 hover:bg-[#fdf6f6] transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1 flex items-center gap-2">
                    <span className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#a90000]/10 text-[#a90000] font-bold text-xs sm:text-sm flex items-center justify-center border border-[#a90000]/20">
                      {tech.id}
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-bold text-[#a90000] text-sm md:text-base truncate">{tech.name}</h3>
                      <p className="text-xs md:text-sm text-gray-500 mt-0.5 truncate">{tech.dutch}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                    <span className="text-base md:text-lg text-gray-300 font-light hidden sm:inline">{tech.japanese}</span>
                    {expandedTech === tech.id ? <ChevronLeft className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                  </div>
                </div>
              </button>
              {expandedTech === tech.id && tech.youtubeId && (
                <div className="border-t border-[#e8eaed]">
                  <div className="flex items-center justify-between px-3 md:px-4 py-2 bg-[#fdf6f6]">
                    <span className="text-xs text-gray-500 flex items-center gap-1"><Play className="w-3 h-3" /> Video</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 hidden sm:inline">Toon video</span>
                      <Switch
                        checked={showVideo[tech.id] || false}
                        onCheckedChange={(v) => setShowVideo(prev => ({ ...prev, [tech.id]: v }))}
                      />
                    </div>
                  </div>
                  {showVideo[tech.id] && (
                    <div className="aspect-video">
                      <iframe
                        src={`https://www.youtube.com/embed/${tech.youtubeId}`}
                        title={tech.name}
                        className="w-full h-full"
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      />
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ============ EXAM REQUIREMENTS SECTION (Exameneisendashboard) ============
function ExamRequirementsSection() {
  const [selectedBeltId, setSelectedBeltId] = useState<string>("wit");
  const [showOnlyNew, setShowOnlyNew] = useState(false);
  const [showTechniqueNames, setShowTechniqueNames] = useState(true);
  const [showDutchTranslation, setShowDutchTranslation] = useState(true);
  const [showVideoPlaceholders, setShowVideoPlaceholders] = useState(false);

  const selectedBelt = examBeltLevels.find(b => b.id === selectedBeltId)!;
  const beltReq = beltRequirements.find(r => r.beltId === selectedBeltId);
  const allTechs = getTechniquesForBelt(selectedBeltId);
  const newTechs = getNewTechniquesForBelt(selectedBeltId);

  // Get parent belt color for slip belts
  const parentBelt = selectedBelt.isSlip ? getParentBelt(selectedBeltId) : null;

  // Sub-categories ordered for display (nage-waza subcategories, then katame-waza subcategories)
  const nageSubCategories = examCategories.filter(c => c.parent === "nage-waza");
  const katameSubCategories = examCategories.filter(c => c.parent === "katame-waza");

  // Get belt color with good contrast for text
  const getBeltTextColor = (color: string): string => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.6 ? '#333333' : '#ffffff';
  };

  // Find matching YouTube video for a technique
  const findVideoForTechnique = (nameJa: string): string | undefined => {
    const normalized = nameJa.toLowerCase().replace(/-/g, ' ');
    for (const cat of techniqueCategories) {
      const tech = cat.techniques.find(t => t.name.toLowerCase().replace(/-/g, ' ') === normalized && t.youtubeId);
      if (tech) return tech.youtubeId;
    }
    // Try partial match
    for (const cat of techniqueCategories) {
      const tech = cat.techniques.find(t => {
        const techNorm = t.name.toLowerCase().replace(/-/g, ' ');
        return (techNorm.includes(normalized) || normalized.includes(techNorm)) && t.youtubeId;
      });
      if (tech) return tech.youtubeId;
    }
    return undefined;
  };

  const displayTechs = showOnlyNew ? newTechs : allTechs;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#a90000] to-[#8c0000] rounded-2xl p-4 sm:p-5 md:p-6 lg:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold flex items-center gap-1.5 sm:gap-2 truncate">
            <Target className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" /> Exameneisen
          </h1>
          <p className="text-white/80 mt-1 text-xs sm:text-sm">Overzicht van exameneisen per bandniveau</p>
          <div className="w-10 sm:w-12 md:w-16 h-0.5 sm:h-1 bg-white/30 rounded-full mt-2 sm:mt-3" />
        </div>
      </div>

      {/* Belt Selector Bar */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-3">
          <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
            {examBeltLevels.map((belt) => {
              const isActive = selectedBeltId === belt.id;
              const textColor = getBeltTextColor(belt.color);
              return (
                <button
                  key={belt.id}
                  onClick={() => setSelectedBeltId(belt.id)}
                  className={`flex-shrink-0 relative px-2 py-1.5 md:px-3 md:py-2 rounded-xl text-[10px] md:text-xs font-semibold transition-all ${
                    isActive
                      ? 'ring-2 ring-[#a90000] ring-offset-1 shadow-md scale-105'
                      : 'hover:scale-105 opacity-80 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: belt.isSlip ? (getParentBelt(belt.id)?.color || belt.color) : belt.color,
                    color: belt.isSlip ? getBeltTextColor(getParentBelt(belt.id)?.color || belt.color) : textColor,
                    borderBottomWidth: belt.isSlip ? '4px' : '0',
                    borderBottomColor: belt.color,
                  }}
                >
                  {belt.isSlip && (
                    <span className="absolute bottom-0 left-0 right-0 h-1 rounded-b-lg" style={{ backgroundColor: belt.color }} />
                  )}
                  <span className="whitespace-nowrap">{belt.colorName}</span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Toggle Controls */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-3 sm:p-4">
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {/* Alles / Alleen nieuw */}
            <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-[#f8f9fa]">
              <span className="text-xs font-medium text-gray-600 truncate">{showOnlyNew ? 'Alleen nieuw' : 'Alles'}</span>
              <Switch
                checked={showOnlyNew}
                onCheckedChange={setShowOnlyNew}
              />
            </div>
            {/* Aantallen / Technieken */}
            <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-[#f8f9fa]">
              <span className="text-xs font-medium text-gray-600 truncate">{showTechniqueNames ? 'Technieken' : 'Aantallen'}</span>
              <Switch
                checked={showTechniqueNames}
                onCheckedChange={setShowTechniqueNames}
              />
            </div>
            {/* Nederlandse vertaling */}
            <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-[#f8f9fa]">
              <span className="text-xs font-medium text-gray-600 truncate">Ned. vertaling</span>
              <Switch
                checked={showDutchTranslation}
                onCheckedChange={setShowDutchTranslation}
              />
            </div>
            {/* Video / Illustraties */}
            <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-[#f8f9fa]">
              <span className="text-xs font-medium text-gray-600 flex items-center gap-1 truncate"><Video className="w-3 h-3 flex-shrink-0" /> Video&apos;s</span>
              <Switch
                checked={showVideoPlaceholders}
                onCheckedChange={setShowVideoPlaceholders}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Belt Info */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <div
          className="p-4 flex items-center gap-3"
          style={{
            backgroundColor: selectedBelt.isSlip ? (parentBelt?.color || selectedBelt.color) : selectedBelt.color,
            borderBottomWidth: selectedBelt.isSlip ? '6px' : '0',
            borderBottomColor: selectedBelt.isSlip ? selectedBelt.color : undefined,
          }}
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center border-2 border-white/30"
            style={{
              backgroundColor: selectedBelt.color,
              color: getBeltTextColor(selectedBelt.color)
            }}
          >
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold" style={{ color: selectedBelt.isSlip ? getBeltTextColor(parentBelt?.color || selectedBelt.color) : getBeltTextColor(selectedBelt.color) }}>
              {selectedBelt.name}
            </h2>
            {selectedBelt.kyu && (
              <p className="text-sm opacity-80" style={{ color: selectedBelt.isSlip ? getBeltTextColor(parentBelt?.color || selectedBelt.color) : getBeltTextColor(selectedBelt.color) }}>
                {selectedBelt.kyu}e kyu
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* General Requirements */}
      {beltReq && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#a90000]" /> Algemene eisen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="text-center p-3 rounded-xl bg-[#fdf6f6]">
                <p className="text-2xl font-bold text-[#a90000]">{beltReq.ukemiWaza}</p>
                <p className="text-xs text-gray-500 mt-1">Ukemi-waza</p>
                <p className="text-[10px] text-gray-400">Valbreektechnieken</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-[#fdf6f6]">
                <p className="text-2xl font-bold text-[#a90000]">{beltReq.nageKomi}</p>
                <p className="text-xs text-gray-500 mt-1">Nage-komi</p>
                <p className="text-[10px] text-gray-400">Worpen in 1 min</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-[#fdf6f6]">
                <p className="text-2xl font-bold text-[#a90000]">{beltReq.kantelTechnieken}</p>
                <p className="text-xs text-gray-500 mt-1">Kanteltechnieken</p>
                <p className="text-[10px] text-gray-400">Omkeertechnieken</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Nage-waza Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2 px-1">
          <Swords className="w-4 h-4 text-[#a90000]" /> Nage-waza — Werptechnieken
        </h3>
        {nageSubCategories.map(cat => {
          const reqCount = beltReq?.requirements[cat.id] || 0;
          if (reqCount === 0 && !displayTechs[cat.id]) return null;
          const catTechs = displayTechs[cat.id] || [];
          const newCatTechs = newTechs[cat.id] || [];
          const newIds = new Set(newCatTechs.map(t => t.id));

          return (
            <Card key={cat.id} className="border-0 shadow-sm overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="text-[#a90000] font-bold">{cat.nameJa}</span>
                    {showDutchTranslation && <span className="text-gray-400 font-normal text-sm">— {cat.nameNl}</span>}
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {catTechs.length}/{reqCount}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {!showTechniqueNames ? (
                  <p className="text-sm text-gray-600">{reqCount} technieken vereist</p>
                ) : (
                  <div className="space-y-1.5">
                    {catTechs.map(tech => {
                      const isNew = newIds.has(tech.id);
                      const videoId = findVideoForTechnique(tech.nameJa);
                      return (
                        <div key={tech.id}>
                          <div
                            className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                              isNew ? 'bg-[#fef3f2] border border-[#fecaca]' : 'hover:bg-[#f8f9fa]'
                            }`}
                          >
                            {isNew && (
                              <Badge className="bg-[#a90000] text-white text-[10px] px-1.5 py-0 flex-shrink-0">NIEUW</Badge>
                            )}
                            <div className="flex-1 min-w-0">
                              <span className="font-semibold text-sm text-[#a90000]">{tech.nameJa}</span>
                              {showDutchTranslation && (
                                <span className="text-xs text-gray-500 ml-2">{tech.nameNl}</span>
                              )}
                            </div>
                            {tech.forbidden && (
                              <Badge variant="destructive" className="text-[10px] flex-shrink-0">
                                <Ban className="w-3 h-3 mr-1" /> Verboden
                              </Badge>
                            )}
                          </div>
                          {showVideoPlaceholders && (
                            <div className="ml-4 mt-1 mb-1">
                              {videoId ? (
                                <div className="aspect-video rounded-lg overflow-hidden border border-[#e8eaed]">
                                  <iframe
                                    src={`https://www.youtube.com/embed/${videoId}`}
                                    title={tech.nameJa}
                                    className="w-full h-full"
                                    allowFullScreen
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  />
                                </div>
                              ) : (
                                <div className="aspect-video rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
                                  <div className="text-center">
                                    <Camera className="w-8 h-8 text-gray-300 mx-auto mb-1" />
                                    <p className="text-xs text-gray-400">Video — Coming soon</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {catTechs.length === 0 && reqCount === 0 && (
                      <p className="text-xs text-gray-400 italic">Geen technieken vereist voor deze band</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Katame-waza Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2 px-1">
          <Shield className="w-4 h-4 text-[#a90000]" /> Katame-waza — Controletechnieken
        </h3>
        {katameSubCategories.map(cat => {
          const reqCount = beltReq?.requirements[cat.id] || 0;
          if (reqCount === 0 && !displayTechs[cat.id]) return null;
          const catTechs = displayTechs[cat.id] || [];
          const newCatTechs = newTechs[cat.id] || [];
          const newIds = new Set(newCatTechs.map(t => t.id));

          return (
            <Card key={cat.id} className="border-0 shadow-sm overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="text-[#a90000] font-bold">{cat.nameJa}</span>
                    {showDutchTranslation && <span className="text-gray-400 font-normal text-sm">— {cat.nameNl}</span>}
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {catTechs.length}/{reqCount}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {!showTechniqueNames ? (
                  <p className="text-sm text-gray-600">{reqCount} technieken vereist</p>
                ) : (
                  <div className="space-y-1.5">
                    {catTechs.map(tech => {
                      const isNew = newIds.has(tech.id);
                      const videoId = findVideoForTechnique(tech.nameJa);
                      return (
                        <div key={tech.id}>
                          <div
                            className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                              isNew ? 'bg-[#fef3f2] border border-[#fecaca]' : 'hover:bg-[#f8f9fa]'
                            }`}
                          >
                            {isNew && (
                              <Badge className="bg-[#a90000] text-white text-[10px] px-1.5 py-0 flex-shrink-0">NIEUW</Badge>
                            )}
                            <div className="flex-1 min-w-0">
                              <span className="font-semibold text-sm text-[#a90000]">{tech.nameJa}</span>
                              {showDutchTranslation && (
                                <span className="text-xs text-gray-500 ml-2">{tech.nameNl}</span>
                              )}
                            </div>
                            {tech.forbidden && (
                              <Badge variant="destructive" className="text-[10px] flex-shrink-0">
                                <Ban className="w-3 h-3 mr-1" /> Verboden
                              </Badge>
                            )}
                          </div>
                          {showVideoPlaceholders && (
                            <div className="ml-4 mt-1 mb-1">
                              {videoId ? (
                                <div className="aspect-video rounded-lg overflow-hidden border border-[#e8eaed]">
                                  <iframe
                                    src={`https://www.youtube.com/embed/${videoId}`}
                                    title={tech.nameJa}
                                    className="w-full h-full"
                                    allowFullScreen
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  />
                                </div>
                              ) : (
                                <div className="aspect-video rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
                                  <div className="text-center">
                                    <Camera className="w-8 h-8 text-gray-300 mx-auto mb-1" />
                                    <p className="text-xs text-gray-400">Video — Coming soon</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {catTechs.length === 0 && reqCount === 0 && (
                      <p className="text-xs text-gray-400 italic">Geen technieken vereist voor deze band</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Ukemi-waza (always shown) */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <span className="text-[#a90000] font-bold">Ukemi-waza</span>
              {showDutchTranslation && <span className="text-gray-400 font-normal text-sm">— Valbreektechnieken</span>}
            </CardTitle>
            <Badge variant="secondary" className="text-xs">4</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {showTechniqueNames ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(displayTechs["ukemi-waza"] || examTechniques["ukemi-waza"]).map(tech => (
                <div key={tech.id} className="flex items-center gap-2 p-2 rounded-lg bg-[#f8f9fa]">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-sm text-[#a90000]">{tech.nameJa}</span>
                    {showDutchTranslation && (
                      <span className="text-xs text-gray-500 ml-1">{tech.nameNl}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600">4 valbreektechnieken vereist</p>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      {beltReq && (
        <Card className="border-0 shadow-sm bg-gradient-to-r from-[#fdf6f6] to-white">
          <CardContent className="p-3 sm:p-4">
            <h3 className="text-xs sm:text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 sm:mb-3 flex items-center gap-2">
              <List className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#a90000] flex-shrink-0" /> Samenvatting
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 sm:gap-2">
              {Object.entries(beltReq.requirements).map(([catId, count]) => {
                if (count === 0) return null;
                const catInfo = getCategoryInfo(catId);
                return (
                  <div key={catId} className="text-center p-1.5 sm:p-2 rounded-lg bg-white border border-[#e8eaed]">
                    <p className="text-base sm:text-lg font-bold text-[#a90000]">{count}</p>
                    <p className="text-[10px] sm:text-xs text-gray-500 truncate">{catInfo?.nameJa || catId}</p>
                  </div>
                );
              })}
            </div>
            <div className="mt-2 sm:mt-3 p-2 rounded-lg bg-white border border-[#e8eaed] text-center">
              <span className="text-xs sm:text-sm text-gray-600 break-words">
                Totaal: <span className="font-bold text-[#a90000]">{Object.values(beltReq.requirements).reduce((a, b) => a + b, 0)}</span> technieken + {beltReq.ukemiWaza} ukemi + {beltReq.nageKomi} nage-komi + {beltReq.kantelTechnieken} kantel
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
