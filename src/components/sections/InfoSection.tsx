'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ChevronRight, ScrollText, Award } from 'lucide-react';
import { ImageLightbox } from '@/components/ui/ImageLightbox';
import { cn } from '@/lib/utils';
import { storyChapters } from '@/data/story-chapters';
import { useT } from '@/i18n/LangContext';
import { storyFor } from '@/i18n/content';
import type { Section } from '@/components/nav-config';

/* ============================================================================
   OVER ONS — "HET VERHAAL VAN DE ZACHTE WEG" (2026)
   Volledig nieuw vanaf nul. Geen framer-motion, geen canvas, geen JS-animaties:
   - Caustics-water via SVG-feTurbulence maskers + CSS keyframes (eeuwig vloeiend)
   - Scroll-reveals via native CSS `animation-timeline: view()` — browsers zonder
     ondersteuning tonen alles gewoon (fallback = geen enkele onzichtbare tekst)
   - Twee thema's via prefers-color-scheme, alles via CSS-variabelen
   Tekst is 1-op-1 behouden.
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
    <span className={cn('story-stamp story-mincho', className)} aria-hidden>
      {children}
    </span>
  );
}

export function InfoSection({ onNavigate }: { onNavigate?: (s: Section) => void }) {
  const { t, lang } = useT();
  const chapters = storyFor(lang);
  const [signupOpen, setSignupOpen] = useState(false);
  const dark = useSystemDark();
  const rootRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const masters = [
    { name: 'Robin Hack', dan: '三', danLabel: '3e Dan', role: t('Trainer & penningmeester') },
    { name: 'Pascal Hack', dan: '三', danLabel: '3e Dan', role: t('Trainer & voorzitter') },
    { name: 'Robert Dingenouts', dan: '三', danLabel: '3e Dan', role: t('Trainer & secretaris') },
    { name: 'Wendy Jansen', dan: '一', danLabel: '1e Dan', role: t('Trainer & EHBO\u2019er') },
  ];

  const principles = [
    {
      kanji: '力',
      name: 'Seiryoku Zen\u2019yō',
      sub: t('Macht — zuinig besteed'),
      body: t('Kracht is een middelpunt, geen doel. Judo leert je je kracht zo in te zetten dat er het minste nodig is voor het beste resultaat.'),
    },
    {
      kanji: '和',
      name: 'Jita Kyōei',
      sub: t('Gemeenschappelijk welzijn'),
      body: t('Zelf en de ander op één lijn. De zachte weg draait om wederzijds voordeel — winnen zonder de ander te verwonden.'),
    },
  ];

  /* actieve hoofdstuk-rail via IntersectionObserver (werkt in elke scroll-container) */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const arts = Array.from(root.querySelectorAll<HTMLElement>('[data-chapter]'));
    if (!arts.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        let best = -1, bestVis = 0;
        for (const en of entries) {
          const i = arts.indexOf(en.target as HTMLElement);
          if (i >= 0 && en.intersectionRatio > bestVis) { bestVis = en.intersectionRatio; best = i; }
        }
        if (best >= 0 && bestVis > 0) setActive((p) => (p !== best ? best : p));
      },
      { threshold: [0.15, 0.4, 0.7] },
    );
    arts.forEach((a) => io.observe(a));
    return () => io.disconnect();
  }, []);

  const stats = useMemo(() => ([
    { n: '1993', l: t('opgericht') },
    { n: '2', l: t('locaties') },
    { n: '8e', l: t('dan oprichter') },
  ]), [t]);

  return (
    <div ref={rootRef} className={cn('story-root zen-fullbleed relative overflow-hidden', dark ? 'is-dark' : 'is-light')}>

      {/* ══════════════════ HERO — de zon boven het pad ══════════════════ */}
      <section className="relative flex min-h-[92vh] flex-col items-center justify-center px-5 py-24 text-center sm:px-8">
        {/* de zon */}
        <div className="story-disc story-disc-hero" aria-hidden />
        {/* verticale kanji aan de randen */}
        <span className="story-vkanji absolute right-5 top-1/2 hidden -translate-y-1/2 lg:block" aria-hidden>柔道</span>
        <span className="story-vkanji story-vkanji-sm absolute left-5 top-1/2 hidden -translate-y-1/2 lg:block" aria-hidden>柔道始</span>

        <div className="relative z-10 flex flex-col items-center">
          <div className="story-reveal flex items-center gap-4">
            <span className="story-rule" aria-hidden />
            <span className="story-kaku text-[11px] font-semibold uppercase tracking-[0.42em]" style={{ color: 'var(--st-gold)' }}>
              Est. 1993 · Steenbergen
            </span>
            <span className="story-rule" aria-hidden />
          </div>

          <h1 className="story-mincho story-reveal story-title-glow mt-7 text-[2.6rem] font-black leading-[1.08] sm:text-6xl lg:text-7xl" style={{ color: 'var(--st-ink)' }}>
            {t('Al dertig jaar')}
            <br />
            <span className="story-accent" style={{ color: 'var(--st-red)' }}>{t('bloeit judo hier')}</span>
          </h1>

          <p className="story-reveal story-kaku mx-auto mt-8 max-w-xl text-base font-light leading-relaxed sm:text-lg" style={{ color: 'var(--st-ink-soft)' }}>
            {t('Michigami groeide uit tot een van de grootste judoclubs van de regio — een bloeiende club die altijd doorging, door de gouden jaren en de stillere tijden. Meer dan dertig jaar later bloeit het judo hier nog steeds. Dit is het verhaal van een pad dat hier nooit gestopt heeft.')}
          </p>

          <div className="story-reveal mt-12 grid w-full max-w-lg grid-cols-3">
            {stats.map((s, i) => (
              <div key={i} className="story-stat px-3 sm:px-6">
                <div className="story-mincho text-3xl font-black sm:text-4xl" style={{ color: i === 2 ? 'var(--st-red)' : 'var(--st-ink)' }}>{s.n}</div>
                <div className="story-kaku mt-1 whitespace-nowrap text-[9px] uppercase tracking-[0.18em] sm:text-[10px] sm:tracking-[0.22em]" style={{ color: 'var(--st-ink-faint)' }}>{s.l}</div>
              </div>
            ))}
          </div>

          <div className="story-reveal mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button onClick={() => onNavigate?.('leden')}
              className="story-sheen px-7 py-3 text-white" style={{ background: 'linear-gradient(135deg, #c1100c, var(--shu-600))', boxShadow: '0 14px 36px -12px rgba(169,0,0,0.6)' }}>
              {t('Boek een proefles')}
            </Button>
            <Button onClick={() => onNavigate?.('timeline')} variant="outline"
              className="story-outline backdrop-blur-sm">
              <ScrollText className="mr-2 h-4 w-4" />
              {t('Bekijk de volledige tijdlijn')}
            </Button>
          </div>
        </div>

        {/* scroll-hint — alleen desktop */}
        <div className="absolute bottom-7 left-1/2 z-10 hidden -translate-x-1/2 text-center md:block" aria-hidden>
          <div className="story-kaku text-[10px] uppercase tracking-[0.3em]" style={{ color: 'var(--st-ink-faint)' }}>{t('het verhaal')}</div>
          <svg className="story-nudge mx-auto mt-2" width="14" height="22" viewBox="0 0 14 22" fill="none">
            <path d="M7 1v18M1 13l6 7 6-7" stroke="var(--st-gold)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </section>

      {/* ══════════════════ HOOFDSTUKKEN — de rol ══════════════════ */}
      <section className="relative mx-auto max-w-6xl px-5 pb-8 sm:px-8">
        <div className="story-reveal flex items-end gap-5">
          <span className="story-mincho text-6xl leading-none sm:text-7xl" style={{ color: 'var(--st-red)' }} aria-hidden>語</span>
          <div>
            <h2 className="story-mincho text-3xl font-black sm:text-4xl" style={{ color: 'var(--st-ink)' }}>{t('Zeven hoofdstukken, één pad')}</h2>
            <p className="story-kaku mt-1 text-sm" style={{ color: 'var(--st-ink-faint)' }}>{t('Van de wortels tot twee locaties, één club')}</p>
          </div>
        </div>
        <div className="mt-4 h-px w-24" style={{ background: 'linear-gradient(90deg, var(--st-gold), transparent)' }} />

        <div className="relative mt-12 lg:grid lg:grid-cols-[64px_1fr] lg:gap-10">
          {/* sticky kana-rail (desktop) */}
          <nav className="sticky top-24 hidden h-max flex-col items-center gap-5 lg:flex" aria-label={t('Hoofdstukken')}>
            {chapters.map((ch, i) => (
              <span key={i}
                className={cn('story-mincho flex h-11 w-11 items-center justify-center rounded-full border text-lg transition-all duration-500', i === active ? 'scale-110' : 'opacity-35')}
                style={{
                  borderColor: i === active ? 'var(--st-gold)' : 'var(--st-hairline)',
                  color: i === active ? 'var(--st-gold)' : 'var(--st-ink-faint)',
                  boxShadow: i === active ? '0 0 24px var(--st-glow)' : 'none',
                }}
              >
                {ch.number}
              </span>
            ))}
          </nav>

          <div className="story-spine space-y-16 sm:space-y-24">
            <span className="story-spine-line" aria-hidden />
            {chapters.map((ch, i) => (
              <Chapter key={i} index={i} data={ch} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ EERBETUIGINGEN ══════════════════ */}
      <section className="relative mx-auto mt-28 max-w-5xl px-5 sm:px-8">
        <div className="story-reveal text-center">
          <h2 className="story-mincho text-3xl font-black sm:text-4xl" style={{ color: 'var(--st-ink)' }}>{t('Eerbetuigingen')}</h2>
          <p className="story-kaku mx-auto mt-2 max-w-lg text-sm" style={{ color: 'var(--st-ink-soft)' }}>
            {t('De meester die de zachte weg naar het westen bracht — en de mensen die hier hun wortels sloegen.')}
          </p>
        </div>
        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <TributeCard
            kanji="道"
            label={t('Eerbewijs aan de meester')}
            title="Haku Michigami"
            sub={t('1912–2002 · de zachte weg naar het westen')}
            body={t('Hij bracht judo naar het westen: dertien jaar in Nederland, technisch adviseur van de bond en vormgever van grootse judoka’s — waaronder Anton Geesink. Zijn traditie is de ziel die hier in Steenbergen haar naam draagt.')}
          />
          <TributeCard
            kanji="八"
            stamp="段"
            label={t('Eerbewijs aan de oprichter')}
            title="Koos van Wezel"
            sub="八段 · 8e Dan"
            body={t('Meester in grondwerk, internationaal gerenommeerd scheidsrechter en hoofdscheidsrechter bij de CJJF. Hij groeide veel judoka’s groot en nam ze mee naar legio nationale en internationale toernooien — streng als het nodig was, maar vooral met de zachte hand.')}
          />
          <TributeCard
            kanji="絆"
            stamp="段"
            label={t('Eerbewijs aan een vast gezicht')}
            title="Franco Hack"
            sub="1966–2026 · 4e Dan"
            body={t('Vader van Robin en Pascal, schoonzoon van Koos. Hij droeg de vlam van de club door het vuur — een judoka voor het leven.')}
            photoUrl="/images/minuut-stilte-franco.jpg"
            photoCaption={t('1 april 2026 · minuut stilte voor Franco, De Vossenkuil Oud-Vossemeer')}
          />
        </div>
      </section>

      {/* ══════════════════ DE MEESTERS ══════════════════ */}
      <section className="relative mx-auto mt-28 max-w-5xl px-5 sm:px-8">
        <div className="story-reveal text-center">
          <h2 className="story-mincho text-3xl font-black sm:text-4xl" style={{ color: 'var(--st-ink)' }}>{t('De Meesters')}</h2>
          <p className="story-kaku mx-auto mt-2 max-w-lg text-sm" style={{ color: 'var(--st-ink-soft)' }}>
            {t('De mannen en de vrouw die het pad nu verder dragen — samen met de geest van Koos en Franco.')}
          </p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {masters.map((m, i) => (
            <MasterCard key={i} index={i} name={m.name} dan={m.dan} danLabel={m.danLabel} role={m.role} />
          ))}
        </div>
      </section>

      {/* ══════════════════ DE ZACHT WEG ══════════════════ */}
      <section className="relative mx-auto mt-28 max-w-5xl px-5 sm:px-8">
        <div className="story-reveal relative text-center">
          <span className="story-year-ghost pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[34vw] sm:text-[22vw]" aria-hidden>道</span>
          <h2 className="story-mincho relative text-3xl font-black sm:text-4xl" style={{ color: 'var(--st-ink)' }}>{t('De Zachte Weg')}</h2>
          <p className="story-kaku relative mx-auto mt-3 max-w-xl text-base font-light leading-relaxed" style={{ color: 'var(--st-ink-soft)' }}>
            {t('柔 (ju) — de zachte kracht · 道 (dō) — de weg. Judo is meer dan vallen en opstaan: het is een filosofie van bescheidenheid, oprecht contact en het beste uit jezelf én je tegenstander halen.')}
          </p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {principles.map((p, i) => (
            <div key={i} className="story-reveal story-card p-6">
              <div className="flex items-center gap-4">
                <Stamp className={i === 0 ? '!bg-[var(--st-red)]' : ''}>{p.kanji}</Stamp>
                <div>
                  <div className="story-mincho text-lg font-bold" style={{ color: 'var(--st-ink)' }}>{p.name}</div>
                  <div className="story-kaku text-[11px] uppercase tracking-[0.15em]" style={{ color: 'var(--st-gold)' }}>{p.sub}</div>
                </div>
              </div>
              <p className="story-kaku mt-4 text-sm font-light leading-relaxed" style={{ color: 'var(--st-ink-soft)' }}>{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════ EPILOOG — de gouden maan ══════════════════ */}
      <section className="relative mt-28 flex min-h-[78vh] flex-col items-center justify-center overflow-hidden px-5 py-28 text-center sm:px-8">
        <div className="story-disc story-disc-gold" aria-hidden />

        <div className="relative z-10 max-w-xl">
          <div className="story-reveal relative mx-auto w-fit">
            <Stamp className="!h-20 !w-20 !rotate-[-4deg] !text-4xl">道</Stamp>
          </div>
          <h2 className="story-reveal story-mincho story-title-glow mt-6 text-3xl font-black sm:text-5xl" style={{ color: 'var(--st-ink)' }}>
            {t('Het verhaal gaat')} <span className="story-accent" style={{ color: 'var(--st-red)' }}>{t('verder')}</span>
          </h2>
          <p className="story-reveal story-kaku mx-auto mt-6 max-w-lg text-base font-light leading-relaxed sm:text-lg" style={{ color: 'var(--st-ink-soft)' }}>
            {t('De volgende hoofdstukken worden hier geschreven, op de matten in Steenbergen en Oud-Vossemeer. Wil je erbij horen?')}
          </p>
          <div className="story-reveal mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button onClick={() => onNavigate?.('leden')} className="story-sheen px-7 py-3 text-white" style={{ background: 'linear-gradient(135deg, #c1100c, var(--shu-600))', boxShadow: '0 14px 36px -12px rgba(169,0,0,0.6)' }}>
              {t('Boek een proefles')}
            </Button>
            <Button onClick={() => (signupOpen ? onNavigate?.('leden') : setSignupOpen(true))}
              variant="outline" className="story-outline backdrop-blur-sm">
              <Award className="mr-2 h-4 w-4" />
              {t('Lid worden')}
            </Button>
          </div>

          {signupOpen && (
            <div className="story-card relative mt-8 rounded-xl p-6 text-left">
              <p className="story-kaku text-sm font-light leading-relaxed" style={{ color: 'var(--st-ink-soft)' }}>
                {t('Inschrijven doe je via ons clubformulier — we nemen daarna persoonlijk contact met je op.')}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button onClick={() => onNavigate?.('leden')} className="text-white" style={{ background: 'var(--shu-600)' }}>
                  {t('Ga naar Lid worden')}
                </Button>
                <Button onClick={() => onNavigate?.('contact')} variant="outline" className="story-outline">
                  <ChevronRight className="mr-2 h-4 w-4" />
                  {t('Contact')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

/* --- Hoofdstuk: genummerde rol met stempel en spook-jaar ------------------- */
function Chapter({ index, data }: { index: number; data: (typeof storyChapters)[number] }) {
  const { t } = useT();
  const [photoOpen, setPhotoOpen] = useState(false);
  const flip = index % 2 === 1;
  const yearMatch = data.era.match(/\d{4}/);
  const ghost = yearMatch ? yearMatch[0] : data.kanji;

  return (
    <article data-chapter className="story-reveal relative">
      {/* spook-jaar */}
      <span
        className={cn('story-year-ghost pointer-events-none absolute -top-16 z-0 text-[24vw] sm:text-[12vw]', flip ? '-right-2' : '-left-2')}
        aria-hidden
      >
        {ghost}
      </span>

      <div className={cn('relative z-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5', flip && 'sm:flex-row-reverse')}>
        <div className="flex flex-row items-center gap-3 pt-1 sm:flex-col sm:items-center">
          <Stamp>{data.number}</Stamp>
          <span className="story-vtext story-mincho hidden text-3xl sm:block" style={{ color: 'var(--st-ghost)' }} aria-hidden>
            {data.kanji}
          </span>
        </div>

        <div className="story-card min-w-0 flex-1 p-6 sm:p-8">
          <div className="story-kaku text-[11px] uppercase tracking-[0.28em]" style={{ color: 'var(--st-gold)' }}>{data.era}</div>
          <h3 className="story-mincho mt-2 text-2xl font-black sm:text-3xl" style={{ color: 'var(--st-ink)' }}>
            {data.title}
            <span className="story-mincho ml-3 text-xl sm:text-2xl" style={{ color: 'var(--st-ink-faint)' }}>{data.kanji}</span>
          </h3>
          <div className="mt-4 space-y-4">
            {data.paragraphs.map((p, i) => (
              <p key={i} className="story-kaku text-[15px] font-light leading-[1.85] sm:text-base" style={{ color: 'var(--st-ink-soft)' }}>
                {p}
              </p>
            ))}
          </div>

          {data.photoUrl && (
            <figure className="mt-6">
              <button
                type="button"
                onClick={() => setPhotoOpen(true)}
                className="story-photo block w-full"
                aria-label={data.photoCaption ? `${t('Grootbeeld')}: ${data.photoCaption}` : t('Grootbeeld openen')}
              >
                <div className={cn('relative w-full', data.photoAspect ?? 'aspect-[16/10]')}>
                  <Image
                    src={data.photoUrl}
                    alt={data.photoCaption ?? data.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 760px"
                    className="object-cover"
                  />
                </div>
              </button>
              {data.photoCaption && (
                <figcaption className="story-kaku mt-2 text-center text-xs" style={{ color: 'var(--st-ink-faint)' }}>{data.photoCaption}</figcaption>
              )}
              {photoOpen && (
                <ImageLightbox images={[data.photoUrl]} initialIndex={0} onClose={() => setPhotoOpen(false)} />
              )}
            </figure>
          )}
        </div>
      </div>
    </article>
  );
}

/* --- Eerbewijs-kaart ------------------------------------------------------- */
function TributeCard({ kanji, stamp, label, title, sub, body, photoUrl, photoCaption }: {
  kanji: string; stamp?: string; label: string; title: string; sub: string; body: string;
  photoUrl?: string; photoCaption?: string;
}) {
  const [photoOpen, setPhotoOpen] = useState(false);
  return (
    <div className={cn('story-reveal story-card relative overflow-hidden p-7 sm:p-8', photoUrl && 'lg:col-span-2')}>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <div className="relative shrink-0">
          <Stamp>{kanji}</Stamp>
          {stamp && (
            <span className="story-mincho absolute -bottom-2 -right-2 flex h-8 w-8 rotate-[-8deg] items-center justify-center rounded-sm text-xs text-white shadow-lg"
              style={{ background: 'var(--shu-600)' }}>
              {stamp}
            </span>
          )}
        </div>
        <div className="min-w-0">
          <div className="story-kaku text-[11px] uppercase tracking-[0.3em]" style={{ color: 'var(--st-gold)' }}>{label}</div>
          <h3 className="story-mincho mt-2 text-2xl font-black" style={{ color: 'var(--st-ink)' }}>{title}</h3>
          <div className="story-mincho mt-1 text-base" style={{ color: 'var(--st-red)' }}>{sub}</div>
          <p className="story-kaku mt-4 text-sm font-light leading-[1.8]" style={{ color: 'var(--st-ink-soft)' }}>{body}</p>
        </div>
      </div>

      {photoUrl && (
        <figure className="mt-6">
          <button type="button" onClick={() => setPhotoOpen(true)} className="story-photo block w-full"
            aria-label={photoCaption ? `Grootbeeld: ${photoCaption}` : 'Grootbeeld'}>
            <div className="relative aspect-[16/6] w-full">
              <Image src={photoUrl} alt={photoCaption ?? title} fill sizes="(max-width: 640px) 100vw, 900px" className="object-cover" />
            </div>
          </button>
          {photoCaption && (
            <figcaption className="story-kaku mt-2 text-center text-xs" style={{ color: 'var(--st-ink-faint)' }}>{photoCaption}</figcaption>
          )}
          {photoOpen && <ImageLightbox images={[photoUrl]} initialIndex={0} onClose={() => setPhotoOpen(false)} />}
        </figure>
      )}
    </div>
  );
}

/* --- Meester-kaart --------------------------------------------------------- */
function MasterCard({ index, name, dan, danLabel, role }: {
  index: number; name: string; dan: string; danLabel: string; role: string;
}) {
  return (
    <div className="story-reveal story-card relative overflow-hidden p-6">
      <span className="story-mincho absolute right-4 top-2 text-5xl" style={{ color: 'var(--st-ghost)' }} aria-hidden>{dan}</span>
      <div className="relative">
        <div className="story-kaku text-[11px] uppercase tracking-[0.22em]" style={{ color: 'var(--st-gold)' }}>{danLabel}</div>
        <h3 className="story-mincho mt-1 text-xl font-black" style={{ color: 'var(--st-ink)' }}>{name}</h3>
        <p className="story-kaku mt-1 text-sm font-light" style={{ color: 'var(--st-ink-faint)' }}>{role}</p>
      </div>
    </div>
  );
}