'use client';

import { useState, useEffect } from 'react';
import { Calendar, Newspaper, Swords, Target, Clock, Mail } from 'lucide-react';
import { HeroSlider } from './HeroSlider';
import { NewsSlider } from './NewsSlider';
import { agendaItems } from '@/data/agenda';
import { newsArchive, type NewsArticle } from '@/data/news-archive';
import { useT } from '@/i18n/LangContext';
import type { Section } from '@/components/nav-config';

type Tone = 'shu' | 'ai';

const toneStyle: Record<Tone, { bg: string; color: string }> = {
  shu: { bg: 'rgba(169,0,0,0.07)', color: '#a90000' },
  ai: { bg: 'rgba(39,70,110,0.08)', color: '#27466e' },
};

interface QuickLink {
  key: Section;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  tone: Tone;
}

/** Effen, rustige tegel zonder zwevende decoratie */
function QuickLinkTile({ link, onClick }: { link: QuickLink; onClick: (s: Section) => void }) {
  const { t } = useT();
  const tone = toneStyle[link.tone];
  return (
    <button onClick={() => onClick(link.key)} className="group block w-full text-center">
      <div className="card-washi p-5 h-full min-h-[120px] flex flex-col items-center justify-center gap-2.5 transition-all duration-300 hover:-translate-y-0.5">
        <div className="w-11 h-11 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-105" style={{ backgroundColor: tone.bg }}>
          <span style={{ color: tone.color }}>{link.icon}</span>
        </div>
        <span className="font-bold text-[#1c1915] leading-tight">{t(link.title)}</span>
        <span className="text-xs text-[#6b6155]">{t(link.subtitle)}</span>
      </div>
    </button>
  );
}

export function HomeSection({ onNavigate }: { onNavigate: (s: Section) => void }) {
  const { t } = useT();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [lesvrij, setLesvrij] = useState<typeof agendaItems>([]);
  useEffect(() => {
    fetch('/api/agenda/lesvrij').then(r => (r.ok ? r.json() : { items: [] }))
      .then(j => setLesvrij(j.items ?? [])).catch(() => {});
  }, []);
  void lesvrij; // lesvrije dagen worden in de agenda-sectie getoond

  const latestNews: NewsArticle[] = [];
  for (const year of newsArchive) {
    latestNews.push(...year.articles.slice(0, 5));
    if (latestNews.length >= 5) break;
  }

  // Bewust beperkt: de rest zit al in de onderste navigatiebalk
  const quickLinks: QuickLink[] = [
    { key: 'agenda', title: 'Agenda', subtitle: 'Evenementen', icon: <Calendar className="w-6 h-6" />, tone: 'shu' },
    { key: 'nieuws', title: 'Nieuws', subtitle: 'Berichten', icon: <Newspaper className="w-6 h-6" />, tone: 'shu' },
    { key: 'technieken', title: 'Technieken', subtitle: 'Alle worpen', icon: <Swords className="w-6 h-6" />, tone: 'ai' },
    { key: 'exameneisen', title: 'Examens', subtitle: 'Per band', icon: <Target className="w-6 h-6" />, tone: 'ai' },
    { key: 'lestijden', title: 'Lestijden', subtitle: 'Wo & Vr', icon: <Clock className="w-6 h-6" />, tone: 'shu' },
    { key: 'contact', title: 'Contact', subtitle: 'Stel een vraag', icon: <Mail className="w-6 h-6" />, tone: 'shu' },
  ];

  return (
    <div className="space-y-8 pb-4 sm:pb-0">
      <HeroSlider />

      {/* Snel naar — rustig, vast raster */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="section-title text-xl font-bold">{t('Snel naar')}</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 items-stretch">
          {quickLinks.map((link) => (
            <QuickLinkTile key={link.key} link={link} onClick={onNavigate} />
          ))}
        </div>
      </section>

      {/* Nieuws */}
      <section className="relative overflow-hidden card-washi group">
        <NewsSlider articles={latestNews} onNavigate={() => onNavigate('nieuws')} />
      </section>

      {/* Lesrooster — twee rustige kaarten */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="section-title text-xl font-bold">{t('Lesrooster')}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
          <div className="card-washi p-5 h-full min-h-[150px] flex flex-col">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(169,0,0,0.08)' }}>
                <Clock className="w-6 h-6" style={{ color: '#a90000' }} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[#1c1915] text-lg">{t('Woensdag')}</h3>
                <p className="text-sm text-[#6b6155] mt-0.5">{t('Algemene training — alle leeftijden')}</p>
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-sm font-bold" style={{ color: '#a90000' }}>19:00 - 20:00</span>
                  <span className="text-xs text-[#6b6155]">{t('De Vossenkuil, Oud-Vossemeer')}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card-washi card-washi--ai p-5 h-full min-h-[150px] flex flex-col">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(39,70,110,0.08)' }}>
                <Clock className="w-6 h-6" style={{ color: '#27466e' }} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[#1c1915] text-lg">{t('Vrijdag')}</h3>
                <p className="text-sm text-[#6b6155] mt-0.5">{t('Sportcentrum De Knotwilg, Steenbergen')}</p>
                <div className="space-y-1.5 mt-3">
                  <div className="flex items-center gap-3"><span className="text-sm font-bold" style={{ color: '#27466e' }}>18:45 - 19:45</span><span className="text-xs text-[#6b6155]">{t('1e groep (6 t/m 9 jaar)')}</span></div>
                  <div className="flex items-center gap-3"><span className="text-sm font-bold" style={{ color: '#27466e' }}>19:45 - 20:45</span><span className="text-xs text-[#6b6155]">{t('2e groep (9 jaar en ouder)')}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
