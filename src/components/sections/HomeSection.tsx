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
    case 'ban': return <Ban className={`${className} text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]`} />;
    case 'medal': return <Trophy className={`${className} text-[#f0d060] drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]`} />;
    case 'champagne': return <Sparkles className={`${className} text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]`} />;
    case 'xmark': return <XCircle className={`${className} text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]`} />;
    default: return <CircleDot className={`${className} text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]`} />;
  }
}

/** Washi bento tile — shared visual language for the "Snel naar" grid */
function BentoTile({
  onClick,
  kanji,
  title,
  subtitle,
  icon,
  tone = 'shu',
  large = false,
  children,
}: {
  onClick?: () => void;
  kanji: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  tone?: 'shu' | 'ai' | 'kin';
  large?: boolean;
  children?: React.ReactNode;
}) {
  const toneClasses = tone === 'ai' ? 'card-washi--ai' : tone === 'kin' ? '' : 'card-washi--shu';
  const iconBg = tone === 'ai' ? 'rgba(39,70,110,0.10)' : tone === 'kin' ? 'rgba(176,141,62,0.12)' : 'rgba(169,0,0,0.08)';
  const iconColor = tone === 'ai' ? '#27466e' : tone === 'kin' ? '#a07d2e' : '#a90000';

  return (
    <button onClick={onClick} className="w-full block text-left group">
      <div className={`relative overflow-hidden rounded-xl card-washi ${toneClasses} frame-corners p-4 sm:p-5 transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.99] h-full min-h-[140px]`}>
        {/* Ghost kanji — large, faint, top-right */}
        <span
          aria-hidden
          className="kanji-ghost top-1 right-2 text-6xl sm:text-7xl opacity-70"
        >
          {kanji}
        </span>
        <div className="relative h-full flex flex-col justify-between">
          <div>
            <div
              className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 mb-3"
              style={{ backgroundColor: iconBg }}
            >
              <span style={{ color: iconColor }}>{icon}</span>
            </div>
            <span className="font-bold block" style={{ color: iconColor, fontSize: large ? '1.25rem' : '0.95rem' }}>
              {title}
            </span>
            {subtitle && <span className="text-sm text-[#6b6155] mt-1 block">{subtitle}</span>}
          </div>
          {children}
        </div>
      </div>
    </button>
  );
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

      {/* Nieuws Slider */}
      <div className="relative overflow-hidden rounded-xl card-washi frame-corners group transition-all hover:shadow-lg">
        <NewsSlider articles={latestNews} onNavigate={() => onNavigate('nieuws')} />
      </div>

      {/* Agenda */}
      <div className="relative overflow-hidden rounded-xl card-washi frame-corners group">
        <div className="relative">
          <div className="px-4 py-3 border-b border-[#b08d3e]/20 flex items-center justify-between">
            <h3 className="font-bold text-[#1c1915] flex items-center gap-2 section-title">
              <Calendar className="w-4 h-4" style={{ color: '#a90000' }} /> Agenda
            </h3>
            <button onClick={() => onNavigate('agenda')} className="text-xs font-medium hover:underline" style={{ color: '#a90000' }}>
              Alles →
            </button>
          </div>
          <div className="p-4 space-y-3">
            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-[#8a7f70] text-center py-4">Geen komende evenementen</p>
            ) : upcomingEvents.slice(0, 2).map((item, idx) => (
              <div key={idx} onClick={() => onNavigate('agenda')} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-[#a90000]/[0.04] transition-colors cursor-pointer">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-white" style={{ background: 'linear-gradient(135deg, #c00000, #8c0000)' }}>
                  {getEmojiIcon(item.emoji, "w-5 h-5")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1c1915] truncate">{item.event}</p>
                  <p className="text-xs text-[#6b6155] mt-0.5">{item.displayDate} {item.time !== '-' && `• ${item.time}`}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bento Grid — Snel naar */}
      <div>
        <div className="flex items-end justify-between mb-3">
          <h2 className="text-lg font-bold text-[#1c1915] flex items-center gap-2 section-title">
            <Sparkles className="w-5 h-5 text-[#a90000]" /> Snel naar...
          </h2>
          <span aria-hidden className="hidden sm:block text-vertical font-mincho text-xl text-[#a90000]/20 select-none">
            柔道
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 items-stretch">
          {/* Row 1: Agenda (groot, spans 2 cols + 2 rows) + Nieuws + Technieken */}
          <div className="sm:col-span-2 sm:row-span-2">
            <BentoTile
              onClick={() => onNavigate('agenda')}
              kanji="暦"
              title="Agenda"
              subtitle="Evenementen & trainingstijden"
              icon={<Calendar className="w-6 h-6" />}
              large
            >
              <div className="mt-4 pt-3 border-t border-[#b08d3e]/20 space-y-2">
                {upcomingEvents.slice(0, 2).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-[#6b6155]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#a90000] flex-shrink-0" />
                    <span className="truncate">{item.event}</span>
                  </div>
                ))}
              </div>
            </BentoTile>
          </div>
          <BentoTile onClick={() => onNavigate('nieuws')} kanji="報" title="Nieuws" subtitle="Laatste berichten" icon={<Sparkles className="w-6 h-6" />} />
          <BentoTile onClick={() => onNavigate('technieken')} kanji="技" title="Technieken" subtitle="Alle technieken" icon={<Swords className="w-6 h-6" />} />

          {/* Row 2+3 continued: Info (medium, 2 cols) + Examens + Leden */}
          <div className="sm:col-span-2">
            <BentoTile onClick={() => onNavigate('info')} kanji="心" title="Over Ons" subtitle="Geschiedenis & leiding" icon={<Info className="w-6 h-6" />} />
          </div>
          <BentoTile onClick={() => onNavigate('exameneisen')} kanji="試" title="Examens" subtitle="Per bandniveau" icon={<Target className="w-6 h-6" />} />
          <BentoTile onClick={() => onNavigate('leden')} kanji="入" title="Lid worden" subtitle="Meld je aan" icon={<Users className="w-6 h-6" />} />
          {isMobile && (
            <>
              <ProeflesBottomSheet trigger={
                <div className="w-full block">
                  <div className="relative overflow-hidden rounded-xl card-washi frame-corners p-4 transition-all duration-300 hover:shadow-md active:scale-[0.99] group h-full min-h-[140px]">
                    <span aria-hidden className="kanji-ghost top-1 right-2 text-6xl opacity-70">試</span>
                    <div className="relative h-full flex flex-col items-center justify-center gap-2 text-center">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(39,174,96,0.10)' }}><Users className="w-6 h-6 text-[#27ae60]" /></div>
                      <span className="font-semibold text-sm text-[#27ae60]">Gratis Proefles</span>
                      <span className="text-xs text-[#6b6155]">Meekijken kan!</span>
                    </div>
                  </div>
                </div>
              } />
              <ContactBottomSheet trigger={
                <div className="w-full block">
                  <div className="relative overflow-hidden rounded-xl card-washi frame-corners p-4 transition-all duration-300 hover:shadow-md active:scale-[0.99] group h-full min-h-[140px]">
                    <span aria-hidden className="kanji-ghost top-1 right-2 text-6xl opacity-70">連</span>
                    <div className="relative h-full flex flex-col items-center justify-center gap-2 text-center">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(169,0,0,0.08)' }}><Mail className="w-6 h-6" style={{ color: '#a90000' }} /></div>
                      <span className="font-semibold text-sm" style={{ color: '#a90000' }}>Contact</span>
                    </div>
                  </div>
                </div>
              } />
              <LocationBottomSheet trigger={
                <div className="w-full block">
                  <div className="relative overflow-hidden rounded-xl card-washi frame-corners p-4 transition-all duration-300 hover:shadow-md active:scale-[0.99] group h-full min-h-[140px]">
                    <span aria-hidden className="kanji-ghost top-1 right-2 text-6xl opacity-70">地</span>
                    <div className="relative h-full flex flex-col items-center justify-center gap-2 text-center">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(39,70,110,0.10)' }}><MapPin className="w-6 h-6" style={{ color: '#27466e' }} /></div>
                      <span className="font-semibold text-sm" style={{ color: '#27466e' }}>Locaties</span>
                      <span className="text-xs text-[#6b6155]">2 locaties</span>
                    </div>
                  </div>
                </div>
              } />
            </>
          )}

          {/* Row 3: Lestijden + Locatie + Contact (klein) + Cursus Japans */}
          <BentoTile onClick={() => onNavigate('lestijden')} kanji="時" title="Lestijden" subtitle="Wo & Vr" icon={<Clock className="w-6 h-6" />} tone="ai" />
          <BentoTile onClick={() => onNavigate('locatie')} kanji="地" title="Locaties" subtitle="2 locaties" icon={<MapPin className="w-6 h-6" />} tone="ai" />
          <BentoTile onClick={() => onNavigate('contact')} kanji="連" title="Contact" subtitle="Stel een vraag" icon={<Mail className="w-6 h-6" />} />
          <BentoTile onClick={() => onNavigate('cursusjapans')} kanji="語" title="Cursus Japans" subtitle="Leer + quiz" icon={<BookOpen className="w-6 h-6" />} tone="kin" />
        </div>
      </div>

      {/* Training Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
        <div className="relative overflow-hidden rounded-xl card-washi frame-corners p-5 h-full min-h-[180px] flex flex-col">
          <span aria-hidden className="kanji-ghost -top-2 -right-1 text-8xl opacity-60">水</span>
          <div className="relative flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(169,0,0,0.08)' }}>
              <Clock className="w-7 h-7" style={{ color: '#a90000' }} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-[#1c1915] text-lg">Woensdagavond</h3>
                <span className="font-mincho text-xs text-[#a90000]/50">水曜日</span>
              </div>
              <p className="text-sm text-[#6b6155] mt-0.5">Algemene training — alle leeftijden</p>
              <div className="flex items-center gap-3 mt-3">
                <span className="text-sm font-bold" style={{ color: '#a90000' }}>19:00 - 20:00</span>
                <span className="text-xs text-[#8a7f70]">•</span>
                <span className="text-xs text-[#6b6155] flex items-center gap-1"><MapPin className="w-3 h-3" /> Oud-Vossemeer</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl card-washi card-washi--ai frame-corners p-5 h-full min-h-[180px] flex flex-col">
          <span aria-hidden className="kanji-ghost -top-2 -right-1 text-8xl opacity-60">金</span>
          <div className="relative flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(39,70,110,0.08)' }}>
              <Clock className="w-7 h-7" style={{ color: '#27466e' }} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-[#1c1915] text-lg">Vrijdagavond</h3>
                <span className="font-mincho text-xs text-[#27466e]/60">金曜日</span>
              </div>
              <div className="space-y-2 mt-1.5">
                <div className="flex items-center gap-3"><span className="text-sm font-bold" style={{ color: '#27466e' }}>18:45 - 19:45</span><span className="text-xs text-[#8a7f70]">•</span><span className="text-xs text-[#6b6155]">Groep 1 (6-9 jaar)</span></div>
                <div className="flex items-center gap-3"><span className="text-sm font-bold" style={{ color: '#27466e' }}>19:45 - 20:45</span><span className="text-xs text-[#8a7f70]">•</span><span className="text-xs text-[#6b6155]">Groep 2+ (9+ jaar)</span></div>
              </div>
              <div className="flex items-center gap-2 mt-3"><MapPin className="w-3 h-3" style={{ color: '#27466e' }} /><span className="text-xs text-[#6b6155]">Steenbergen</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
