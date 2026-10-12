'use client';

import { Globe } from 'lucide-react';
import { useT, type Lang } from '@/i18n/LangContext';

/**
 * Taalkeuze: NL / EN. Staan naast elkaar; de actieve taal is vet/rood.
 * compact=true => alleen "NL | EN" (mobiel), anders met bol-icoon.
 */
export function LangToggle({ compact = false }: { compact?: boolean }) {
  const { lang, setLang } = useT();
  const langs: { id: Lang; label: string }[] = [
    { id: 'nl', label: 'NL' },
    { id: 'en', label: 'EN' },
  ];
  return (
    <div className="inline-flex items-center gap-1" role="group" aria-label="Taal / Language">
      {!compact && <Globe className="w-4 h-4 text-[#6b6155]" />}
      {langs.map((l, i) => (
        <span key={l.id} className="inline-flex items-center">
          {i > 0 && <span className="text-[#2a2a2a]/25 mx-0.5">|</span>}
          <button
            type="button"
            onClick={() => setLang(l.id)}
            aria-pressed={lang === l.id}
            className={`text-xs font-semibold tracking-wide transition-colors ${
              lang === l.id ? 'text-[#a90000]' : 'text-[#6b6155] hover:text-[#a90000]'
            }`}
          >
            {l.label}
          </button>
        </span>
      ))}
    </div>
  );
}
