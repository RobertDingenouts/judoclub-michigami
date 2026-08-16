'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Users, Award, ChevronLeft, ChevronRight, Swords, MapPin, Star, Trophy } from 'lucide-react';
import { type Section } from '@/components/nav-config';
import { clubInfo } from '@/data/club-info';
import { timelineEvents, type TimelineEvent } from '@/data/timeline-data';
import { openProeflesForm } from '@/lib/form-events';
import { SignupConfirmationModal } from '@/components/SignupConfirmationModal';

export function InfoSection({ onNavigate }: { onNavigate?: (s: Section) => void }) {
  const [signupOpen, setSignupOpen] = useState(false);
  const [tabValue, setTabValue] = useState('history');
  const tabOrder = ['history', 'leiding', 'judo', 'timeline'];
  
  // Timeline item component (inline - same as TimelineSection but without outer wrapper)
  const iconMap: Record<string, React.ReactNode> = {
    judo: <Swords className="w-5 h-5" />,
    club: <Users className="w-5 h-5" />,
    person: <Star className="w-5 h-5" />,
    award: <Award className="w-5 h-5" />,
    location: <MapPin className="w-5 h-5" />,
    star: <Trophy className="w-5 h-5" />,
  };

  const navigateTab = (direction: 'prev' | 'next') => {
    const idx = tabOrder.indexOf(tabValue);
    const newIdx = direction === 'next' 
      ? (idx + 1) % tabOrder.length 
      : (idx - 1 + tabOrder.length) % tabOrder.length;
    setTabValue(tabOrder[newIdx]);
  };
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
      <Tabs value={tabValue} onValueChange={setTabValue} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-[#f5f5f0]">
          <TabsTrigger value="history" className="text-xs sm:text-sm">Geschiedenis</TabsTrigger>
          <TabsTrigger value="leiding" className="text-xs sm:text-sm">Leiding</TabsTrigger>
          <TabsTrigger value="judo" className="text-xs sm:text-sm">Wat is Judo?</TabsTrigger>
          <TabsTrigger value="timeline" className="text-xs sm:text-sm">Tijdlijn</TabsTrigger>
        </TabsList>

    <TabsContent value="history" className="space-y-4 mt-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#fdf6f6] flex items-center justify-center flex-shrink-0 mt-1">
                  <Calendar className="w-5 h-5 text-[#c00000]" />
                </div>
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-800 mb-2 section-title">Onze geschiedenis</h3>
                  {clubInfo.history.split('\n\n').map((paragraph, i) => {
                    const headerMatch = paragraph.match(/^##\s+(.+)$/);
                    if (headerMatch) {
                      return (
                        <h4 key={i} className="font-bold text-base text-gray-800 mt-6 mb-2 first:mt-0">{headerMatch[1]}</h4>
                      );
                    }
                    return (
                      <p key={i} className="text-sm text-gray-600 leading-relaxed">{paragraph}</p>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================== LEIDING TAB ==================== */}
        <TabsContent value="leiding" className="space-y-4 mt-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 sm:p-6 space-y-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2 section-title">
                <Users className="w-5 h-5 text-[#c00000]" /> Huidige leiding
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Sinds 2021 zorgt een nieuwe generatie voor de toekomst van Judoclub Michigami. 
                Drie vrienden die al bijna vanaf de oprichting samen judo oefenen, regionale en internationale wedstrijden doen, 
                en alle drie de zwarte band (3e dan) hebben behaald.
              </p>
              <div className="space-y-3">
                {clubInfo.leadership.current.map((person) => (
                  <div key={person.name} className="p-4 rounded-lg bg-[#fdf6f6] border border-[#fce0e0]">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#a90000] to-[#c00000] text-white flex items-center justify-center flex-shrink-0 font-bold text-sm">
                        {person.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-800">{person.name}</h4>
                        <p className="text-xs font-medium text-[#c00000] mt-0.5">{person.dan} • {person.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 sm:p-6 space-y-3">
              <h3 className="font-bold text-gray-800 flex items-center gap-2 section-title">
                <Award className="w-5 h-5 text-[#c00000]" /> Oprichter & Erfenis
              </h3>
              <div className="p-4 rounded-lg bg-gradient-to-br from-[#fdf6f6] to-white border border-[#fce0e0]">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#8c0000] to-[#a90000] text-white flex items-center justify-center flex-shrink-0 font-bold text-sm">
                    KV
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-800">{clubInfo.leadership.founder.name}</h4>
                    <p className="text-xs font-medium text-[#c00000] mt-0.5">{clubInfo.leadership.founder.dan} • {clubInfo.leadership.founder.role}</p>
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
              <h3 className="font-bold text-gray-800 text-lg section-title">Wat is judo?</h3>
              {clubInfo.whatIsJudo.split('\n\n').map((paragraph, i) => {
                if (paragraph.startsWith('## ')) {
                  return <h4 key={i} className="font-bold text-base text-[#c00000] mt-6 mb-2 first:mt-0">{paragraph.replace('## ', '')}</h4>;
                }
                // Parse markdown: bold (**text**) and italic (*text*)
                const parts = paragraph.split(/(\*\*.*?\*\*|\*.*?\*)/g);
                return (
                  <p key={i} className="text-sm text-gray-600 leading-relaxed">
                    {parts.map((part, j) => {
                      if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={j} className="text-gray-800">{part.slice(2, -2)}</strong>;
                      }
                      if (part.startsWith('*') && part.endsWith('*')) {
                        return <em key={j}>{part.slice(1, -1)}</em>;
                      }
                      return part;
                    })}
                  </p>
                );
              })}
            </CardContent>
          </Card>

          {/* Foto grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-lg overflow-hidden shadow-md border border-[#fce0e0]">
              <img 
                src="/hero/budodag-actie-1.jpg" 
                alt="Budodag Michigami" 
                className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
              />
              <div className="bg-[#fdf6f6] p-3">
                <p className="text-xs text-gray-600 text-center font-medium">🎉 Budodag activiteiten</p>
              </div>
            </div>
            <div className="rounded-lg overflow-hidden shadow-md border border-[#fce0e0]">
              <img 
                src="/hero/heerle-toernooi-1.jpg" 
                alt="Toernooi Michigami" 
                className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
              />
              <div className="bg-[#fdf6f6] p-3">
                <p className="text-xs text-gray-600 text-center font-medium">🏆 Toernooien</p>
              </div>
            </div>
          </div>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 sm:p-6 space-y-3">
              <h3 className="font-bold text-gray-800">Voor wie is judo geschikt?</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{clubInfo.philosophy}</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================== TIJDLIJN TAB ==================== */}
        <TabsContent value="timeline" className="space-y-4 mt-4">
          <div className="relative pl-10 md:pl-0 max-w-3xl mx-auto">
            {/* Vertical line */}
            <div className="absolute left-4 md:left-1/2 md:-translate-x-px top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#a90000] via-[#c00000] to-[#a90000] opacity-30" />

            {/* Timeline items */}
            {timelineEvents.map((event, index) => {
              const isLeft = index % 2 === 0;
              const icon = iconMap[event.icon || 'club'] || <Users className="w-4 h-4" />;
              return (
                <div
                  key={event.year + index}
                  className={`relative flex items-center w-full mb-8 ${
                    isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  {/* Dot on the line */}
                  <div className="absolute left-4 md:left-1/2 md:-translate-x-1/2 z-10">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-lg ${
                        event.isMilestone
                          ? 'bg-gradient-to-br from-[#a90000] to-[#c00000] text-white ring-4 ring-red-100'
                          : 'bg-white border-2 border-[#a90000] text-[#a90000]'
                      }`}
                    >
                      {icon}
                    </div>
                  </div>

                  {/* Card content */}
                  <div className={`ml-12 md:ml-0 md:w-[calc(50%-2rem)] ${isLeft ? 'md:pr-8' : 'md:pl-8'}`}>
                    <Card className={`border-0 shadow-sm hover:shadow-md transition-shadow overflow-hidden ${
                      event.isMilestone ? 'ring-2 ring-red-100' : ''
                    }`}>
                      {/* Year badge */}
                      <div className="bg-gradient-to-r from-[#a90000] to-[#c00000] text-white px-4 py-2 flex items-center gap-2">
                        {event.isMilestone && <Trophy className="w-4 h-4" />}
                        <span className="font-bold text-lg">{event.year}</span>
                      </div>

                      <CardContent className="p-4 space-y-2">
                        <h3 className="font-bold text-gray-800 text-base leading-tight">{event.title}</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">{event.description}</p>

                        {event.photoUrl && (
                          <div className="mt-3 rounded-lg overflow-hidden bg-gray-100">
                            <img
                              src={event.photoUrl}
                              alt={event.title}
                              loading="lazy"
                              className="w-full h-auto max-h-48 object-cover"
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Spacer for the other side */}
                  <div className="hidden md:block md:w-[calc(50%-2rem)]" />
                </div>
              );
            })}
          </div>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-[#fdf6f6] to-white max-w-3xl mx-auto">
            <CardContent className="p-6 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-lg bg-gradient-to-br from-[#a90000] to-[#c00000] text-white flex items-center justify-center">
                <Swords className="w-6 h-6" />
              </div>
              <p className="text-sm text-gray-600 max-w-lg mx-auto">
                <span className="font-semibold text-[#c00000]">Judoclub Michigami</span> — meer dan 30 jaar judo in Steenbergen en omgeving.{' '}
                Respect, discipline en passie voor de zachte weg.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Previous / Next Navigation — within Info tabs */}
      <div className="flex items-center justify-between gap-4">
        <Button
          onClick={() => navigateTab('prev')}
          variant="outline"
          className="border-[#c00000] text-[#c00000] hover:bg-[#fdf6f6] gap-2 text-sm flex-1"
        >
          <ChevronLeft className="w-4 h-4" /> Vorige
        </Button>
        <Button
          onClick={() => navigateTab('next')}
          variant="outline"
          className="border-[#c00000] text-[#c00000] hover:bg-[#fdf6f6] gap-2 text-sm flex-1"
        >
          Volgende <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Contact CTA */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-[#fdf6f6] to-white">
        <CardContent className="p-4 sm:p-6 text-center space-y-3">
          <h3 className="font-bold text-gray-800">Interesse in judo?</h3>
          <p className="text-sm text-gray-600 max-w-lg mx-auto">
            Kom gerust eens kijken op een training - je bent van harte welkom!
            Als het je bevalt, kun je direct starten met <span className="font-semibold text-[#c00000]">{clubInfo.costs.proeflessen}</span>.
          </p>
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            <Button onClick={() => openProeflesForm()} className="bg-[#27ae60] hover:bg-[#219a52] text-white text-base px-8 font-bold shadow-md" style={{ fontSize: '1rem' }}>
              Gratis Proefles
            </Button>
            <Button variant="outline" onClick={() => setSignupOpen(true)} className="text-sm border-[#c00000] text-[#c00000] hover:bg-[#fdf6f6]">
              Inschrijven
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Signup Confirmation Modal */}
      <SignupConfirmationModal open={signupOpen} onClose={() => setSignupOpen(false)} signupUrl="/inschrijven" />
    </div>
  );
}
