'use client';

import { Calendar, Sparkles, Swords, Target, Users, Clock, MapPin, Mail, BookOpen, Info, Ban, Trophy, XCircle, CircleDot } from 'lucide-react';
import { HeroSlider } from './HeroSlider';
import { NewsSlider } from './NewsSlider';
import { agendaItems } from '@/data/agenda';
import { newsArchive, type NewsArticle } from '@/data/news-archive';
import type { Section } from '@/components/nav-config';
import { ContactBottomSheet, LocationBottomSheet, ProeflesBottomSheet } from '@/components/MobileBottomSheet';
import { useIsMobile } from '@/hooks/use-mobile';

function getEmojiIcon(emoji: string, className = "w-5 h-5") {
  switch (emoji) {
    case 'ban': return <Ban className={`${className} text-[#c00000]`} />;
    case 'medal': return <Trophy className={`${className} text-[#c00000]`} />;
    case 'champagne': return <Sparkles className={`${className} text-[#c00000]`} />;
    case 'xmark': return <XCircle className={`${className} text-[#c00000]`} />;
    default: return <CircleDot className={`${className} text-[#c00000]`} />;
  }
}

export function HomeSection({ onNavigate }: { onNavigate: (s: Section) => void }) {
  const isMobile = useIsMobile();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcomingEvents = agendaItems.filter(i => !i.cancelled && new Date(i.compareDate) >= today).slice(0, 3);

  const latestNews: NewsArticle[] = [];
  for (const year of newsArchive) {
    latestNews.push(...year.articles.slice(0, 5));
    if (latestNews.length >= 5) break;
  }

  return (
    <div className="space-y-6 pb-4 sm:pb-0">
      <HeroSlider />

      {/* Nieuws Slider — plain CSS hover, no Framer Motion wrapper */}
      <div className="relative overflow-hidden rounded-2xl shadow-sm border border-gray-100 backdrop-blur-xl bg-white/80 transition-all hover:shadow-lg hover:shadow-red-100/30 group">
        <div className="absolute inset-0 bg-gradient-to-br from-[#fdf6f6] via-white/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
        <NewsSlider articles={latestNews} onNavigate={() => onNavigate('nieuws')} />
      </div>

      {/* Agenda — plain CSS hover, no Framer Motion wrapper */}
      <div className="relative overflow-hidden rounded-2xl shadow-sm border border-gray-100 backdrop-blur-xl bg-white/80 transition-all hover:shadow-lg hover:shadow-red-100/30 group">
        <div className="absolute inset-0 bg-gradient-to-br from-[#fdf6f6] via-white/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
          <div className="relative">
            <div className="px-4 py-3 border-b border-gray-100/50 flex items-center justify-between">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Calendar className="w-4 h-4" style={{ color: '#c00000' }} /> Agenda
              </h3>
              <button onClick={() => onNavigate('agenda')} className="text-xs font-medium hover:underline" style={{ color: '#c00000' }}>
                Alles →
              </button>
            </div>
            <div className="p-4 space-y-3">
            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Geen komende evenementen</p>
            ) : upcomingEvents.slice(0, 2).map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#fff2f2] transition-colors">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-white" style={{ background: 'linear-gradient(135deg, #c00000, #a90000)' }}>
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
      </div>

      {/* Bento Grid — Snel naar */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#c00000]" /> Snel naar...
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 items-stretch">
          {/* Row 1: Agenda (groot, spans 2 cols + 2 rows) + Nieuws + Technieken */}
          <button onClick={() => onNavigate('agenda')} className="w-full block">
            <div className="sm:col-span-2 sm:row-span-2 relative overflow-hidden rounded-2xl border backdrop-blur-xl bg-white/80 p-4 sm:p-6 transition-all duration-300 hover:shadow-md active:scale-[0.99] group h-full min-h-[140px] sm:min-h-[0]" style={{ borderColor: '#c0000020' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-[#fdf6f6] via-white/40 to-transparent opacity-70 group-hover:opacity-100 transition-opacity" />
              <div className="relative h-full flex flex-col justify-between">
                <div>
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 mb-4" style={{ background: 'linear-gradient(135deg, #c00000, #a90000)' }}>
                    <Calendar className="w-8 h-8 text-white" />
                  </div>
                  <span className="font-bold text-xl block" style={{ color: '#c00000' }}>Agenda</span>
                  <span className="text-base text-gray-500 mt-1 block">Evenementen & trainingstijden</span>
                </div>
                <span className="text-sm font-medium mt-3 inline-flex items-center gap-1" style={{ color: '#c00000' }}>Bekijk agenda →</span>
              </div>
            </div>
          </button>
          <button onClick={() => onNavigate('nieuws')} className="w-full block">
            <div className="relative overflow-hidden rounded-2xl border backdrop-blur-xl bg-white/80 p-4 transition-all duration-300 hover:shadow-md active:scale-[0.99] group h-full min-h-[140px]" style={{ borderColor: '#c0000020' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-[#fdf6f6] via-white/40 to-transparent opacity-70 group-hover:opacity-100 transition-opacity" />
              <div className="relative h-full flex flex-col items-center justify-center gap-2 text-center">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#c0000015' }}><Sparkles className="w-6 h-6" style={{ color: '#c00000' }} /></div>
                <span className="font-semibold text-sm" style={{ color: '#c00000' }}>Nieuws</span>
                <span className="text-xs text-gray-500">Laatste berichten</span>
              </div>
            </div>
          </button>
          <button onClick={() => onNavigate('technieken')} className="w-full block">
            <div className="relative overflow-hidden rounded-2xl border backdrop-blur-xl bg-white/80 p-4 transition-all duration-300 hover:shadow-md active:scale-[0.99] group h-full min-h-[140px]" style={{ borderColor: '#8c000020' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-[#fdf6f6] via-white/40 to-transparent opacity-70 group-hover:opacity-100 transition-opacity" />
              <div className="relative h-full flex flex-col items-center justify-center gap-2 text-center">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#8c000015' }}><Swords className="w-6 h-6" style={{ color: '#8c0000' }} /></div>
                <span className="font-semibold text-sm" style={{ color: '#8c0000' }}>Technieken</span>
                <span className="text-xs text-gray-500">Alle technieken</span>
              </div>
            </div>
          </button>

          {/* Row 2+3 continued: Info (medium, 2 cols) + Examens + Leden */}
          <button onClick={() => onNavigate('info')} className="w-full block">
            <div className="sm:col-span-2 relative overflow-hidden rounded-2xl border backdrop-blur-xl bg-white/80 p-4 sm:p-5 transition-all duration-300 hover:shadow-md active:scale-[0.99] group h-full min-h-[140px]" style={{ borderColor: '#c0000020' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-[#fdf6f6] via-white/40 to-transparent opacity-70 group-hover:opacity-100 transition-opacity" />
              <div className="relative h-full flex items-center justify-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #c00000, #a90000)' }}><Info className="w-6 h-6 text-white" /></div>
                <div className="text-left">
                  <span className="font-bold text-base block" style={{ color: '#c00000' }}>Over Ons</span>
                  <span className="text-sm text-gray-500">Geschiedenis & leiding</span>
                </div>
              </div>
            </div>
          </button>
          <button onClick={() => onNavigate('exameneisen')} className="w-full block">
            <div className="relative overflow-hidden rounded-2xl border backdrop-blur-xl bg-white/80 p-4 transition-all duration-300 hover:shadow-md active:scale-[0.99] group h-full min-h-[140px]" style={{ borderColor: '#c0000020' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-[#fdf6f6] via-white/40 to-transparent opacity-70 group-hover:opacity-100 transition-opacity" />
              <div className="relative h-full flex flex-col items-center justify-center gap-2 text-center">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#c0000015' }}><Target className="w-6 h-6" style={{ color: '#c00000' }} /></div>
                <span className="font-semibold text-sm" style={{ color: '#c00000' }}>Examens</span>
                <span className="text-xs text-gray-500">Per bandniveau</span>
              </div>
            </div>
          </button>
          <button onClick={() => onNavigate('leden')} className="w-full block">
            <div className="relative overflow-hidden rounded-2xl border backdrop-blur-xl bg-white/80 p-4 transition-all duration-300 hover:shadow-md active:scale-[0.99] group h-full min-h-[140px]" style={{ borderColor: '#8c000020' }}>
              <div className="relative h-full flex flex-col items-center justify-center gap-2 text-center">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#8c000015' }}><Users className="w-6 h-6" style={{ color: '#8c0000' }} /></div>
                <span className="font-semibold text-sm" style={{ color: '#8c0000' }}>Lid Worden</span>
                <span className="text-xs text-gray-500">Meld je aan</span>
              </div>
            </div>
          </button>
          {isMobile && (
            <>
              <ProeflesBottomSheet trigger={
                <button className="relative overflow-hidden rounded-2xl border backdrop-blur-xl bg-white/80 p-4 transition-all duration-300 hover:shadow-md active:scale-[0.99] group h-full min-h-[140px]" style={{ borderColor: '#27ae6020' }}>
                  <div className="absolute inset-0 bg-gradient-to-br from-[#f0fdf4] via-white/40 to-transparent opacity-70 group-hover:opacity-100 transition-opacity" />
                  <div className="relative h-full flex flex-col items-center justify-center gap-2 text-center">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#27ae6015' }}><Users className="w-6 h-6 text-[#27ae60]" /></div>
                    <span className="font-semibold text-sm text-[#27ae60]">Proefles</span>
                    <span className="text-xs text-gray-500">Gratis meekijken</span>
                  </div>
                </button>
              } />
              <ContactBottomSheet trigger={
                <button className="relative overflow-hidden rounded-2xl border backdrop-blur-xl bg-white/80 p-4 transition-all duration-300 hover:shadow-md active:scale-[0.99] group h-full min-h-[140px]" style={{ borderColor: '#c0000020' }}>
                  <div className="absolute inset-0 bg-gradient-to-br from-[#fdf6f6] via-white/40 to-transparent opacity-70 group-hover:opacity-100 transition-opacity" />
                  <div className="relative h-full flex flex-col items-center justify-center gap-2 text-center">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#c0000015' }}><Mail className="w-6 h-6" style={{ color: '#c00000' }} /></div>
                    <span className="font-semibold text-sm" style={{ color: '#c00000' }}>Contact</span>
                  </div>
                </button>
              } />
              <LocationBottomSheet trigger={
                <button className="relative overflow-hidden rounded-2xl border backdrop-blur-xl bg-white/80 p-4 transition-all duration-300 hover:shadow-md active:scale-[0.99] group h-full min-h-[140px]" style={{ borderColor: '#8c000020' }}>
                  <div className="absolute inset-0 bg-gradient-to-br from-[#fdf6f6] via-white/40 to-transparent opacity-70 group-hover:opacity-100 transition-opacity" />
                  <div className="relative h-full flex flex-col items-center justify-center gap-2 text-center">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#8c000015' }}><MapPin className="w-6 h-6" style={{ color: '#8c0000' }} /></div>
                    <span className="font-semibold text-sm" style={{ color: '#8c0000' }}>Locaties</span>
                    <span className="text-xs text-gray-500">2 locaties</span>
                  </div>
                </button>
              } />
            </>
          )}

          {/* Row 3: Lestijden + Locatie + Contact (klein) + Cursus Japans */}
          <button onClick={() => onNavigate('lestijden')} className="w-full block">
            <div className="relative overflow-hidden rounded-2xl border backdrop-blur-xl bg-white/80 p-4 transition-all duration-300 hover:shadow-md active:scale-[0.99] group h-full min-h-[140px]" style={{ borderColor: '#c0000020' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-[#fdf6f6] via-white/40 to-transparent opacity-70 group-hover:opacity-100 transition-opacity" />
              <div className="relative h-full flex flex-col items-center justify-center gap-2 text-center">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#c0000015' }}><Clock className="w-6 h-6" style={{ color: '#c00000' }} /></div>
                <span className="font-semibold text-sm" style={{ color: '#c00000' }}>Lestijden</span>
                <span className="text-xs text-gray-500">Wo & Vr</span>
              </div>
            </div>
          </button>
          <button onClick={() => onNavigate('locatie')} className="w-full block">
            <div className="relative overflow-hidden rounded-2xl border backdrop-blur-xl bg-white/80 p-4 transition-all duration-300 hover:shadow-md active:scale-[0.99] group h-full min-h-[140px]" style={{ borderColor: '#8c000020' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-[#fdf6f6] via-white/40 to-transparent opacity-70 group-hover:opacity-100 transition-opacity" />
              <div className="relative h-full flex flex-col items-center justify-center gap-2 text-center">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#8c000015' }}><MapPin className="w-6 h-6" style={{ color: '#8c0000' }} /></div>
                <span className="font-semibold text-sm" style={{ color: '#8c0000' }}>Locaties</span>
                <span className="text-xs text-gray-500">2 locaties</span>
              </div>
            </div>
          </button>
          <button onClick={() => onNavigate('contact')} className="w-full block">
            <div className="relative overflow-hidden rounded-2xl border backdrop-blur-xl bg-white/80 p-4 transition-all duration-300 hover:shadow-md active:scale-[0.99] group h-full min-h-[140px]" style={{ borderColor: '#c0000020' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-[#fdf6f6] via-white/40 to-transparent opacity-70 group-hover:opacity-100 transition-opacity" />
              <div className="relative h-full flex flex-col items-center justify-center gap-2 text-center">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#c0000015' }}><Mail className="w-6 h-6" style={{ color: '#c00000' }} /></div>
                <span className="font-semibold text-sm" style={{ color: '#c00000' }}>Contact</span>
              </div>
            </div>
          </button>
          <button onClick={() => onNavigate('cursusjapans')} className="w-full block">
            <div className="relative overflow-hidden rounded-2xl border backdrop-blur-xl bg-white/80 p-4 transition-all duration-300 hover:shadow-md active:scale-[0.99] group h-full min-h-[140px]" style={{ borderColor: '#c0000020' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-[#fdf6f6] via-white/40 to-transparent opacity-70 group-hover:opacity-100 transition-opacity" />
              <div className="relative h-full flex flex-col items-center justify-center gap-2 text-center">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#c0000015' }}><BookOpen className="w-6 h-6" style={{ color: '#c00000' }} /></div>
                <span className="font-semibold text-sm" style={{ color: '#c00000' }}>Cursus Japans</span>
                <span className="text-xs text-gray-500">Leer + quiz</span>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Training Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
        
          <div className="bg-gradient-to-br from-[#fdf6f6] to-white rounded-2xl shadow-sm border border-[#c00000]/10 p-5 h-full min-h-[180px] flex flex-col">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#a9000015' }}>
                <Clock className="w-7 h-7" style={{ color: '#c00000' }} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800 text-lg">Woensdagavond</h3>
                <p className="text-sm text-gray-500 mt-0.5">Algemene training — alle leeftijden</p>
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-sm font-bold" style={{ color: '#c00000' }}>19:00 - 20:00</span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> Oud-Vossemeer</span>
                </div>
              </div>
            </div>
          </div>
        
        
          <div className="bg-gradient-to-br from-[#eef6fb] to-white rounded-2xl shadow-sm border border-[#2980b9]/10 p-5 h-full min-h-[180px] flex flex-col">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#2980b915' }}>
                <Clock className="w-7 h-7" style={{ color: '#2980b9' }} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800 text-lg">Vrijdagavond</h3>
                <div className="space-y-2 mt-1.5">
                  <div className="flex items-center gap-3"><span className="text-sm font-bold" style={{ color: '#2980b9' }}>18:45 - 19:45</span><span className="text-xs text-gray-400">•</span><span className="text-xs text-gray-500">Groep 1 (6-9 jaar)</span></div>
                  <div className="flex items-center gap-3"><span className="text-sm font-bold" style={{ color: '#2980b9' }}>19:45 - 20:45</span><span className="text-xs text-gray-400">•</span><span className="text-xs text-gray-500">Groep 2+ (9+ jaar)</span></div>
                </div>
                <div className="flex items-center gap-2 mt-3"><MapPin className="w-3 h-3" style={{ color: '#2980b9' }} /><span className="text-xs text-gray-500">Steenbergen</span></div>
              </div>
            </div>
          </div>
        
      </div>
    </div>
  );
}
