// Content-vertalingen voor club-teksten (nieuws, verhaal, tijdlijn, agenda, events,
// juridisch, termen). Keys per bestand; EN-waarden overschrijven NL.
// Japanse termen blijven onaangeroerd.
import storyEn from './content/story_en.json';
import timelineEn from './content/timeline_en.json';
import newsEn from './content/news_en.json';
import agenda2026En from './content/agenda2026_en.json';
import eventsEn from './content/events_en.json';
import legalEn from './content/legal_en.json';
import termsEn from './content/terms_en.json';
import { storyChapters } from '@/data/story-chapters';
import { getLevels } from '@/data/japanese-course';
import type { Lang } from './LangContext';

type AnyRec = Record<string, any>;

const STORY_EN = storyEn as AnyRec;
const TIMELINE_EN = timelineEn as AnyRec;
const NEWS_EN = newsEn as AnyRec;
const AGENDA2026_EN = agenda2026En as AnyRec;
const EVENTS_EN = eventsEn as { agenda2025?: AnyRec; archive?: AnyRec };
const LEGAL_EN = legalEn as AnyRec;
const TERMS_EN = termsEn as AnyRec;

/** Hoofdstukken van het Over-Ons-verhaal, vertaald naar de gekozen taal. */
export function storyFor(lang: Lang) {
  if (lang === 'nl') return storyChapters;
  return storyChapters.map((ch) => {
    const en = STORY_EN[ch.number];
    if (!en) return ch;
    return {
      ...ch,
      title: en.title ?? ch.title,
      era: en.era ?? ch.era,
      paragraphs: Array.isArray(en.paragraphs) ? en.paragraphs : ch.paragraphs,
      photoCaption: en.photoCaption ?? ch.photoCaption,
    };
  });
}

/** Tijdlijn-events vertalen (key = year; tweede voorkomen van een jaar heeft 'b'-suffix). */
export function timelineItemFor<T extends { year: string; title: string; description: string; photoCaption?: string }>(ev: T, lang: Lang, occurrence = 0): T {
  if (lang === 'nl') return ev;
  const en = TIMELINE_EN[ev.year + (occurrence > 0 ? 'b' : '')] ?? TIMELINE_EN[ev.year];
  if (!en) return ev;
  return { ...ev, title: en.title ?? ev.title, description: en.description ?? ev.description, photoCaption: en.photoCaption ?? ev.photoCaption };
}

/** Nieuwsartikel (key = id) vertalen. */
export function newsItemFor<T extends { id: string; title: string; content: string }>(a: T, lang: Lang): T {
  if (lang === 'nl') return a;
  const en = NEWS_EN[a.id];
  if (!en) return a;
  return { ...a, title: en.title ?? a.title, content: en.content ?? a.content };
}

/** Agenda-item (key = compareDate) vertalen. */
export function agendaItemFor<T extends Record<string, any>>(item: T, lang: Lang): T {
  if (lang === 'nl') return item;
  const en = AGENDA2026_EN[item.compareDate];
  if (!en) return item;
  return applyAgendaEn(item, en);
}

/** Oudere agenda-items uit events.ts (key = compareDate; 2026-regels vallen terug op de agenda-set). */
export function agenda2025ItemFor<T extends Record<string, any>>(item: T, lang: Lang, occurrence = 0): T {
  if (lang === 'nl') return item;
  const en = (EVENTS_EN.agenda2025 ?? {})[item.compareDate + (occurrence > 0 ? `-${occurrence + 1}` : '')]
    ?? (EVENTS_EN.agenda2025 ?? {})[item.compareDate]
    ?? AGENDA2026_EN[item.compareDate];
  if (!en) return item;
  return applyAgendaEn(item, en);
}

function applyAgendaEn<T extends Record<string, any>>(item: T, en: AnyRec): T {
  const out: AnyRec = { ...item };
  for (const k of ['event', 'eventSub', 'details', 'locationSub', 'inschrijfTekst', 'weegtijdTitel']) {
    if (en[k] != null) out[k] = en[k];
  }
  if (en.eventInfo && out.eventInfo) {
    out.eventInfo = {
      ...out.eventInfo,
      title: en.eventInfo.title ?? out.eventInfo.title,
      sections: (out.eventInfo.sections ?? []).map((s: AnyRec, i: number) => {
        const es = (en.eventInfo.sections ?? [])[i];
        if (!es) return s;
        return { ...s, label: es.label ?? s.label, lines: Array.isArray(es.lines) ? es.lines : s.lines };
      }),
    };
  }
  if (Array.isArray(out.weegtijden) && Array.isArray(en.weegtijden)) {
    out.weegtijden = out.weegtijden.map((w: AnyRec, i: number) => ({
      ...w,
      age: en.weegtijden[i]?.age ?? w.age,
    }));
  }
  return out as T;
}

/** Archive-event (key = id) vertalen. */
export function archiveEventFor<T extends { id: string; title: string; description?: string }>(ev: T, lang: Lang): T {
  if (lang === 'nl') return ev;
  const en = (EVENTS_EN.archive ?? {})[ev.id];
  if (!en) return ev;
  return { ...ev, title: en.title ?? ev.title, description: en.description ?? ev.description };
}

/** Juridisch document (key = id) vertalen. */
export function legalDocFor<T extends { id: string; title: string; sections: { heading: string; content: string }[] }>(doc: T, lang: Lang): T {
  if (lang === 'nl') return doc;
  const en = LEGAL_EN[doc.id];
  if (!en) return doc;
  return {
    ...doc,
    title: en.title ?? doc.title,
    sections: doc.sections.map((s, i) => {
      const es = (en.sections ?? [])[i];
      if (!es) return s;
      return { heading: es.heading ?? s.heading, content: es.content ?? s.content };
    }),
  };
}

/** Betekenis van een Japans cursus-term (key = uitspraak; 'Ippon' heeft een level-0 variant). */
export function termMeaning(uitspraak: string, fallback: string, lang: Lang, level?: string | number): string {
  if (lang === 'nl') return fallback;
  const map = (TERMS_EN['japanese-course'] ?? {}) as Record<string, string>;
  if (level === 0 && typeof map[`${uitspraak} (level 0)`] === 'string') return map[`${uitspraak} (level 0)`];
  const v = map[uitspraak];
  return typeof v === 'string' && v ? v : fallback;
}

let _DUTCH_TO_EN: Record<string, string> | null = null;
/** Terugzoekslag: Nederlandse betekenis -> Engelse betekenis (voor quizopties). */
export function termMeaningByDutch(dutch: string, lang: Lang): string | null {
  if (lang === 'nl') return null;
  if (!_DUTCH_TO_EN) {
    _DUTCH_TO_EN = {};
    const enMap = (TERMS_EN['japanese-course'] ?? {}) as Record<string, string>;
    for (const level of getLevels()) {
      for (const term of level.terms) {
        const en = enMap[term.uitspraak];
        if (en) _DUTCH_TO_EN[term.nederlands] = en;
      }
    }
  }
  return _DUTCH_TO_EN[dutch] ?? null;
}

/** Term-betekenis uit termen-bestanden (key per bestand). Waarde kan string of object zijn. */
export function termFor(file: 'judo-terms' | 'japanese-course' | 'belt-knots' | 'videos' | 'club-music' | 'techniques-card', key: string, field: string, fallback: string, lang: Lang): string {
  if (lang === 'nl') return fallback;
  const v = (TERMS_EN[file] ?? {})[key];
  if (typeof v === 'string' && v) return v;
  if (v && typeof v[field] === 'string' && v[field]) return v[field];
  return fallback;
}

import galleryEn from './content/gallery_en.json';
const GALLERY_EN = galleryEn as Record<string, string>;

export function captionFor(caption: string, lang: Lang): string {
  if (lang === 'nl') return caption;
  return GALLERY_EN[caption] || caption;
}

import techniquesEn from './content/techniques_en.json';
const TECHNIQUES_EN = techniquesEn as Record<string, string>;

export function techDutchFor(dutch: string, lang: Lang): string {
  if (lang === 'nl') return dutch;
  return TECHNIQUES_EN[dutch] || dutch;
}
