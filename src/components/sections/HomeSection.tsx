'use client';

import { agendaItems } from '@/data/agenda';
import { type SectionId } from '@/components/nav-config';
import { Calendar, Trophy, BookOpen, Globe, ChevronRight } from 'lucide-react';

interface HomeSectionProps {
  onNavigate: (section: SectionId) => void;
}

export function HomeSection({ onNavigate }: HomeSectionProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingEvents = agendaItems
    .filter(item => !item.cancelled && new Date(item.compareDate) >= today)
    .slice(0, 3);

  const nextToernooi = agendaItems.find(
    item => !item.cancelled && item.emoji === 'medal' && new Date(item.compareDate) >= today
  );

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-judo-red-darker via-judo-red to-judo-red-bright text-white">
        {/* Kanji watermark */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10rem] leading-none opacity-[0.07] font-serif select-none" aria-hidden="true">
          柔道
        </div>
        {/* Hinomaru accent */}
        <div className="absolute right-32 top-8 w-16 h-16 rounded-full bg-white/10" aria-hidden="true" />

        <div className="relative z-10 p-8 md:p-12">
          <div className="flex items-start gap-4 mb-4">
            {/* Torii gate */}
            <svg viewBox="0 0 40 40" className="w-12 h-12 flex-shrink-0 mt-1" fill="none">
              <rect x="2" y="4" width="4" height="32" rx="1" fill="white" opacity="0.6" />
              <rect x="34" y="4" width="4" height="32" rx="1" fill="white" opacity="0.6" />
              <rect x="0" y="2" width="40" height="4" rx="2" fill="white" opacity="0.8" />
              <rect x="4" y="8" width="32" height="3" rx="1" fill="white" opacity="0.5" />
            </svg>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Judoclub Michigami</h1>
              <p className="mt-2 text-lg text-white/90">Judo voor jong en oud, voor beginners en gevorderden</p>
              <p className="text-white/70 italic">recreatief of prestatiegericht</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={() => onNavigate('agenda')}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Bekijk Agenda
            </button>
            {nextToernooi && nextToernooi.inschrijfUrl && (
              <a
                href={nextToernooi.inschrijfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-judo-red hover:bg-white/90 px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
              >
                <Trophy className="w-4 h-4" />
                Inschrijven Toernooi
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Quick Link Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { id: 'agenda' as SectionId, emoji: '📅', title: 'Agenda', desc: 'Activiteiten & toernooien', icon: Calendar, color: 'from-red-50 to-red-100' },
          { id: 'technieken' as SectionId, emoji: '🥋', title: 'Technieken', desc: 'Judo technieken leren', icon: BookOpen, color: 'from-orange-50 to-orange-100' },
          { id: 'exameneisen' as SectionId, emoji: '🎯', title: 'Exameneisen', desc: 'Bandeisen per niveau', icon: Trophy, color: 'from-green-50 to-green-100' },
          { id: 'japans' as SectionId, emoji: '🇯🇵', title: 'Cursus Japans', desc: 'Japanse termen leren', icon: Globe, color: 'from-purple-50 to-purple-100' },
        ].map((card) => (
          <button
            key={card.id}
            onClick={() => onNavigate(card.id)}
            className={`bg-gradient-to-br ${card.color} rounded-xl p-4 text-left hover:shadow-md transition-all duration-200 group border border-white/50`}
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">{card.emoji}</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="mt-2 font-semibold text-sm text-foreground">{card.title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{card.desc}</p>
          </button>
        ))}
      </div>

      {/* Upcoming Events Preview */}
      <div className="bg-white rounded-xl border border-judo-red-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Calendar className="w-5 h-5 text-judo-red" />
            Komende Activiteiten
          </h2>
          <button
            onClick={() => onNavigate('agenda')}
            className="text-sm text-judo-red hover:text-judo-red-dark font-medium flex items-center gap-1"
          >
            Bekijk alles <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        {upcomingEvents.length > 0 ? (
          <div className="space-y-3">
            {upcomingEvents.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 p-3 rounded-lg hover:bg-judo-red-bg transition-colors">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-judo-red to-judo-red-bright text-white flex items-center justify-center text-lg flex-shrink-0">
                  {item.emoji === 'medal' ? '🏅' : item.emoji === 'ban' ? '🚫' : '📅'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground truncate">
                    {item.event}
                    {item.eventSub && <span className="text-muted-foreground"> — {item.eventSub}</span>}
                  </p>
                  <p className="text-xs text-muted-foreground">{item.displayDate} {item.time && item.time !== '-' && `• ${item.time}`}</p>
                </div>
                {item.inschrijfUrl && (
                  <a
                    href={item.inschrijfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-judo-red-bright hover:bg-judo-red text-white text-xs px-3 py-1.5 rounded-md font-medium transition-colors flex-shrink-0"
                  >
                    Inschrijven
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Geen komende activiteiten gevonden.</p>
        )}
      </div>

      {/* Club Info Preview */}
      <div className="bg-gradient-to-br from-judo-red-bg to-white rounded-xl border border-judo-red-border p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-judo-red/10 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">🏯</span>
          </div>
          <div>
            <h2 className="font-bold text-foreground">Over Judoclub Michigami</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Opgericht in 1993 door Koos van Wezel in Steenbergen. We bieden judoles aan op twee locaties:
              Sportcentrum De Knotwilg (Steenbergen) en Sporthal De Vossenkuil (Oud-Vossemeer).
              Proeflessen zijn altijd gratis — kom gerust een kijkje nemen!
            </p>
            <button
              onClick={() => onNavigate('info')}
              className="mt-3 text-sm text-judo-red hover:text-judo-red-dark font-medium flex items-center gap-1"
            >
              Meer informatie <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
