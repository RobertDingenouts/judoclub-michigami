'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { GraduationCap, ArrowRight, MapPin, Clock, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n/LangContext';
import type { Section } from '@/components/nav-config';
import { scheduleInfo } from '@/data/schedule';
import { techniqueCategories } from '@/data/techniques';

/* ============================================================================
   WAT IS JUDO — "OP DE MAT" (2026)
   Volledig nieuw vanaf nul. Geen framer-motion, geen canvas, geen JS-animaties:
   - Tatami-weefsel achtergrond puur via CSS gradients
   - Bandenbalk bovenin: schaal mee met scrollen (animation-timeline: scroll)
   - Scroll-reveals via native CSS animation-timeline: view()
     (browsers zonder ondersteuning tonen alles gewoon)
   - Twee thema's via prefers-color-scheme + is-light/is-dark
   ========================================================================== */

function useSystemDark() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    setDark(mq.matches);
    const fn = (e: MediaQueryListEvent) => setDark(e.matches);
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, []);
  return dark;
}

/* rood zegel-stempeltje met kana */
function Stamp({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn('waj-stamp waj-mincho', className)} aria-hidden>
      {children}
    </span>
  );
}

/* hoofdstuk-kop met ghost-kanji */
function ChapterHead({ kanji, eyebrow, title }: { kanji: string; eyebrow: string; title: string }) {
  return (
    <header className="waj-reveal relative mb-8 sm:mb-10">
      <span className="waj-ghost waj-mincho" aria-hidden>{kanji}</span>
      <div className="relative">
        <div className="mb-2 flex items-center gap-3">
          <span className="waj-rule" aria-hidden />
          <span className="waj-kaku text-[11px] font-semibold uppercase tracking-[0.38em]" style={{ color: 'var(--wj-red)' }}>
            {eyebrow}
          </span>
        </div>
        <h2 className="waj-mincho text-3xl font-black leading-tight sm:text-4xl" style={{ color: 'var(--wj-ink)' }}>
          {title}
        </h2>
      </div>
    </header>
  );
}

const BELTS: Array<{ name: string; kyu: string; c: string; edge?: string; ink: string }> = [
  { name: 'Witte',   kyu: '6e kyu',     c: '#f6f3ea', edge: '#cfc7b2', ink: '#2a2a2a' },
  { name: 'Gele',    kyu: '5e kyu',     c: '#f2c200', ink: '#2a2a2a' },
  { name: 'Oranje',  kyu: '4e kyu',     c: '#e8791e', ink: '#2a2a2a' },
  { name: 'Groene',  kyu: '3e kyu',     c: '#2f9e52', ink: '#f6f3ea' },
  { name: 'Blauwe',  kyu: '2e kyu',     c: '#1f5fbf', ink: '#f6f3ea' },
  { name: 'Bruine',  kyu: '1e kyu',     c: '#6b3f1d', ink: '#f6f3ea' },
  { name: 'Zwarte',  kyu: '1e–10e dan', c: '#17140f', ink: '#f6f3ea' },
];

export function WhatIsJudoSection({ onNavigate }: { onNavigate?: (s: Section) => void }) {
  const { t } = useT();
  const dark = useSystemDark();
  const rootRef = useRef<HTMLDivElement>(null);

  /* techniekcijfers rechtstreeks uit de site-data */
  const tech = useMemo(() => {
    const byKey = Object.fromEntries(techniqueCategories.map(c => [c.key, c]));
    const sum = (keys: string[]) => keys.reduce((a, k) => a + (byKey[k]?.techniques.length ?? 0), 0);
    return {
      ukemi: byKey['valbreken']?.techniques.length ?? 0,
      nage: sum(['armworpen', 'schouderworpen', 'heupworpen', 'beenworpen', 'offerworpen']),
      katame: sum(['houdgrepen', 'wurgingen', 'armklemmen']),
      nageCats: ['armworpen', 'schouderworpen', 'heupworpen', 'beenworpen', 'offerworpen'].map(k => byKey[k]).filter(Boolean),
      katameCats: ['houdgrepen', 'wurgingen', 'armklemmen'].map(k => byKey[k]).filter(Boolean),
    };
  }, []);

  const principles = [
    {
      kanji: '精力善用',
      romaji: 'Seiryoku Zen’yō',
      title: t('Kracht slim gebruiken'),
      body: t('Met zo min mogelijk inspanning het beste resultaat halen. Duwen je tegenstanders? Dan trek je mee — zijn kracht wordt jouw kracht.'),
    },
    {
      kanji: '相互協力',
      romaji: 'Jita Kyōei',
      title: t('Samen groeien'),
      body: t('Je leert mét elkaar, niet tégen elkaar. Je partner helpt jou beter worden en jij hem of haar. Zonder respect geen judo.'),
    },
  ];

  const lessonSteps = [
    { jp: '礼', nl: t('Groeten'), body: t('Iedere les begint en eindigt met een buiging. De judoka’s zitten op volgorde van band in een rij, de “judozit”. Respect voor elkaar is de basis van alles.') },
    { jp: '準備', nl: t('Opwarmen'), body: t('Renmen, stretchen en spelletjes — vaak al met judo-bewegingen erin verwerkt. Het lichaam gaat klaarstaan om veilig te kunnen rollen.') },
    { jp: '受身', nl: t('Vallen leren'), body: t('De belangrijkste vaardigheid van judo: veilig vallen op de mat, voorwaarts, achterwaarts, opzij. Wie goed kan vallen, blesseert zich bijna nooit — daarom is judo veiliger dan het eruitziet.') },
    { jp: '打込', nl: t('Techniek oefenen'), body: t('De leraar laat een worp of houdgreep zien. Daarna oefen je die stap voor stap met een partner: eerst aannemen, dan instappen, dan werpen. Net zo lang tot het vanzelf gaat.') },
    { jp: '乱取', nl: t('Vrij trainen (randori)'), body: t('Alles wat je geleerd hebt in de praktijk proberen tegen een maatje — met controle en respect. Hier wordt judo een puzzel: hoe pak jij iemand, en hoe ontwijkt hij het?') },
    { jp: '終', nl: t('Afsluiten'), body: t('Terug in de judozit, nogmaals groeten, en soms nog een spelletje of een woordje uitleg. Dan naar huis, met een betere val en een nieuwe techniek in je hoofd.') },
  ];

  const kit = [
    { jp: '最初', nl: t('Eerste les'), body: t('Gewone sportkleding zonder ritsen, knopen of gespen — een trainings- of joggingpak is perfect. Meenemen: een flesje water en slippers voor erbij.') },
    { jp: '柔道着', nl: t('Judogi'), body: t('Het witte judopak dat je later draagt, met daarin je band. Niet verplicht bij het starten, maar na een paar lessen wel zo handig — je kunt ze via de leraar bestellen.') },
    { jp: '爪', nl: t('Verzorgd'), body: t('Judo doe je op blote voeten: korte nagels (vingers én tenen), geen sieraden en schone voeten. Zo bescherm je jezelf en je partner.') },
  ];

  const benefits = [
    { icon: '🛡️', nl: t('Durven'), body: t('Wie leert vallen zonder bang te worden, durft meer — op de mat én erbuiten.') },
    { icon: '🤝', nl: t('Respect'), body: t('Groeten, helpen, op je beurt wachten. Judo is een sport waarin beleefdheid geen regel is, maar de bedoeling.') },
    { icon: '💪', nl: t('Sterker worden'), body: t('Balans, conditie, reflexen — je hele lichaam werkt mee. Geen eenzijdige sport: judo maakt je fit van top tot teen.') },
    { icon: '🧠', nl: t('Denken'), body: t('Judo is schaken met je lichaam. Je leest je tegenstander, plant twee stappen vooruit en leert van elke mislukking.') },
  ];

  return (
    <div ref={rootRef} className={cn('waj-root zen-fullbleed relative overflow-hidden', dark ? 'is-dark' : 'is-light')}>

      {/* bandenbalk: kleurt zich naarmate je leest */}
      <div className="waj-beltbar" aria-hidden />

      {/* ══════════════════ HERO ══════════════════ */}
      <section className="relative flex min-h-[88vh] flex-col items-center justify-center px-5 py-24 text-center sm:px-8">
        <span className="waj-enso waj-mincho" aria-hidden>柔道</span>
        <span className="waj-vkanji waj-mincho absolute right-5 top-1/2 hidden -translate-y-1/2 lg:block" aria-hidden>柔道</span>

        <div className="relative z-10 flex flex-col items-center">
          <div className="waj-reveal mb-6 flex items-center gap-4">
            <span className="waj-rule" aria-hidden />
            <span className="waj-kaku text-[11px] font-semibold uppercase tracking-[0.42em]" style={{ color: 'var(--wj-red)' }}>
              {t('Judo in gewone woorden')}
            </span>
            <span className="waj-rule" aria-hidden />
          </div>

          <h1 className="waj-reveal waj-mincho text-5xl font-black leading-[1.05] sm:text-7xl" style={{ color: 'var(--wj-ink)' }}>
            {t('Wat is judo?')}
          </h1>

          <p className="waj-reveal waj-kaku mt-6 max-w-2xl text-base leading-relaxed sm:text-lg" style={{ color: 'var(--wj-ink-soft)' }}>
            {t('De zachte weg, uitgelegd zonder vakjargon: hoe een judoles in elkaar steekt, hoe het werkt met banden en examens, en welke technieken je leert — van je eerste val tot je zwarte band.')}
          </p>

          <div className="waj-reveal mt-10 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-proefles'))}
              className="waj-kaku inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white transition-transform hover:scale-[1.03]"
              style={{ background: 'var(--wj-red)' }}
            >
              {t('Gratis proefles')}
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => onNavigate?.('leden')}
              className="waj-kaku inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-bold transition-transform hover:scale-[1.03]"
              style={{ borderColor: 'var(--wj-hairline)', color: 'var(--wj-ink)' }}
            >
              {t('Lid Worden')}
            </button>
          </div>

          <div className="waj-reveal mt-14 flex flex-col items-center gap-2" aria-hidden>
            <span className="waj-kaku text-[10px] uppercase tracking-[0.4em]" style={{ color: 'var(--wj-ink-faint)' }}>{t('scrol naar beneden')}</span>
            <span className="waj-arrow" />
          </div>
        </div>
      </section>

      {/* ══════════════════ HOOFDSTUK 壱 — JUDO IN ÉÉN ADEM ══════════════════ */}
      <section className="waj-chapter" data-chapter>
        <ChapterHead kanji='壱' eyebrow={t('De wortels')} title={t('Judo in één adem')} />

        <div className="waj-reveal waj-card waj-kaku p-6 sm:p-8">
          <p className="leading-relaxed" style={{ color: 'var(--wj-ink-soft)' }}>
            {t('Judo komt uit Japan en werd in 1882 bedacht door')} <strong style={{ color: 'var(--wj-ink)' }}>{t('Jigoro Kano')}</strong>{t(', een kleine, zwakke jongen die judo juist gebruikte om sterker te worden. Hij maakte van de oude samoerai-gevechtstechnieken een moderne sport met een duidelijke missie: lichaam en hoofd trainen tegelijk. In 1964 werd judo een olympische sport — en tegenwoordig beoefenen miljoenen mensen het over de hele wereld.')}
          </p>
          <p className="mt-4 leading-relaxed" style={{ color: 'var(--wj-ink-soft)' }}>
            {t('Het woord zelf wijst de richting:')} <span className="waj-mincho font-bold" style={{ color: 'var(--wj-ink)' }}>柔</span> {t('ju = zacht, meegaand')} — <span className="waj-mincho font-bold" style={{ color: 'var(--wj-ink)' }}>道</span> {t('do = de weg.')} {t('De zachte weg wint niet door harder duwen, maar door de kracht van je tegenstander mét je beweging mee te gebruiken — zoals een zeilboot de wind gebruikt in plaats van ertegen te roeien.')}
          </p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {principles.map((p, i) => (
            <div key={i} className="waj-reveal waj-card waj-kaku relative p-6">
              <Stamp>{p.kanji.slice(0, 2)}</Stamp>
              <div className="waj-mincho text-2xl font-black" style={{ color: 'var(--wj-ink)' }}>{p.kanji}</div>
              <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.25em]" style={{ color: 'var(--wj-red)' }}>{p.romaji}</div>
              <h3 className="mt-3 text-base font-bold" style={{ color: 'var(--wj-ink)' }}>{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--wj-ink-soft)' }}>{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════ HOOFDSTUK 弐 — DE JUDOLES ══════════════════ */}
      <section className="waj-chapter" data-chapter>
        <ChapterHead kanji='弐' eyebrow={t('Zo werkt het')} title={t('Hoe gaat een judoles?')} />

        <p className="waj-reveal waj-kaku mb-8 max-w-2xl text-sm leading-relaxed sm:text-base" style={{ color: 'var(--wj-ink-soft)' }}>
          {t('Elke les volgt hetzelfde ritme — van de groet tot de groet. Een uur lang afwisselen tussen spel, vallen, techniek en vrij trainen.')}
        </p>

        <ol className="waj-timeline waj-kaku">
          {lessonSteps.map((s, i) => (
            <li key={i} className="waj-reveal waj-step">
              <span className="waj-step-dot waj-mincho" aria-hidden>{i + 1}</span>
              <div className="waj-card p-5 sm:p-6">
                <div className="flex items-baseline gap-3">
                  <h3 className="text-base font-bold sm:text-lg" style={{ color: 'var(--wj-ink)' }}>{s.nl}</h3>
                  <span className="waj-mincho text-lg" style={{ color: 'var(--wj-red)' }}>{s.jp}</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--wj-ink-soft)' }}>{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ══════════════════ HOOFDSTUK 参 — KLEDING ══════════════════ */}
      <section className="waj-chapter" data-chapter>
        <ChapterHead kanji='参' eyebrow={t('Meenemen')} title={t('Wat trek je aan?')} />

        <div className="grid gap-4 sm:grid-cols-3">
          {kit.map((k, i) => (
            <div key={i} className="waj-reveal waj-card waj-kaku p-6">
              <div className="waj-mincho text-xl font-black" style={{ color: 'var(--wj-red)' }}>{k.jp}</div>
              <h3 className="mt-2 text-base font-bold" style={{ color: 'var(--wj-ink)' }}>{k.nl}</h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--wj-ink-soft)' }}>{k.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════ HOOFDSTUK 肆 — BANDEN ══════════════════ */}
      <section className="waj-chapter" data-chapter>
        <ChapterHead kanji='肆' eyebrow={t('Zichtbaar groeien')} title={t('Banden: hoe werkt dat?')} />

        <p className="waj-reveal waj-kaku mb-8 max-w-2xl text-sm leading-relaxed sm:text-base" style={{ color: 'var(--wj-ink-soft)' }}>
          {t('Je band (obi) laat zien hoe ver je al bent. Elke kleur is een etappe: bij elke band komen er nieuwe technieken bij, en bij elke overgang hoort een examen.')}
        </p>

        {/* banden-ladder */}
        <div className="waj-reveal waj-beltrow" role="img" aria-label={t('Witte band, gele band, oranje band, groene band, blauwe band, bruine band, zwarte band')}>
          {BELTS.map((b, i) => (
            <div key={b.name} className="waj-belt-col">
              <div className="waj-belt" style={{ background: b.c, borderColor: b.edge ?? 'rgba(0,0,0,0.25)' }} aria-hidden>
                <span className="waj-belt-stitch" />
              </div>
              <div className="waj-kaku mt-3 text-center">
                <div className="text-sm font-bold" style={{ color: 'var(--wj-ink)' }}>{t(b.name)} {t('band')}</div>
                <div className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--wj-ink-faint)' }}>{b.kyu}</div>
                {i < BELTS.length - 1 && <span className="waj-belt-arrow" aria-hidden>→</span>}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="waj-reveal waj-card waj-kaku p-6">
            <Stamp>幼</Stamp>
            <h3 className="text-base font-bold" style={{ color: 'var(--wj-ink)' }}>{t('Kinderen: met slips')}</h3>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--wj-ink-soft)' }}>{t('Judokinderen tot 13 jaar maken extra tussenstappen met een halve band — een slip. Wit met geel, geel met oranje, en zo door. Zo is er vaak iets te halen en blijft judo leuk.')} </p>
          </div>
          <div className="waj-reveal waj-card waj-kaku p-6">
            <Stamp>級</Stamp>
            <h3 className="text-base font-bold" style={{ color: 'var(--wj-ink)' }}>{t('Kyu en dan')}</h3>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--wj-ink-soft)' }}>{t('Alle kleurbanden zijn kyu-graden: wit is 6e kyu, bruin is 1e kyu. Daarna komt de zwarte band: de dan-graden, van 1e tot en met 10e dan. Zwart is geen einde — het is het begin van een nieuw pad.')} </p>
          </div>
          <div className="waj-reveal waj-card waj-kaku p-6">
            <Stamp>験</Stamp>
            <h3 className="text-base font-bold" style={{ color: 'var(--wj-ink)' }}>{t('Examen bij Michigami')}</h3>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--wj-ink-soft)' }}>{t('Je leraar bepaalt wanneer je eraan toe bent — er zit geen vaste wachttijd tussen. Welke technieken je voor elke band moet kunnen, staat op de exameneisenpagina. Na het examen krijg je een verifieerbaar diploma.')} </p>
          </div>
        </div>

        <div className="waj-reveal mt-5 flex flex-wrap gap-3">
          <button onClick={() => onNavigate?.('exameneisen')} className="waj-link waj-kaku">
            {t('Bekijk de exameneisen per band')} <ArrowRight className="h-4 w-4" />
          </button>
          <button onClick={() => onNavigate?.('band-knopen')} className="waj-link waj-kaku">
            {t('Zo knoop je je band')} <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* ══════════════════ HOOFDSTUK 伍 — TECHNIEKEN ══════════════════ */}
      <section className="waj-chapter" data-chapter>
        <ChapterHead kanji='伍' eyebrow={t('De gereedschapskist')} title={t('Technieken: wat leer je?')} />

        <p className="waj-reveal waj-kaku mb-8 max-w-2xl text-sm leading-relaxed sm:text-base" style={{ color: 'var(--wj-ink-soft)' }}>
          {t('Judo kent tientallen officiële technieken, opgedeeld in drie families. Je begint altijd met vallen — de rest bouw je daar bovenop.')}
        </p>

        <div className="grid gap-4 lg:grid-cols-3">
          {/* ukemi */}
          <div className="waj-reveal waj-card waj-kaku p-6">
            <div className="flex items-center justify-between">
              <span className="waj-mincho text-xl font-black" style={{ color: 'var(--wj-ink)' }}>受身</span>
              <span className="waj-count">{tech.ukemi}</span>
            </div>
            <h3 className="mt-2 text-base font-bold" style={{ color: 'var(--wj-ink)' }}>{t('Valbreken')} <span className="font-normal" style={{ color: 'var(--wj-ink-faint)' }}>ukemi-waza</span></h3>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--wj-ink-soft)' }}>{t('Vallen zonder pijn: achterover, opzij, voorover en rollend. De basis van alles, en de reden dat judo zo veilig is.')} </p>
          </div>
          {/* nage */}
          <div className="waj-reveal waj-card waj-kaku p-6">
            <div className="flex items-center justify-between">
              <span className="waj-mincho text-xl font-black" style={{ color: 'var(--wj-ink)' }}>投技</span>
              <span className="waj-count">{tech.nage}</span>
            </div>
            <h3 className="mt-2 text-base font-bold" style={{ color: 'var(--wj-ink)' }}>{t('Werptechnieken')} <span className="font-normal" style={{ color: 'var(--wj-ink-faint)' }}>nage-waza</span></h3>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--wj-ink-soft)' }}>{t('Iemand van zijn voeten halen en glijdend op de mat zetten — met je armen, heup of benen.')} </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {tech.nageCats.map(c => (
                <span key={c.key} className="waj-chip">{c.label} · {c.techniques.length}</span>
              ))}
            </div>
          </div>
          {/* katame */}
          <div className="waj-reveal waj-card waj-kaku p-6">
            <div className="flex items-center justify-between">
              <span className="waj-mincho text-xl font-black" style={{ color: 'var(--wj-ink)' }}>固技</span>
              <span className="waj-count">{tech.katame}</span>
            </div>
            <h3 className="mt-2 text-base font-bold" style={{ color: 'var(--wj-ink)' }}>{t('Grondtechnieken')} <span className="font-normal" style={{ color: 'var(--wj-ink-faint)' }}>katame-waza</span></h3>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--wj-ink-soft)' }}>{t('Eenmaal op de mat: iemand 20 seconden vasthouden, of met een wurging of armklem winnen. Op onze club leren kinderen deze pas later, in veilige vormen.')} </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {tech.katameCats.map(c => (
                <span key={c.key} className="waj-chip">{c.label} · {c.techniques.length}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="waj-reveal mt-5 flex flex-wrap gap-3">
          <button onClick={() => onNavigate?.('technieken')} className="waj-link waj-kaku">
            {t('Alle technieken met video’s')} <ArrowRight className="h-4 w-4" />
          </button>
          <button onClick={() => onNavigate?.('cursusjapans')} className="waj-link waj-kaku">
            {t('Leer de Japanse termen (Cursus Japans)')} <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* ══════════════════ HOOFDSTUK 陸 — VOOR WIE ══════════════════ */}
      <section className="waj-chapter" data-chapter>
        <ChapterHead kanji='陸' eyebrow={t('Iedereen is welkom')} title={t('Voor wie is judo?')} />

        <p className="waj-reveal waj-kaku mb-8 max-w-2xl text-sm leading-relaxed sm:text-base" style={{ color: 'var(--wj-ink-soft)' }}>
          {t('Vanaf 6 jaar, van kind tot volwassene, jongen en meisje, recreatief of fanatiek. Bij Michigami trainen we op twee locaties:')}
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {scheduleInfo.days.map(day => (
            <div key={day.day} className="waj-reveal waj-card waj-kaku p-6">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" style={{ color: 'var(--wj-red)' }} />
                <h3 className="text-base font-bold" style={{ color: 'var(--wj-ink)' }}>{day.dayLabel}</h3>
              </div>
              <ul className="mt-4 space-y-3">
                {day.sessions.map(s => (
                  <li key={s.groupName} className="flex items-start justify-between gap-3 border-t pt-3 first:border-t-0 first:pt-0" style={{ borderColor: 'var(--wj-hairline)' }}>
                    <div>
                      <div className="text-sm font-bold" style={{ color: 'var(--wj-ink)' }}>{s.groupName}</div>
                      <div className="mt-0.5 flex items-center gap-1.5 text-xs" style={{ color: 'var(--wj-ink-faint)' }}>
                        <Users className="h-3 w-3" /> {s.ageRange}
                      </div>
                      <div className="mt-0.5 flex items-center gap-1.5 text-xs" style={{ color: 'var(--wj-ink-faint)' }}>
                        <MapPin className="h-3 w-3" /> {s.location}
                      </div>
                    </div>
                    <div className="waj-mincho shrink-0 text-sm font-bold" style={{ color: 'var(--wj-red)' }}>
                      {s.startTime}–{s.endTime}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="waj-reveal mt-5 flex flex-wrap gap-3">
          <button onClick={() => onNavigate?.('lestijden')} className="waj-link waj-kaku">
            {t('Volledig lesrooster')} <ArrowRight className="h-4 w-4" />
          </button>
          <button onClick={() => onNavigate?.('locatie')} className="waj-link waj-kaku">
            {t('Waar trainen we?')} <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* ══════════════════ HOOFDSTUK 漆 — WAAROM ══════════════════ */}
      <section className="waj-chapter" data-chapter>
        <ChapterHead kanji='漆' eyebrow={t('Meenemen voor het leven')} title={t('Waarom judo?')} />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b, i) => (
            <div key={i} className="waj-reveal waj-card waj-kaku p-6">
              <div className="text-2xl" aria-hidden>{b.icon}</div>
              <h3 className="mt-2 text-base font-bold" style={{ color: 'var(--wj-ink)' }}>{b.nl}</h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--wj-ink-soft)' }}>{b.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════ CTA ══════════════════ */}
      <section className="waj-chapter waj-cta">
        <div className="waj-reveal relative flex flex-col items-center rounded-3xl border p-10 text-center sm:p-14"
          style={{ borderColor: 'var(--wj-hairline)', background: 'var(--wj-card)' }}>
          <Stamp>始</Stamp>
          <h2 className="waj-mincho text-3xl font-black sm:text-4xl" style={{ color: 'var(--wj-ink)' }}>
            {t('Het beste antwoord? Zelf proberen.')}
          </h2>
          <p className="waj-kaku mt-4 max-w-xl text-sm leading-relaxed sm:text-base" style={{ color: 'var(--wj-ink-soft)' }}>
            {t('Je mag bij ons drie lessen gratis meedoen. Geen lidmaatschap, geen verplichtingen — gewoon meedoen en kijken of het bevalt.')}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-proefles'))}
              className="waj-kaku inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold text-white transition-transform hover:scale-[1.03]"
              style={{ background: 'var(--wj-red)' }}
            >
              <GraduationCap className="h-4 w-4" />
              {t('Gratis proefles')}
            </button>
            <button
              onClick={() => onNavigate?.('leden')}
              className="waj-kaku inline-flex items-center gap-2 rounded-full border px-7 py-3.5 text-sm font-bold transition-transform hover:scale-[1.03]"
              style={{ borderColor: 'var(--wj-hairline)', color: 'var(--wj-ink)' }}
            >
              {t('Lid Worden')}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
