'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { DICT_NL, DICT_EN } from './registry';

export type Lang = 'nl' | 'en';

interface LangCtxValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  /** Vertaal een sleutel; val terug op NL, dan op de sleutel zelf. */
  t: (key: string) => string;
}

const LangCtx = createContext<LangCtxValue>({
  lang: 'nl',
  setLang: () => {},
  t: (k) => k,
});

/**
 * Taalkeuze voor de hele site (publiek + leden). Admin-dashboard wordt niet vertaald.
 * - Keuze wordt bewaard in localStorage ('mj-lang').
 * - Bezoeker met niet-Nederlandse browser krijgt automatisch Engels.
 * - Japanse termen (judo, uchi-mata, tatami, 柔道, ...) blijven in alle talen onaangeroerd.
 */
export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('nl');

  useEffect(() => {
    let initial: Lang = 'nl';
    try {
      const saved = localStorage.getItem('mj-lang');
      if (saved === 'nl' || saved === 'en') initial = saved;
      else if (typeof navigator !== 'undefined' && navigator.language && !navigator.language.toLowerCase().startsWith('nl')) {
        initial = 'en';
      }
    } catch {
      /* localStorage niet beschikbaar — blijf op NL */
    }
    setLangState(initial);
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem('mj-lang', l);
    } catch {
      /* noop */
    }
  }, []);

  const t = useCallback(
    (key: string) => {
      if (lang === 'en') return DICT_EN[key] ?? DICT_NL[key] ?? key;
      return DICT_NL[key] ?? key;
    },
    [lang],
  );

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return <LangCtx.Provider value={{ lang, setLang, t }}>{children}</LangCtx.Provider>;
}

export const useT = () => useContext(LangCtx);
