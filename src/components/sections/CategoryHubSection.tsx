'use client';

import { ArrowRight } from 'lucide-react';
import type { Section } from '@/components/nav-config';
import { useT } from '@/i18n/LangContext';

const itemDescriptions: Record<string, string> = {
  'home': 'Welkom & overzicht',
  'agenda': 'Evenementen & data',
  'leden': 'Lidmaatschap & kosten',
  'lestijden': 'Trainingstijden',
  'locatie': 'Onze locaties',
  'info': 'Geschiedenis & leiding',
  'contact': 'Neem contact op',
  'juridisch': 'Privacy & voorwaarden',
  'technieken': 'Alle judotechnieken',
  'exameneisen': 'Eisen per bandniveau',
  'cursusjapans': 'Japanse termen leren',
  'techniekenkaart': 'Overzicht kaarten',
  'band-knopen': 'Hoe je judoband knoopt',
  'nieuws': 'Nieuwsberichten',
  'foto-galerij': 'Fotoalbum',
  'video-galerij': 'Videogalerij',
  'muziek': 'Muziek van onze club',
};

// Per-group thema: elke verzamelpagina krijgt zijn eigen sfeer
const groupThemes: Record<
  string,
  { grad: string; accent: string; tagline: string }
> = {
  'Club': {
    grad: 'linear-gradient(135deg, #8c0000 0%, #a90000 55%, #c81e1e 100%)',
    accent: '#ffd9d9',
    tagline: 'Onze club — alles over lidmaatschap, lessen en onze locaties.',
  },
  'Judo School': {
    grad: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 55%, #4a3b3b 100%)',
    accent: '#ffb4b4',
    tagline: 'Leer judo — technieken, exameneisen en cursussen op één plek.',
  },
  'Media': {
    grad: 'linear-gradient(135deg, #6d0f0f 0%, #8c1f1f 55%, #b34747 100%)',
    accent: '#ffe3e3',
    tagline: 'Beeldmateriaal van onze club — fotoalbums en video\u2019s.',
  },
};

const DEFAULT_THEME = {
  grad: 'linear-gradient(135deg, #8c0000 0%, #a90000 55%, #c81e1e 100%)',
  accent: '#ffd9d9',
  tagline: 'Verken alles op deze pagina — kies een onderwerp om te beginnen.',
};

export function CategoryHubSection({ group, onNavigate, navGroups, groupHubMap }: {
  group: { label: string; emoji: string; items: { key: Section; label: string; icon: React.ReactNode }[] };
  onNavigate: (s: Section) => void;
  navGroups: { label: string; emoji: string; items: { key: string }[] }[];
  groupHubMap: Record<string, Section>;
}) {
  const { t } = useT();
  const theme = groupThemes[group.label] || DEFAULT_THEME;

  return (
    <div className="space-y-8 pb-4 sm:pb-0">
      <style>{`
        @keyframes hub-fade-up {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hub-anim { animation: hub-fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both; }
      `}</style>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden rounded-2xl text-white shadow-lg"
        style={{ background: theme.grad }}
      >
        {/* Decoratieve ringen (judomatten / ripples) */}
        <div
          className="absolute -right-16 -top-16 w-64 h-64 rounded-full border-[10px] border-white/10"
          aria-hidden
        />
        <div
          className="absolute -right-6 -top-6 w-32 h-32 rounded-full border-[6px] border-white/10"
          aria-hidden
        />
        <div
          className="absolute -left-20 -bottom-24 w-72 h-72 rounded-full border-[12px] border-white/5"
          aria-hidden
        />
        {/* Subtiele diagonale lijn-structuur */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(135deg, #fff 0, #fff 1px, transparent 1px, transparent 22px)',
          }}
          aria-hidden
        />

        <div className="relative px-6 sm:px-10 py-8 sm:py-12">
          <div className="hub-anim flex items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-4xl sm:text-5xl shadow-inner flex-shrink-0">
              {group.emoji}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs uppercase tracking-[0.25em] font-semibold mb-1" style={{ color: theme.accent }}>
                {t('Verzamelpagina')}
              </p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight drop-shadow-sm">
                {group.label}
              </h1>
            </div>
          </div>
          <p
            className="hub-anim mt-4 sm:mt-5 text-sm sm:text-base max-w-xl text-white/85 leading-relaxed"
            style={{ animationDelay: '0.08s' }}
          >
            {t(theme.tagline)}
          </p>
          <div
            className="hub-anim mt-5 h-1 w-16 rounded-full bg-white/40"
            style={{ animationDelay: '0.14s' }}
          />
        </div>
      </div>

      {/* ── Cards Grid ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {group.items.map((item, i) => (
          <button
            key={item.key}
            onClick={() => onNavigate(item.key)}
            className="hub-anim group relative flex flex-col items-start text-left bg-white rounded-xl border border-[#e9e0cf] p-5 sm:p-6 overflow-hidden shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:border-[#a90000]/30 active:scale-[0.99]"
            style={{ animationDelay: `${0.12 + i * 0.06}s` }}
          >
            {/* Top accent strip */}
            <span
              className="absolute top-0 left-0 right-0 h-[3px] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"
              style={{ background: 'linear-gradient(90deg, #a90000, #c81e1e)' }}
              aria-hidden
            />
            {/* Zachte glow achter de icon bij hover */}
            <div
              className="absolute -top-10 -right-10 w-28 h-28 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: 'radial-gradient(circle, rgba(169,0,0,0.10) 0%, transparent 70%)' }}
              aria-hidden
            />

            <div className="flex items-start gap-4 w-full relative">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                style={{
                  background: 'linear-gradient(135deg, #fff2f2 0%, #fce8e8 100%)',
                  border: '1px solid rgba(169,0,0,0.12)',
                  color: '#a90000',
                  boxShadow: '0 2px 6px rgba(169,0,0,0.08)',
                }}
              >
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-800 group-hover:text-[#a90000] transition-colors text-base sm:text-lg leading-snug">
                  {t(item.label)}
                </h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  {t(itemDescriptions[item.key] || '')}
                </p>
              </div>
            </div>

            {/* CTA-rij onderaan */}
            <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-[#a90000] opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 relative">
              <span>{t('Kijken')}</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
            </div>
          </button>
        ))}
      </div>

      {/* ── Verken ook ───────────────────────────────────────── */}
      <div className="pt-2">
        <div className="flex items-center gap-3 mb-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">
            {t('Verken ook')}
          </h3>
          <div className="flex-1 h-px bg-gradient-to-r from-[#e9e0cf] to-transparent" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {navGroups
            .filter((g) => g.label !== group.label)
            .map((otherGroup, i) => (
              <button
                key={t(otherGroup.label)}
                onClick={() => onNavigate(groupHubMap[otherGroup.label])}
                className="group flex items-center gap-4 p-4 rounded-xl border border-[#e9e0cf] bg-white hover:shadow-md hover:border-[#a90000]/25 hover:bg-[#fdf6f6] transition-all duration-300 active:scale-[0.99]"
              >
                <div className="w-11 h-11 rounded-lg bg-[#f5f5f0] border border-[#e9e0cf] flex items-center justify-center text-2xl transition-transform duration-300 group-hover:scale-110 flex-shrink-0">
                  {otherGroup.emoji}
                </div>
                <div className="text-left flex-1 min-w-0">
                  <span className="text-sm font-bold text-gray-800 group-hover:text-[#a90000] transition-colors block truncate">
                    {t(otherGroup.label)}
                  </span>
                  <span className="text-[11px] text-gray-400">
                    {otherGroup.items.length} {t('onderwerpen')}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#a90000] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}