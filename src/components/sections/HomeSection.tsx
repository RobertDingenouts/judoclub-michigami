'use client';

import { useState, useEffect } from 'react';
import { Calendar, Sparkles, Swords, Target, Users, Clock, BookOpen, Mail, MapPin, Music2 } from 'lucide-react';
import { HeroSlider } from './HeroSlider';
import { NewsSlider } from './NewsSlider';
import { agendaItems } from '@/data/agenda';
import { newsArchive, type NewsArticle } from '@/data/news-archive';
import type { Section } from '@/components/nav-config';
import { ContactBottomSheet, LocationBottomSheet, ProeflesBottomSheet } from '@/components/MobileBottomSheet';
import { useIsMobile } from '@/hooks/use-mobile';

type Tone = 'shu' | 'ai';

const toneStyle: Record<Tone, { bg: string; color: string; card: string }> = {
  shu: { bg: 'rgba(169,0,0,0.07)', color: '#a90000', card: 'card-washi--shu' },
  ai: { bg: 'rgba(39,70,110,0.08)', color: '#27466e', card: 'card-washi--ai' },
};

interface QuickLink {
  key: Section;
  kanji: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  tone: Tone;
}

/** Centered, sharp-cornered quick-link tile — the clean "Snel naar" grid */
function QuickLinkTile({ link, onClick, index }: { link: QuickLink; onClick: (s: Section) => void; index: number }) {
  const t = toneStyle[link.tone];
  return (
    <button onClick={() => onClick(link.key)} className="group block w-full text-center animate-fadeUp" style={{ animationDelay: `${0.35 + index * 0.07}s` }}>
      <div className={`relative overflow-hidden card-washi ${t.card} ink-wash p-5 h-full min-h-[150px] flex flex-col items-center justify-center gap-2.5 transition-all duration-500 hover:-translate-y-0.5`}>
        <span aria-hidden className="kanji-ghost kanji-float -top-3 -right-1 text-7xl opacity-60" style={{ animationDelay: `${index * 0.5}s` }}>{link.kanji}</span>
        <div className="relative w-12 h-12 rounded-full flex items-center justify-center transition-transform duration-500 group-hover:scale-105" style={{ backgroundColor: t.bg }}>
          <span style={{ color: t.color }}>{link.icon}</span>
        </div>
        <span className="relative font-bold text-[#1c1915] leading-tight">{link.title}</span>
        <span className="relative text-xs text-[#6b6155]">{link.subtitle}</span>
      </div>
    </button>
  );
}

export function HomeSection({ onNavigate }: { onNavigate: (s: Section) => void }) {
  const isMobile = useIsMobile();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [lesvrij, setLesvrij] = useState<typeof agendaItems>([]);
  useEffect(() => {
    fetch('/api/agenda/lesvrij').then(r => (r.ok ? r.json() : { items: [] }))
      .then(j => setLesvrij(j.items ?? [])).catch(() => {});
  }, []);
  const upcomingEvents = [...agendaItems, ...lesvrij]
    .filter(i => !i.cancelled && new Date(i.compareDate) >= today)
    .sort((a, b) => a.compareDate.localeCompare(b.compareDate)).slice(0, 3);

  const latestNews: NewsArticle[] = [];
  for (const year of newsArchive) {
    latestNews.push(...year.articles.slice(0, 5));
    if (latestNews.length >= 5) break;
  }

  const quickLinks: QuickLink[] = [
    { key: 'agenda', kanji: '暦', title: 'Agenda', subtitle: 'Evenementen', icon: <Calendar className="w-6 h-6" />, tone: 'shu' },
    { key: 'nieuws', kanji: '報', title: 'Nieuws', subtitle: 'Berichten', icon: <Sparkles className="w-6 h-6" />, tone: 'shu' },
    { key: 'technieken', kanji: '技', title: 'Technieken', subtitle: 'Alle technieken', icon: <Swords className="w-6 h-6" />, tone: 'shu' },
    { key: 'exameneisen', kanji: '試', title: 'Examens', subtitle: 'Per band', icon: <Target className="w-6 h-6" />, tone: 'shu' },
    { key: 'lestijden', kanji: '時', title: 'Lestijden', subtitle: 'Wo & Vr', icon: <Clock className="w-6 h-6" />, tone: 'ai' },
    { key: 'cursusjapans', kanji: '語', title: 'Cursus Japans', subtitle: 'Leer + quiz', icon: <BookOpen className="w-6 h-6" />, tone: 'ai' },
    { key: 'leden', kanji: '入', title: 'Lid worden', subtitle: 'Meld je aan', icon: <Users className="w-6 h-6" />, tone: 'shu' },
    { key: 'muziek', kanji: '音', title: 'Muziek', subtitle: 'Robas albums', icon: <Music2 className="w-6 h-6" />, tone: 'shu' },
    { key: 'contact', kanji: '連', title: 'Contact', subtitle: 'Stel een vraag', icon: <Mail className="w-6 h-6" />, tone: 'shu' },
  ];

  return (
    <div className="space-y-8 pb-4 sm:pb-0">
      <HeroSlider />

      {/* Snel naar — clean, centered grid */}
      <section>
        <div className="flex items-center justify-center gap-3 mb-4 animate-fadeUp">
          <span aria-hidden className="hidden sm:block text-vertical font-mincho text-2xl leading-none text-[#a90000]/20 select-none pointer-events-none">道</span>
          <h2 className="section-title text-xl font-bold">Snel naar</h2>
          <span aria-hidden className="hidden sm:block w-px h-6 bg-[#a90000]/20" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 items-stretch">
          {quickLinks.map((link, i) => (
            <QuickLinkTile key={link.key} link={link} onClick={onNavigate} index={i} />
          ))}
          {isMobile && (
            <>
              <ProeflesBottomSheet trigger={
                <div className="w-full block text-center">
                  <div className="relative overflow-hidden card-washi p-5 h-full min-h-[150px] flex flex-col items-center justify-center gap-2.5 transition-all duration-500 hover:-translate-y-0.5">
                    <span aria-hidden className="kanji-ghost -top-3 -right-1 text-7xl opacity-60">試</span>
                    <div className="relative w-11 h-11 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(39,174,96,0.10)' }}>
                      <Users className="w-6 h-6 text-[#27ae60]" />
                    </div>
                    <span className="relative font-bold text-sm text-[#27ae60]">Gratis Proefles</span>
                    <span className="relative text-xs text-[#6b6155]">Meekijken kan!</span>
                  </div>
                </div>
              } />
              <ContactBottomSheet trigger={
                <div className="w-full block text-center">
                  <div className="relative overflow-hidden card-washi p-5 h-full min-h-[150px] flex flex-col items-center justify-center gap-2.5 transition-all duration-500 hover:-translate-y-0.5">
                    <span aria-hidden className="kanji-ghost -top-3 -right-1 text-7xl opacity-60">連</span>
                    <div className="relative w-11 h-11 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(169,0,0,0.08)' }}>
                      <Mail className="w-6 h-6" style={{ color: '#a90000' }} />
                    </div>
                    <span className="relative font-bold text-sm" style={{ color: '#a90000' }}>Contact</span>
                    <span className="relative text-xs text-[#6b6155]">Stel een vraag</span>
                  </div>
                </div>
              } />
              <LocationBottomSheet trigger={
                <div className="w-full block text-center">
                  <div className="relative overflow-hidden card-washi p-5 h-full min-h-[150px] flex flex-col items-center justify-center gap-2.5 transition-all duration-500 hover:-translate-y-0.5">
                    <span aria-hidden className="kanji-ghost -top-3 -right-1 text-7xl opacity-60">地</span>
                    <div className="relative w-11 h-11 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(39,70,110,0.10)' }}>
                      <MapPin className="w-6 h-6" style={{ color: '#27466e' }} />
                    </div>
                    <span className="relative font-bold text-sm" style={{ color: '#27466e' }}>Locaties</span>
                    <span className="relative text-xs text-[#6b6155]">2 locaties</span>
                  </div>
                </div>
              } />
            </>
          )}
        </div>
      </section>

      {/* Nieuws */}
      <section className="relative overflow-hidden card-washi group animate-fadeUp delay-500">
        <NewsSlider articles={latestNews} onNavigate={() => onNavigate('nieuws')} />
      </section>

      {/* Training Info */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
        <div className="relative overflow-hidden card-washi p-5 h-full min-h-[170px] flex flex-col animate-fadeUp delay-300">
          <span aria-hidden className="kanji-ghost kanji-float -top-2 -right-1 text-8xl opacity-60">水</span>
          <div className="relative flex items-start gap-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(169,0,0,0.08)' }}>
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

        <div className="relative overflow-hidden card-washi card-washi--ai p-5 h-full min-h-[170px] flex flex-col animate-fadeUp delay-400">
          <span aria-hidden className="kanji-ghost kanji-float -top-2 -right-1 text-8xl opacity-60" style={{ animationDelay: '1s' }}>金</span>
          <div className="relative flex items-start gap-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(39,70,110,0.08)' }}>
              <Clock className="w-7 h-7" style={{ color: '#27466e' }} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-[#1c1915] text-lg">Vrijdagavond</h3>
                <span className="font-mincho text-xs text-[#27466e]/60">金曜日</span>
              </div>
              <div className="space-y-2 mt-1.5">
                <div className="flex items-center gap-3"><span className="text-sm font-bold" style={{ color: '#27466e' }}>18:45 - 19:45</span><span className="text-xs text-[#8a7f70]">•</span><span className="text-xs text-[#6b6155]">Groep 1 (6-9 jaar)</span></div>
                <div className="flex items-center gap-3"><span className="text-sm font-bold" style={{ color: '#27466e' }}>19:45 - 20:45</span><span className="text-xs text-[#8a7f70]">•</span><span className="text-xs text-[#6b6155]">2e groep (9+ jaar)</span></div>
              </div>
              <div className="flex items-center gap-2 mt-3"><MapPin className="w-3 h-3" style={{ color: '#27466e' }} /><span className="text-xs text-[#6b6155]">Steenbergen</span></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
