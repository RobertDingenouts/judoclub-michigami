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
import { agendaItems, type AgendaItem } from '@/data/agenda';
import { techniqueCategories, type TechniqueCategory, type Technique } from '@/data/techniques';
import { judoTerms, type JudoTerm } from '@/data/judo-terms';
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
  Plus, List, Layers
} from 'lucide-react';

// ============ TYPES ============
type Section = 'home' | 'agenda' | 'technieken' | 'exameneisen' | 'cursusjapans' | 'formulieren' | 'info' | 'login';

interface NavItem {
  key: Section;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { key: 'home', label: 'Home', icon: <Home className="w-5 h-5" /> },
  { key: 'agenda', label: 'Agenda', icon: <Calendar className="w-5 h-5" /> },
  { key: 'technieken', label: 'Technieken', icon: <Swords className="w-5 h-5" /> },
  { key: 'exameneisen', label: 'Exameneisen', icon: <Target className="w-5 h-5" /> },
  { key: 'cursusjapans', label: 'Cursus Japans', icon: <BookOpen className="w-5 h-5" /> },
  { key: 'formulieren', label: 'Formulieren', icon: <FileText className="w-5 h-5" /> },
  { key: 'info', label: 'Info', icon: <Info className="w-5 h-5" /> },
  { key: 'login', label: 'Inloggen', icon: <User className="w-5 h-5" /> },
];

const mobileNavItems: NavItem[] = navItems.slice(0, 5);

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

// ============ TORII SVG ============
function ToriiGate({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 80" className={className} fill="currentColor" opacity="0.06">
      <rect x="5" y="8" width="90" height="6" rx="2" />
      <rect x="12" y="18" width="76" height="4" rx="1" />
      <rect x="20" y="18" width="6" height="58" rx="1" />
      <rect x="74" y="18" width="6" height="58" rx="1" />
    </svg>
  );
}

// ============ MAIN APP ============
export default function MichigamiApp() {
  const [activeSection, setActiveSection] = useState<Section>('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f8f9fa] w-full overflow-x-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-[#e8eaed] min-h-screen fixed left-0 top-0 z-40">
        <SidebarContent activeSection={activeSection} onSelect={(s) => setActiveSection(s)} />
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#a90000] to-[#8c0000] text-white shadow-lg w-full">
        <div className="flex items-center justify-between px-4 h-14 max-w-full">
          <div className="flex items-center gap-2 min-w-0">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded-lg hover:bg-white/20 transition-colors flex-shrink-0">
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <span className="font-bold text-lg tracking-wide truncate">道 Michigami</span>
          </div>
          <span className="text-xs opacity-80 flex-shrink-0 ml-2">Judoclub</span>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setSidebarOpen(false)}>
          <aside className="w-72 bg-white min-h-screen shadow-xl max-w-[calc(100vw-1rem)]" onClick={(e) => e.stopPropagation()}>
            <SidebarContent activeSection={activeSection} onSelect={(s) => { setActiveSection(s); setSidebarOpen(false); }} />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 md:ml-64 mt-14 md:mt-0 pb-28 sm:pb-20 md:pb-0 w-full min-w-0 max-w-full">
        <ScrollArea className="h-[calc(100vh-7.5rem)] sm:h-[calc(100vh-3.5rem)] md:h-screen w-full">
          <div className="p-3 sm:p-4 md:p-8 max-w-4xl sm:max-w-5xl md:max-w-6xl mx-auto w-full pb-16 sm:pb-0">
            {activeSection === 'home' && <HomeSection onNavigate={setActiveSection} />}
            {activeSection === 'agenda' && <AgendaSection />}
            {activeSection === 'technieken' && <TechniquesSection />}
            {activeSection === 'exameneisen' && <ExamDashboard />}
            {activeSection === 'cursusjapans' && <ExamDashboardSection />}
            {activeSection === 'formulieren' && <FormsSection />}
            {activeSection === 'info' && <InfoSection />}
            {activeSection === 'login' && <LoginSection />}
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
  return (
    <div className="flex flex-col h-full">
      {/* Logo / Brand */}
      <div className="p-6 border-b border-[#e8eaed]">
        <div className="relative">
          <ToriiGate className="absolute -top-2 -right-2 w-24 h-24 text-[#a90000]" />
          <h1 className="text-2xl font-bold text-[#a90000] tracking-tight">道 Michigami</h1>
          <p className="text-sm text-gray-500 mt-1">Judoclub Steenbergen</p>
          <div className="w-12 h-1 bg-gradient-to-r from-[#a90000] to-[#d90000] rounded-full mt-2" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => onSelect(item.key)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeSection === item.key
                ? 'bg-gradient-to-r from-[#a90000] to-[#8c0000] text-white shadow-md shadow-red-200'
                : 'text-gray-600 hover:bg-[#fdf6f6] hover:text-[#a90000]'
            }`}
          >
            {item.icon}
            {item.label}
            {activeSection === item.key && <ChevronRight className="w-4 h-4 ml-auto" />}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[#e8eaed]">
        <div className="flex items-center gap-3 justify-center">
          <a href="https://www.facebook.com/judoclubmichigami" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-[#fdf6f6] text-gray-400 hover:text-[#a90000] transition-colors">
            <Facebook className="w-4 h-4" />
          </a>
          <a href="mailto:judoclub_michigami@hotmail.com" className="p-2 rounded-lg hover:bg-[#fdf6f6] text-gray-400 hover:text-[#a90000] transition-colors">
            <Mail className="w-4 h-4" />
          </a>
          <a href="https://www.youtube.com/channel/UC8tXSKppIMF6awS2cj7w50A" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-[#fdf6f6] text-gray-400 hover:text-[#a90000] transition-colors">
            <Youtube className="w-4 h-4" />
          </a>
        </div>
        <p className="text-[10px] text-gray-400 text-center mt-2">Opgericht in 1993</p>
      </div>
    </div>
  );
}

// ============ HOME SECTION ============
function HomeSection({ onNavigate }: { onNavigate: (s: Section) => void }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcomingEvents = agendaItems.filter(i => !i.cancelled && new Date(i.compareDate) >= today).slice(0, 3);

  return (
    <div className="space-y-6 pb-4 sm:pb-0">
      {/* Hero Banner */}
      <Card className="overflow-hidden border-0 shadow-sm sm:shadow-lg">
        <div className="relative bg-gradient-to-br from-[#a90000] via-[#8c0000] to-[#7a0000] text-white p-4 sm:p-6 md:p-12 overflow-hidden">
          <ToriiGate className="absolute top-0 right-0 w-24 sm:w-32 md:w-48 h-24 sm:h-32 md:h-48 text-white opacity-[0.07]" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 flex-wrap">
              <span className="text-2xl sm:text-3xl md:text-4xl flex-shrink-0">柔道</span>
              <div className="h-6 sm:h-8 md:h-10 w-px bg-white/30 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight truncate">Judoclub Michigami</h1>
                <p className="text-white/80 text-xs sm:text-sm md:text-base mt-1">Steenbergen</p>
              </div>
            </div>
            <p className="text-sm sm:text-base md:text-lg font-light max-w-xl mt-3 sm:mt-4 leading-relaxed">
              Judo voor jong en oud, voor beginners en gevorderden — recreatief of prestatiegericht
            </p>
            <div className="flex flex-wrap gap-2 sm:gap-3 mt-4 sm:mt-6">
              <Button onClick={() => onNavigate('info')} variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-white/30 text-xs sm:text-sm">
                <Info className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> Meer over ons
              </Button>
              <Button onClick={() => onNavigate('agenda')} variant="outline" size="sm" className="bg-transparent border-white/40 text-white hover:bg-white/10 text-xs sm:text-sm">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> Bekijk agenda
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Links Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {[
          { key: 'agenda' as Section, label: 'Agenda', desc: 'Komende evenementen', icon: <Calendar className="w-6 h-6" />, color: 'from-[#a90000] to-[#c00000]' },
          { key: 'technieken' as Section, label: 'Technieken', desc: 'Alle judotechnieken', icon: <Swords className="w-6 h-6" />, color: 'from-[#f37021] to-[#d35400]' },
          { key: 'exameneisen' as Section, label: 'Exameneisen', desc: 'Eisen per band bekijken', icon: <Target className="w-6 h-6" />, color: 'from-[#0054a6] to-[#003d7a]' },
          { key: 'cursusjapans' as Section, label: 'Cursus Japans', desc: 'Japans leren + quiz', icon: <BookOpen className="w-6 h-6" />, color: 'from-[#7c3aed] to-[#5b21b6]' },
        ].map((item) => (
          <Card key={item.key} className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 border-0 overflow-hidden group" onClick={() => onNavigate(item.key)}>
            <CardContent className="p-3 md:p-4">
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                {item.icon}
              </div>
              <h3 className="font-semibold text-gray-800 text-xs md:text-sm">{item.label}</h3>
              <p className="text-[10px] md:text-xs text-gray-500 mt-0.5">{item.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Upcoming Events */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#a90000]" /> Komende evenementen
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-[#a90000]" onClick={() => onNavigate('agenda')}>
              Alles bekijken <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {upcomingEvents.length === 0 ? (
            <p className="text-gray-500 text-sm">Geen komende evenementen.</p>
          ) : upcomingEvents.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-[#fdf6f6] hover:bg-[#fce0e0] transition-colors">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#a90000] to-[#c00000] text-white flex items-center justify-center flex-shrink-0">
                {getEmojiIcon(item.emoji, "w-5 h-5")}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-800 truncate">{item.event} {item.eventSub && <span className="font-normal text-gray-500">{item.eventSub}</span>}</p>
                <p className="text-xs text-gray-500">{item.displayDate} {item.time !== '-' && `• ${item.time}`}</p>
              </div>
              {item.inschrijfUrl && (
                <a href={item.inschrijfUrl} target="_blank" rel="noopener noreferrer" className="text-xs bg-[#d90000] text-white px-3 py-1.5 rounded-lg hover:bg-[#b20000] transition-colors font-semibold flex-shrink-0">
                  Inschrijven
                </a>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Club Info Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#fdf6f6] flex items-center justify-center mb-2">
              <Users className="w-6 h-6 text-[#a90000]" />
            </div>
            <h3 className="font-semibold text-gray-800">Groepen</h3>
            <p className="text-sm text-gray-500 mt-1">6-9, 9-12 en 13+ jaar</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#fdf6f6] flex items-center justify-center mb-2">
              <Clock className="w-6 h-6 text-[#a90000]" />
            </div>
            <h3 className="font-semibold text-gray-800">Vrijdagavond</h3>
            <p className="text-sm text-gray-500 mt-1">18:45 - 21:45</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#fdf6f6] flex items-center justify-center mb-2">
              <MapPin className="w-6 h-6 text-[#a90000]" />
            </div>
            <h3 className="font-semibold text-gray-800">Locaties</h3>
            <p className="text-sm text-gray-500 mt-1">Steenbergen & Oud-Vossemeer</p>
          </CardContent>
        </Card>
      </div>
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
        firstFutureRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, []);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#a90000] to-[#8c0000] rounded-2xl p-4 sm:p-5 md:p-6 lg:p-8 text-white shadow-lg relative overflow-hidden">
        <ToriiGate className="absolute top-0 right-0 w-20 sm:w-24 md:w-32 h-20 sm:h-24 md:h-32 text-white opacity-[0.06] relative" />
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
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-[#a90000] text-sm md:text-base truncate">{tech.name}</h3>
                    <p className="text-xs md:text-sm text-gray-500 mt-0.5 truncate">{tech.dutch}</p>
                  </div>
                  <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                    <span className="text-base md:text-lg text-gray-300 font-light">{tech.japanese}</span>
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
        <ToriiGate className="absolute top-0 right-0 w-24 sm:w-32 md:w-48 h-24 sm:h-32 md:h-48 text-white opacity-[0.07]" />
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

// ============ EXAM DASHBOARD SECTION (Cursus Japans) ============
type ExamMode = 'overview' | 'learn' | 'quiz';

function ExamDashboardSection() {
  const [selectedBelt, setSelectedBelt] = useState<string | null>(null);
  const [mode, setMode] = useState<ExamMode>('learn');
  const [progress, setProgress] = useState<Record<string, boolean>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('michigami-exam-progress');
      if (saved) return JSON.parse(saved) as Record<string, boolean>;
    }
    return {};
  });
  const [showVideos, setShowVideos] = useState<Record<string, boolean>>({});

  // Flashcard state
  const [currentCard, setCurrentCard] = useState(0);
  const [flipped, setFlipped] = useState(false);

  // Quiz state
  const [quizState, setQuizState] = useState<{ current: number; score: number; answers: (JudoTerm & { options: string[] })[] }>({ current: 0, score: 0, answers: [] });
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizComplete, setQuizComplete] = useState(false);

  useEffect(() => {
    localStorage.setItem('michigami-exam-progress', JSON.stringify(progress));
  }, [progress]);

  const beltLevels = [
    { key: '0', label: 'Witte Band', color: '#e0e0e0', textColor: '#333' },
    { key: '1', label: 'Gele Band', color: '#f9c500', textColor: '#333' },
    { key: '2', label: 'Oranje Band', color: '#f37021', textColor: '#fff' },
    { key: '3', label: 'Groene Band', color: '#009444', textColor: '#fff' },
    { key: '4', label: 'Blauwe Band', color: '#0054a6', textColor: '#fff' },
    { key: '5', label: 'Bruine Band', color: '#8b4513', textColor: '#fff' },
  ];

  // Get terms and techniques for selected belt
  const termsForBelt = selectedBelt ? judoTerms.filter(t => String(t.level) === selectedBelt) : [];
  const categories = [...new Set(termsForBelt.map(t => t.categorie))];
  const completedCount = termsForBelt.filter(t => progress[`${selectedBelt}-${t.uitspraak}`]).length;
  const totalTerms = termsForBelt.length;
  const progressPct = totalTerms > 0 ? (completedCount / totalTerms) * 100 : 0;

  // Find matching technique videos for belt terms
  const techniquesForBelt = selectedBelt ? techniqueCategories.flatMap(cat =>
    cat.techniques
      .filter(tech => {
        return termsForBelt.some(t => t.uitspraak.toLowerCase().replace(/-/g, ' ') === tech.name.toLowerCase().replace(/-/g, ' '));
      })
      .map(tech => ({ ...tech, category: cat.label }))
  ) : [];

  // Start quiz
  const startQuiz = () => {
    if (termsForBelt.length < 4) return;
    const shuffled = [...termsForBelt].sort(() => Math.random() - 0.5);
    const quizTerms = shuffled.slice(0, Math.min(10, shuffled.length));
    const answers = quizTerms.map(term => {
      const wrongOptions = judoTerms.filter(t => t.uitspraak !== term.uitspraak).sort(() => Math.random() - 0.5).slice(0, 3).map(t => t.nederlands);
      const options = [...wrongOptions, term.nederlands].sort(() => Math.random() - 0.5);
      return { ...term, options };
    });
    setQuizState({ current: 0, score: 0, answers });
    setQuizAnswer(null);
    setQuizComplete(false);
    setMode('quiz');
  };

  const handleQuizAnswer = (optionIdx: number, correctAnswer: string) => {
    const isCorrect = quizState.answers[quizState.current].options[optionIdx] === correctAnswer;
    setQuizAnswer(optionIdx);
    if (isCorrect) {
      setQuizState(prev => ({ ...prev, score: prev.score + 1 }));
      // Auto-mark as complete in progress
      const term = quizState.answers[quizState.current];
      setProgress(prev => ({ ...prev, [`${selectedBelt}-${term.uitspraak}`]: true }));
    }
    setTimeout(() => {
      if (quizState.current + 1 >= quizState.answers.length) {
        setQuizComplete(true);
      } else {
        setQuizState(prev => ({ ...prev, current: prev.current + 1 }));
        setQuizAnswer(null);
      }
    }, 1200);
  };

  // Helper: find YouTube ID for a term
  const findVideoForTerm = (termName: string): string | undefined => {
    const normalized = termName.toLowerCase().replace(/-/g, ' ');
    for (const cat of techniqueCategories) {
      const tech = cat.techniques.find(t => t.name.toLowerCase().replace(/-/g, ' ') === normalized && t.youtubeId);
      if (tech) return tech.youtubeId;
    }
    return undefined;
  };

  // ============ BELT SELECT SCREEN ============
  if (!selectedBelt) {
    return (
      <div className="space-y-5">
        <div className="bg-gradient-to-r from-[#a90000] to-[#8c0000] rounded-2xl p-4 sm:p-5 md:p-6 lg:p-8 text-white shadow-lg text-center relative overflow-hidden">
          <ToriiGate className="absolute top-0 right-0 w-20 sm:w-24 md:w-32 h-20 sm:h-24 md:h-32 text-white opacity-[0.06] relative" />
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-wide uppercase truncate">Cursus Japans</h1>
          <p className="text-white/80 mt-2 text-xs sm:text-sm md:text-base">Leer Japanse judo-terminologie</p>
          <div className="w-12 sm:w-16 md:w-20 h-0.5 sm:h-1 bg-white/30 rounded-full mx-auto mt-2 sm:mt-3" />
        </div>

        <h2 className="text-xl font-bold text-gray-800 text-center">Kies een bandniveau</h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {beltLevels.map((belt) => {
            const beltTerms = judoTerms.filter(t => String(t.level) === belt.key);
            const beltCompleted = beltTerms.filter(t => progress[`${belt.key}-${t.uitspraak}`]).length;
            const beltPct = beltTerms.length > 0 ? Math.round((beltCompleted / beltTerms.length) * 100) : 0;
            return (
              <button
                key={belt.key}
                onClick={() => { setSelectedBelt(belt.key); setCurrentCard(0); setFlipped(false); setMode('learn'); }}
                className="p-5 md:p-6 rounded-2xl bg-white border border-[#e8eaed] hover:shadow-lg hover:-translate-y-1 transition-all font-bold text-center relative overflow-hidden group"
                style={{ borderBottomWidth: '6px', borderBottomColor: belt.color }}
              >
                <Award className="w-8 h-8 mx-auto mb-2 transition-transform group-hover:scale-110" style={{ color: belt.color }} />
                <span className="text-sm md:text-base block">{belt.label}</span>
                <span className="text-xs text-gray-400 block mt-1">{beltTerms.length} termen</span>
                {beltPct > 0 && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full transition-all" style={{ width: `${beltPct}%`, backgroundColor: belt.color }} />
                    </div>
                    <span className="text-[10px] text-gray-400 mt-0.5 block">{beltPct}%</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ============ QUIZ COMPLETE SCREEN ============
  if (quizComplete) {
    const pct = quizState.answers.length > 0 ? (quizState.score / quizState.answers.length) * 100 : 0;
    const beltInfo = beltLevels.find(b => b.key === selectedBelt);
    return (
      <div className="space-y-4 text-center">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8">
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: beltInfo?.color || '#a90000' }}>
              <Trophy className="w-8 h-8" style={{ color: beltInfo?.textColor || '#fff' }} />
            </div>
            <h2 className="text-3xl font-bold text-[#a90000] mb-2">{pct >= 80 ? 'Geweldig!' : pct >= 50 ? 'Goed bezig!' : 'Blijf oefenen!'}</h2>
            <p className="text-4xl font-bold text-gray-800 my-4">{quizState.score}/{quizState.answers.length}</p>
            <Progress value={pct} className="h-3 mt-4 mb-4" />
            <p className="text-gray-500">{pct >= 80 ? 'Je beheerst deze band termen uitstekend!' : pct >= 50 ? 'Je bent op de goede weg, blijf oefenen!' : 'Oefen de termen nog eens met de flashcards.'}</p>
            <div className="flex gap-3 justify-center mt-6">
              <Button onClick={() => { setMode('learn'); setQuizComplete(false); setCurrentCard(0); setFlipped(false); }} variant="outline" className="border-[#a90000] text-[#a90000]">Flashcards</Button>
              <Button onClick={startQuiz} className="bg-[#a90000] hover:bg-[#8c0000]">Opnieuw quiz</Button>
              <Button onClick={() => setSelectedBelt(null)} variant="ghost" className="text-gray-500">Terug</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ============ QUIZ MODE ============
  if (mode === 'quiz' && quizState.answers.length > 0) {
    const currentQ = quizState.answers[quizState.current];
    const quizPct = (quizState.current / quizState.answers.length) * 100;
    return (
      <div className="space-y-4">
        <button onClick={() => { setMode('learn'); setQuizState({ current: 0, score: 0, answers: [] }); }} className="text-sm text-gray-500 hover:text-[#a90000] flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" /> Terug naar leren
        </button>

        <Progress value={quizPct} className="h-2.5" />

        <Card className="border-0 shadow-lg">
          <CardContent className="p-4 sm:p-6 md:p-8 text-center">
            <Badge className="mb-3 sm:mb-4 text-[10px] sm:text-xs" style={{ backgroundColor: beltLevels.find(b => b.key === selectedBelt)?.color, color: beltLevels.find(b => b.key === selectedBelt)?.textColor }}>
              {currentQ.categorie}
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#a90000] mb-4 sm:mb-8 break-words">{currentQ.uitspraak}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 max-w-lg mx-auto">
              {currentQ.options.map((opt, idx) => {
                const isCorrect = opt === currentQ.nederlands;
                const isSelected = quizAnswer === idx;
                let cls = 'p-3 md:p-5 rounded-xl border-2 text-xs sm:text-sm font-medium cursor-pointer transition-all ';
                if (quizAnswer !== null) {
                  if (isCorrect) cls += 'border-green-500 bg-green-50 text-green-700 scale-[1.02]';
                  else if (isSelected) cls += 'border-red-500 bg-red-50 text-red-700';
                  else cls += 'border-gray-200 text-gray-400';
                } else {
                  cls += 'border-gray-200 hover:border-[#a90000] hover:text-[#a90000]';
                }
                return (
                  <button key={idx} onClick={() => quizAnswer === null && handleQuizAnswer(idx, currentQ.nederlands)} className={cls}>
                    {opt}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-gray-400">Vraag {quizState.current + 1} van {quizState.answers.length}</p>
      </div>
    );
  }

  // ============ OVERVIEW MODE (checkbox list) ============
  if (mode === 'overview') {
    return (
      <div className="space-y-4">
        <button onClick={() => { setSelectedBelt(null); setCurrentCard(0); setFlipped(false); }} className="text-sm text-gray-500 hover:text-[#a90000] flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" /> Terug naar bandkeuze
        </button>

        {/* Mode selector */}
        <div className="flex bg-gray-100 rounded-full p-0.5 sm:p-1 gap-0.5 sm:gap-0">
          <button onClick={() => setMode('overview')} className="flex-1 py-2 rounded-full text-[11px] sm:text-sm font-bold transition-all bg-[#a90000] text-white shadow whitespace-nowrap">Overzicht</button>
          <button onClick={() => { setMode('learn'); setCurrentCard(0); setFlipped(false); }} className="flex-1 py-2 rounded-full text-[11px] sm:text-sm font-bold transition-all text-gray-500 whitespace-nowrap">Leren</button>
          <button onClick={() => termsForBelt.length >= 4 && startQuiz()} className="flex-1 py-2 rounded-full text-[11px] sm:text-sm font-bold transition-all text-gray-500 whitespace-nowrap">Quiz</button>
        </div>

        {/* Progress */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Voortgang</span>
              <span className="text-sm font-bold text-[#a90000]">{completedCount}/{totalTerms}</span>
            </div>
            <Progress value={progressPct} className="h-3" />
          </CardContent>
        </Card>

        {/* Terms by Category */}
        <div className="space-y-4">
          {categories.map((cat) => {
            const catTerms = termsForBelt.filter(t => t.categorie === cat);
            return (
              <Card key={cat} className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#a90000]" /> {cat}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {catTerms.map((term) => {
                    const key = `${selectedBelt}-${term.uitspraak}`;
                    const videoId = findVideoForTerm(term.uitspraak);
                    return (
                      <div key={key} className="border border-[#e8eaed] rounded-xl overflow-hidden">
                        <div className="flex items-center gap-3 p-2.5 hover:bg-[#fdf6f6] transition-colors">
                          <Checkbox
                            checked={progress[key] || false}
                            onCheckedChange={(v) => setProgress(prev => ({ ...prev, [key]: !!v }))}
                          />
                          <div className="flex-1 min-w-0">
                            <p className={`font-semibold text-sm ${progress[key] ? 'text-gray-400 line-through' : 'text-[#a90000]'}`}>
                              {term.uitspraak}
                            </p>
                            <p className="text-xs text-gray-500">{term.nederlands}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            {videoId && (
                              <button
                                onClick={() => setShowVideos(prev => ({ ...prev, [key]: !prev[key] }))}
                                className={`p-1.5 rounded-lg transition-colors ${showVideos[key] ? 'bg-[#a90000] text-white' : 'text-gray-400 hover:text-[#a90000] hover:bg-[#fdf6f6]'}`}
                                title="Bekijk video"
                              >
                                <Play className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${progress[key] ? 'text-green-500' : 'text-gray-200'}`} />
                          </div>
                        </div>
                        {showVideos[key] && videoId && (
                          <div className="aspect-video border-t border-[#e8eaed]">
                            <iframe src={`https://www.youtube.com/embed/${videoId}`} title={term.uitspraak} className="w-full h-full" allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Techniques with videos not in term list */}
        {techniquesForBelt.filter(t => !termsForBelt.some(term => term.uitspraak.toLowerCase().replace(/-/g, ' ') === t.name.toLowerCase().replace(/-/g, ' '))).length > 0 && (
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Play className="w-4 h-4 text-[#a90000]" /> Aanvullende technieken met video
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {techniquesForBelt.filter(t => !termsForBelt.some(term => term.uitspraak.toLowerCase().replace(/-/g, ' ') === t.name.toLowerCase().replace(/-/g, ' '))).map((tech) => (
                <div key={tech.id} className="border border-[#e8eaed] rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between p-3">
                    <div>
                      <p className="font-semibold text-sm text-[#a90000]">{tech.name}</p>
                      <p className="text-xs text-gray-500">{tech.dutch}</p>
                    </div>
                    {tech.youtubeId && (
                      <Button variant="ghost" size="sm" className="text-[#a90000]" onClick={() => setShowVideos(prev => ({ ...prev, [`tech-${tech.id}`]: !prev[`tech-${tech.id}`] }))}>
                        {showVideos[`tech-${tech.id}`] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    )}
                  </div>
                  {showVideos[`tech-${tech.id}`] && tech.youtubeId && (
                    <div className="aspect-video border-t border-[#e8eaed]">
                      <iframe src={`https://www.youtube.com/embed/${tech.youtubeId}`} title={tech.name} className="w-full h-full" allowFullScreen />
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // ============ LEARN MODE (flashcards) ============
  const term = termsForBelt[currentCard];
  const videoId = term ? findVideoForTerm(term.uitspraak) : undefined;

  return (
    <div className="space-y-4">
      <button onClick={() => { setSelectedBelt(null); setCurrentCard(0); setFlipped(false); }} className="text-sm text-gray-500 hover:text-[#a90000] flex items-center gap-1">
        <ChevronLeft className="w-4 h-4" /> Terug naar bandkeuze
      </button>

      {/* Mode selector */}
      <div className="flex bg-gray-100 rounded-full p-0.5 sm:p-1 gap-0.5 sm:gap-0">
        <button onClick={() => setMode('overview')} className="flex-1 py-2 rounded-full text-[11px] sm:text-sm font-bold transition-all text-gray-500 whitespace-nowrap">Overzicht</button>
        <button onClick={() => { setMode('learn'); setCurrentCard(0); setFlipped(false); }} className="flex-1 py-2 rounded-full text-[11px] sm:text-sm font-bold transition-all bg-[#a90000] text-white shadow whitespace-nowrap">Leren</button>
        <button onClick={() => termsForBelt.length >= 4 && startQuiz()} className={`flex-1 py-2 rounded-full text-[11px] sm:text-sm font-bold transition-all ${termsForBelt.length < 4 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500'} whitespace-nowrap`}>Quiz</button>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">{completedCount}/{totalTerms} beheerst</span>
        <span className="font-bold text-[#a90000]">{Math.round(progressPct)}%</span>
      </div>

      {term && (
        <>
          {/* Flashcard */}
          <div
            className="min-h-[260px] sm:min-h-[300px] md:min-h-[340px] cursor-pointer select-none"
            onClick={() => setFlipped(!flipped)}
          >
            <Card className={`border-0 shadow-lg h-full transition-all duration-500 ${flipped ? 'bg-[#fdf6f6]' : 'bg-white'}`}>
              <CardContent className="p-4 sm:p-6 md:p-10 h-full flex flex-col justify-center items-center text-center relative">
                <Badge
                  className="absolute top-3 right-3 sm:top-4 sm:right-4 text-[10px] sm:text-xs"
                  style={{ backgroundColor: beltLevels.find(b => b.key === selectedBelt)?.color, color: beltLevels.find(b => b.key === selectedBelt)?.textColor }}
                >
                  {term.categorie}
                </Badge>

                {!flipped ? (
                  <div className="animate-in fade-in duration-300">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#a90000] mb-2 sm:mb-3 break-words">{term.uitspraak}</h2>
                    <p className="text-sm text-gray-400 mt-6">Tik om de vertaling te zien</p>
                  </div>
                ) : (
                  <div className="animate-in fade-in duration-300">
                    <p className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-800 mb-1.5 sm:mb-2 break-words">{term.nederlands}</p>
                    <p className="text-xs sm:text-sm text-gray-400 mt-3 sm:mt-4">Tik om de Japanse term te zien</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Video for this term */}
          {videoId && (
            <div className="border border-[#e8eaed] rounded-xl overflow-hidden">
              <button
                onClick={(e) => { e.stopPropagation(); setShowVideos(prev => ({ ...prev, [`card-${selectedBelt}-${currentCard}`]: !prev[`card-${selectedBelt}-${currentCard}`] })); }}
                className="w-full flex items-center justify-between p-3 bg-white hover:bg-[#fdf6f6] transition-colors"
              >
                <span className="flex items-center gap-2 text-sm font-medium text-[#a90000]">
                  <Play className="w-4 h-4" /> Videodemonstratie
                </span>
                {showVideos[`card-${selectedBelt}-${currentCard}`] ? <ChevronLeft className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
              </button>
              {showVideos[`card-${selectedBelt}-${currentCard}`] && (
                <div className="aspect-video border-t border-[#e8eaed]">
                  <iframe src={`https://www.youtube.com/embed/${videoId}`} title={term.uitspraak} className="w-full h-full" allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
                </div>
              )}
            </div>
          )}

          {/* Mark as known */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => {
                const key = `${selectedBelt}-${term.uitspraak}`;
                setProgress(prev => ({ ...prev, [key]: !prev[key] }));
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                progress[`${selectedBelt}-${term.uitspraak}`]
                  ? 'bg-green-100 text-green-700 border border-green-200'
                  : 'bg-gray-100 text-gray-500 hover:bg-[#fdf6f6] hover:text-[#a90000] border border-transparent'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              {progress[`${selectedBelt}-${term.uitspraak}`] ? 'Beheerst!' : 'Markeer als beheerst'}
            </button>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => { setCurrentCard(Math.max(0, currentCard - 1)); setFlipped(false); setShowVideos({}); }} disabled={currentCard === 0}>
              <ChevronLeft className="w-4 h-4 mr-1" /> Vorige
            </Button>
            <span className="text-sm text-gray-500 font-medium">{currentCard + 1} / {termsForBelt.length}</span>
            <Button variant="outline" onClick={() => { setCurrentCard(Math.min(termsForBelt.length - 1, currentCard + 1)); setFlipped(false); setShowVideos({}); }} disabled={currentCard === termsForBelt.length - 1}>
              Volgende <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </>
      )}

      {termsForBelt.length === 0 && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">Geen termen gevonden voor dit niveau.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ============ FORMS SECTION ============
function FormsSection() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    naam: '', adres: '', postcode: '', woonplaats: '', geboortedatum: '', telefoon: '', email: '',
    ouderNaam: '', ouderTelefoon: '', voorwaarden: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const existing = JSON.parse(localStorage.getItem('michigami-forms') || '[]');
    existing.push({ ...formData, timestamp: new Date().toISOString() });
    localStorage.setItem('michigami-forms', JSON.stringify(existing));
    setSubmitted(true);
  };

  const exportCSV = () => {
    const data = JSON.parse(localStorage.getItem('michigami-forms') || '[]');
    if (data.length === 0) return;
    const headers = Object.keys(data[0]);
    const csv = [headers.join(','), ...data.map((row: Record<string, string>) => headers.map(h => `"${(row[h] || '').replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'inschrijvingen.csv'; a.click();
  };

  if (submitted) {
    return (
      <div className="space-y-4">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <CheckCircle2 className="w-16 h-16 mx-auto text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800">Inschrijving ontvangen!</h2>
            <p className="text-gray-500 mt-2">Bedankt voor je inschrijving. We nemen zo snel mogelijk contact met je op.</p>
            <Button onClick={() => { setSubmitted(false); setFormData({ naam: '', adres: '', postcode: '', woonplaats: '', geboortedatum: '', telefoon: '', email: '', ouderNaam: '', ouderTelefoon: '', voorwaarden: false }); }} className="mt-4 bg-[#a90000] hover:bg-[#8c0000]">Nieuwe inschrijving</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const savedForms = JSON.parse(localStorage.getItem('michigami-forms') || '[]');

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-[#a90000] to-[#8c0000] rounded-2xl p-4 sm:p-5 md:p-6 text-white shadow-lg overflow-hidden">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold flex items-center gap-1.5 sm:gap-2 truncate"><FileText className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" /> Formulieren</h1>
        <p className="text-white/80 mt-1 text-xs sm:text-sm">Inschrijven en formulieren invullen</p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Inschrijfformulier</CardTitle>
          <CardDescription>Word lid van Judoclub Michigami</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              <div className="space-y-2">
                <Label htmlFor="naam">Naam *</Label>
                <Input id="naam" required value={formData.naam} onChange={(e) => setFormData(p => ({ ...p, naam: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="geboortedatum">Geboortedatum *</Label>
                <Input id="geboortedatum" type="date" required value={formData.geboortedatum} onChange={(e) => setFormData(p => ({ ...p, geboortedatum: e.target.value }))} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="adres">Adres *</Label>
                <Input id="adres" required value={formData.adres} onChange={(e) => setFormData(p => ({ ...p, adres: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postcode">Postcode *</Label>
                <Input id="postcode" required value={formData.postcode} onChange={(e) => setFormData(p => ({ ...p, postcode: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="woonplaats">Woonplaats *</Label>
                <Input id="woonplaats" required value={formData.woonplaats} onChange={(e) => setFormData(p => ({ ...p, woonplaats: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefoon">Telefoon *</Label>
                <Input id="telefoon" type="tel" required value={formData.telefoon} onChange={(e) => setFormData(p => ({ ...p, telefoon: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail *</Label>
                <Input id="email" type="email" required value={formData.email} onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))} />
              </div>
            </div>

            <Separator className="my-4" />
            <p className="text-sm text-gray-500 font-medium">Indien jonger dan 18 jaar:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              <div className="space-y-2">
                <Label htmlFor="ouderNaam">Naam ouder/voogd</Label>
                <Input id="ouderNaam" value={formData.ouderNaam} onChange={(e) => setFormData(p => ({ ...p, ouderNaam: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ouderTelefoon">Telefoon ouder/voogd</Label>
                <Input id="ouderTelefoon" type="tel" value={formData.ouderTelefoon} onChange={(e) => setFormData(p => ({ ...p, ouderTelefoon: e.target.value }))} />
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4">
              <Checkbox id="voorwaarden" checked={formData.voorwaarden} onCheckedChange={(v) => setFormData(p => ({ ...p, voorwaarden: !!v }))} />
              <Label htmlFor="voorwaarden" className="text-sm text-gray-600">Ik heb de algemene voorwaarden gelezen *</Label>
            </div>

            <Button type="submit" className="w-full bg-[#a90000] hover:bg-[#8c0000]" disabled={!formData.voorwaarden}>
              Inschrijven
            </Button>
          </form>
        </CardContent>
      </Card>

      {savedForms.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Ingediende formulieren</CardTitle>
              <Button variant="outline" size="sm" onClick={exportCSV}>Export CSV</Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">{savedForms.length} inschrijving(en) opgeslagen</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ============ INFO SECTION ============
function InfoSection() {
  const [activeTab, setActiveTab] = useState('info');

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-[#a90000] to-[#8c0000] rounded-2xl p-4 sm:p-5 md:p-6 text-white shadow-lg overflow-hidden">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold flex items-center gap-1.5 sm:gap-2 truncate"><Info className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" /> Clubinformatie</h1>
        <p className="text-white/80 mt-1 text-xs sm:text-sm">Alles over Judoclub Michigami</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="info" className="text-xs sm:text-sm">Info</TabsTrigger>
          <TabsTrigger value="lestijden" className="text-xs sm:text-sm">Lestijden</TabsTrigger>
          <TabsTrigger value="lidworden" className="text-xs sm:text-sm">Lid worden</TabsTrigger>
          <TabsTrigger value="contact" className="text-xs sm:text-sm">Contact</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 sm:p-6 prose prose-sm max-w-none">
              <h2 className="text-lg sm:text-xl font-bold text-[#a90000] mb-2 sm:mb-3">Over Judoclub Michigami</h2>
              <p className="text-gray-600 leading-relaxed">
                Judoclub Michigami is in 1993 opgericht door Koos van Wezel in Steenbergen. De training vindt al sinds het begin plaats in Sportcentrum De Knotwilg in Steenbergen. Er worden judolessen gegeven voor alle leeftijden.
              </p>

              <h3 className="text-lg font-bold text-[#a90000] mt-6 mb-2">Wat is judo?</h3>
              <p className="text-gray-600 leading-relaxed">
                Judo is een (stoei) spel van aanval en verdediging. Je probeert je maatje te gooien of hem juist op de grond te houden, terwijl de ander juist probeert niet gegooid te worden of uit de greep te ontsnappen. Judo kan beoefend worden in de dojo (oefenzaal), waarbij je geen risico&apos;s hoeft te lopen. Wil je wat verder, dan kun je ook deelnemen aan wedstrijden.
              </p>

              <h3 className="text-lg font-bold text-[#a90000] mt-6 mb-2">Judobanden</h3>
              <p className="text-gray-600 leading-relaxed">
                Aan de hand van de kleur band die een judoka draagt, kun je zien hoe ver gevorderd hij/zij is. De volgorde van banden is: wit, geel, oranje, groen, blauw en tenslotte bruin (kyu-graden). Om een andere band te verkrijgen moet je examen doen. Ben je nog geen 13, dan zijn er tevens slippen te verdienen. Na de gekleurde banden komt de zwarte band (Dan-graden).
              </p>

              <h3 className="text-lg font-bold text-[#a90000] mt-6 mb-2">Kosten</h3>
              <div className="space-y-1 text-gray-600">
                <p><strong>Inschrijfgeld:</strong> € 15,00 (eenmalig)</p>
                <p><strong>Verzekeringsbijdrage:</strong> € 15,00 per jaar</p>
                <p><strong>Contributie:</strong> € 42,- per kwartaal / € 168,- per jaar</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lestijden" className="mt-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-[#a90000] mb-4">Lestijden</h2>
              <p className="text-gray-500 mb-4">Vrijdagavond — Sportcentrum De Knotwilg, Steenbergen</p>
              <div className="space-y-3">
                {[
                  { groep: 'Groep 1', leeftijd: '6 t/m 9 jaar', tijd: '18:45 - 19:45', color: '#f9c500' },
                  { groep: 'Groep 2', leeftijd: '9 t/m 12 jaar', tijd: '19:45 - 20:45', color: '#f37021' },
                  { groep: 'Groep 3', leeftijd: '13 jaar en ouder', tijd: '20:45 - 21:45', color: '#009444' },
                ].map((g) => (
                  <div key={g.groep} className="flex items-center gap-4 p-4 rounded-xl bg-[#fdf6f6] border-l-4" style={{ borderLeftColor: g.color }}>
                    <div>
                      <p className="font-bold text-gray-800">{g.groep}</p>
                      <p className="text-sm text-gray-500">{g.leeftijd}</p>
                    </div>
                    <div className="ml-auto text-right">
                      <p className="font-bold text-[#a90000]">{g.tijd}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-4">Ook in Oud-Vossemeer (De Vossenkuil) worden lessen gegeven. Zie de agenda voor details.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lidworden" className="mt-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 text-center">
              <Users className="w-16 h-16 mx-auto text-[#a90000] mb-4" />
              <h2 className="text-xl font-bold text-[#a90000] mb-2">Lid worden?</h2>
              <p className="text-gray-600 mb-4 max-w-md mx-auto">
                Kom eerst een keer kijken! Je kunt 3 gratis proeflessen volgen. Bevalt het en wil je graag lid worden, schrijf je dan in via ons formulier.
              </p>
              <Button className="bg-[#a90000] hover:bg-[#8c0000]" onClick={() => window.location.reload()}>
                <FileText className="w-4 h-4 mr-2" /> Inschrijfformulier
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="mt-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-xl font-bold text-[#a90000] mb-4">Contact</h2>
              <div className="space-y-3">
                <a href="mailto:judoclub_michigami@hotmail.com" className="flex items-center gap-3 p-3 rounded-xl bg-[#fdf6f6] hover:bg-[#fce0e0] transition-colors min-w-0">
                  <Mail className="w-5 h-5 text-[#a90000] flex-shrink-0" />
                  <span className="text-gray-700 text-sm truncate break-all">judoclub_michigami@hotmail.com</span>
                </a>
                <a href="https://www.facebook.com/judoclubmichigami" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-[#fdf6f6] hover:bg-[#fce0e0] transition-colors">
                  <Facebook className="w-5 h-5 text-[#a90000]" />
                  <span className="text-gray-700">Facebook</span>
                </a>
                <a href="https://www.youtube.com/channel/UC8tXSKppIMF6awS2cj7w50A" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-[#fdf6f6] hover:bg-[#fce0e0] transition-colors">
                  <Youtube className="w-5 h-5 text-[#a90000]" />
                  <span className="text-gray-700">YouTube</span>
                </a>
              </div>

              <Separator className="my-4" />

              <h3 className="font-bold text-gray-800">Locaties</h3>
              <div className="space-y-2">
                <a href="https://maps.app.goo.gl/Wipstraat+2+Steenbergen" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-white border border-[#e8eaed] hover:border-[#a90000] transition-colors">
                  <MapPin className="w-5 h-5 text-[#a90000]" />
                  <div>
                    <p className="font-semibold text-gray-800">De Knotwilg</p>
                    <p className="text-sm text-gray-500">Wipstraat 2, Steenbergen</p>
                  </div>
                </a>
                <a href="https://maps.google.com/?q=De+Vossenkuil+Oud-Vossemeer" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-white border border-[#e8eaed] hover:border-[#a90000] transition-colors">
                  <MapPin className="w-5 h-5 text-[#a90000]" />
                  <div>
                    <p className="font-semibold text-gray-800">De Vossenkuil</p>
                    <p className="text-sm text-gray-500">Oud-Vossemeer</p>
                  </div>
                </a>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============ LOGIN SECTION ============
function LoginSection() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegister, setIsRegister] = useState(false);

  if (isLoggedIn) {
    return (
      <div className="space-y-4">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <Shield className="w-16 h-16 mx-auto text-[#a90000] mb-4" />
            <h2 className="text-2xl font-bold text-gray-800">Welkom terug!</h2>
            <p className="text-gray-500 mt-2">Je bent ingelogd als lid.</p>
            <div className="grid grid-cols-2 gap-3 mt-6">
              <Card className="bg-[#fdf6f6] border-0">
                <CardContent className="p-4 text-center">
                  <Award className="w-8 h-8 mx-auto text-[#a90000]" />
                  <p className="text-sm font-semibold mt-2">Huidige band</p>
                  <p className="text-xs text-gray-500">Witte band</p>
                </CardContent>
              </Card>
              <Card className="bg-[#fdf6f6] border-0">
                <CardContent className="p-4 text-center">
                  <Star className="w-8 h-8 mx-auto text-[#a90000]" />
                  <p className="text-sm font-semibold mt-2">Voortgang</p>
                  <p className="text-xs text-gray-500">0% compleet</p>
                </CardContent>
              </Card>
              <Card className="bg-[#fdf6f6] border-0">
                <CardContent className="p-4 text-center">
                  <Calendar className="w-8 h-8 mx-auto text-[#a90000]" />
                  <p className="text-sm font-semibold mt-2">Evenementen</p>
                  <p className="text-xs text-gray-500">0 bezocht</p>
                </CardContent>
              </Card>
              <Card className="bg-[#fdf6f6] border-0">
                <CardContent className="p-4 text-center">
                  <FileText className="w-8 h-8 mx-auto text-[#a90000]" />
                  <p className="text-sm font-semibold mt-2">Formulieren</p>
                  <p className="text-xs text-gray-500">0 ingediend</p>
                </CardContent>
              </Card>
            </div>
            <Button variant="outline" className="mt-6" onClick={() => setIsLoggedIn(false)}>Uitloggen</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-[#a90000] to-[#8c0000] rounded-2xl p-4 sm:p-5 md:p-6 text-white shadow-lg overflow-hidden">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold flex items-center gap-1.5 sm:gap-2 truncate"><User className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" /> {isRegister ? 'Account aanmaken' : 'Inloggen'}</h1>
        <p className="text-white/80 mt-1 text-xs sm:text-sm">Toegang tot je persoonlijke dashboard</p>
      </div>

      <Card className="border-0 shadow-sm max-w-md mx-auto">
        <CardContent className="p-6">
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setIsLoggedIn(true); }}>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" placeholder="jouw@email.nl" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Wachtwoord</Label>
              <Input id="password" type="password" required />
            </div>
            {isRegister && (
              <div className="space-y-2">
                <Label>Rol</Label>
                <div className="flex gap-2">
                  {['Lid', 'Trainer', 'Bestuur'].map((role) => (
                    <label key={role} className="flex-1 text-center">
                      <input type="radio" name="role" value={role.toLowerCase()} className="sr-only peer" defaultChecked={role === 'Lid'} />
                      <span className="block p-2 rounded-lg border border-[#e8eaed] text-sm font-medium cursor-pointer peer-checked:bg-[#a90000] peer-checked:text-white peer-checked:border-[#a90000] transition-all">{role}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            <Button type="submit" className="w-full bg-[#a90000] hover:bg-[#8c0000]">
              {isRegister ? 'Account aanmaken' : 'Inloggen'}
            </Button>
            <p className="text-center text-sm text-gray-500">
              {isRegister ? 'Al een account?' : 'Nog geen account?'}{' '}
              <button type="button" onClick={() => setIsRegister(!isRegister)} className="text-[#a90000] font-semibold hover:underline">
                {isRegister ? 'Inloggen' : 'Account aanmaken'}
              </button>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
