'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getClubPageNeighbors, type Section } from '@/components/nav-config';
import { useT } from '@/i18n/LangContext';

/**
 * Pagina-pager onderaan de club-pagina's:
 * "Terug naar …" (links) en "Verder naar …" (rechts).
 * De volgorde komt uit de Club-menustructuur (nav-config),
 * zodat "Verder naar" na Over Ons automatisch naar Tijdlijn wijst.
 */
export function SectionPager({ current, onNavigate }: {
  current: Section;
  onNavigate: (s: Section) => void;
}) {
  const { t } = useT();
  const { prev, next } = getClubPageNeighbors(current);
  if (!prev && !next) return null;

  return (
    <nav aria-label="Paginanavigatie" className="relative z-10 mx-auto mt-16 flex w-full max-w-2xl items-center justify-between gap-3 sm:mt-20">
      {prev ? (
        <button
          type="button"
          onClick={() => onNavigate(prev.key)}
          className="group flex flex-1 items-center gap-2 rounded-lg border border-[#2a2a2a]/15 bg-white/60 px-4 py-3 text-left text-sm font-medium text-[#2a2a2a] shadow-sm transition-all hover:border-[#a90000]/40 hover:bg-white hover:shadow-md"
        >
          <ChevronLeft className="h-4 w-4 shrink-0 text-[#a90000]/70 transition-transform group-hover:-translate-x-0.5" />
          <span className="min-w-0">
            <span className="block text-[10px] uppercase tracking-[0.18em] text-[#2a2a2a]/50">{t('Terug naar')}</span>
            <span className="block truncate">{t(prev.label)}</span>
          </span>
        </button>
      ) : (
        <span className="flex-1" />
      )}

      {next ? (
        <button
          type="button"
          onClick={() => onNavigate(next.key)}
          className="group flex flex-1 items-center justify-end gap-2 rounded-lg border border-[#a90000]/35 bg-[#a90000]/[0.04] px-4 py-3 text-right text-sm font-medium text-[#8c0000] shadow-sm transition-all hover:border-[#a90000]/60 hover:bg-[#a90000]/[0.08] hover:shadow-md"
        >
          <span className="min-w-0">
            <span className="block text-[10px] uppercase tracking-[0.18em] text-[#a90000]/60">{t('Verder naar')}</span>
            <span className="block truncate">{t(next.label)}</span>
          </span>
          <ChevronRight className="h-4 w-4 shrink-0 text-[#a90000] transition-transform group-hover:translate-x-0.5" />
        </button>
      ) : (
        <span className="flex-1" />
      )}
    </nav>
  );
}