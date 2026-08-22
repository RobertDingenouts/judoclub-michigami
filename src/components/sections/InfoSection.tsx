'use client';

import { useRef, useState, useEffect, Fragment } from 'react';
import Image from 'next/image';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronRight, ScrollText, Award } from 'lucide-react';
import { ImageLightbox } from '@/components/ui/ImageLightbox';
import { cn } from '@/lib/utils';
import { storyChapters } from '@/data/story-chapters';
import {
  SumiLandscape, SakuraPetals, InkBleeds, WatermarkKanji, VoxelGrid,
} from '@/components/sections/ZenScenery';
import { useZenProgress } from '@/lib/zen-scroll';
import type { Section } from '@/components/nav-config';

/* Kleuren op zacht oud-creme papier: donkere sumi-inkt in plaats van washi-licht */
const INK = 'text-[var(--sumi-900)]';
const INK_SOFT = 'text-[var(--sumi-700)]';
const INK_FAINT = 'text-[var(--sumi-500)]';
const SHU = 'text-[var(--shu-600)] shu-glow';
const KIN = 'text-[var(--kin-600)] kin-glow';

/* --- Een blok dat zijn tekst "schrijft" wanneer het in beeld komt --------- */
function InkReveal({ children, className = '', as: Tag = 'div', delay = 0 }: {
  children: React.ReactNode; className?: string; as?: 'div' | 'p' | 'span' | 'h2'; delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <Tag ref={ref as never}
      className={cn(className, inView ? 'ink-write ink-write-run' : 'ink-write')}
      style={{ animationDelay: `${delay}s` }}>
      {children}
    </Tag>
  );
}

/* --- Letter voor letter "geschreven" (logica uit "Een sprookje van 10 jaar")
   Woorden blijven bij elkaar (inline-block), elke letter fade-in met een
   oplopende delay. Pas als het blok in beeld scrolt start het schrijven —
   layout blijft stabiel, letters bestaan al (alleen de opacity verandert). */
function InkType({ text, className = '', as: Tag = 'p', speed = 30, delay = 0 }: {
  text: string; className?: string; as?: 'p' | 'div' | 'span'; speed?: number; delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const words = text.split(' ');
  const baseMs = delay * 1000;
  let letterIndex = 0;
  return (
    <Tag ref={ref as never} className={cn('ink-type', className, inView && 'ink-type-run')}>
      {words.map((word, wi) => (
        <Fragment key={wi}>
          <span className="ink-word">
            {Array.from(word).map((ch, ci) => {
              const d = baseMs + letterIndex++ * speed;
              return (
                <span key={ci} className="ink-letter" style={{ animationDelay: `${d}ms` }}>
                  {ch}
                </span>
              );
            })}
          </span>
          {wi < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </Tag>
  );
}

/* --- Optellend cijfer: telt van 0 naar target zodra het in beeld komt ----- */
function CountUp({ value, suffix = '', className = '', delay = 0 }: {
  value: number; suffix?: string; className?: string; delay?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const dur = 1600;
    const start = performance.now() + delay * 1000;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, Math.max(0, (t - start) / dur));
      // easeOutExpo — snel begin, zacht landen
      const e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      setN(Math.round(e * value));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, delay]);
  return (
    <span ref={ref} className={cn('stat-ink', className)}>
      {n}{suffix}
    </span>
  );
}

export function InfoSection({ onNavigate }: { onNavigate?: (s: Section) => void }) {
  const [signupOpen, setSignupOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const spineRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: rootRef,
    offset: ['start start', 'end start'],
  });
  const prologY = useTransform(scrollYProgress, [0, 1], ['0%', '38%']);

  // Hoofdstukken-ruglijn trekt zich mee met het scrollen (eigen hook — de
  // sectie scrolt binnen de ScrollArea-viewport, niet via het venster)
  const spineP = useZenProgress(spineRef, 0.75, 0.6);
  const spineHeight = `${Math.round(spineP * 10000) / 100}%`;
  // Inkt-druppel reist met de punt van de lijn mee
  const dropTop = spineHeight;

  const masters = [
    { name: 'Robin Hack', dan: '三', danLabel: '3e Dan', role: 'Trainer & penningmeester' },
    { name: 'Pascal Hack', dan: '三', danLabel: '3e Dan', role: 'Trainer & voorzitter' },
    { name: 'Robert Dingenouts', dan: '三', danLabel: '3e Dan', role: 'Trainer & secretaris' },
    { name: 'Wendy Jansen', dan: '一', danLabel: '1e Dan', role: 'Trainer & EHBO\u2019er' },
  ];

  const principles = [
    {
      kanji: '力',
      name: 'Seiryoku Zen\u2019yō',
      sub: 'Macht — zuinig besteed',
      body: 'Kracht is een middelpunt, geen doel. Judo leert je je kracht zo in te zetten dat er het minste nodig is voor het beste resultaat.',
    },
    {
      kanji: '和',
      name: 'Jita Kyōei',
      sub: 'Gemeenschappelijk welzijn',
      body: 'Zelf en de ander op één lijn. De zachte weg draait om wederzijds voordeel — winnen zonder de ander te verwonden.',
    },
  ];

  return (
    <div ref={rootRef} className="ink-paper zen-fullbleed relative overflow-hidden">
      {/* Lichte structuur die rustig beweegt achter het papier */}
      <VoxelGrid count={48} className="opacity-70" tone="light" />
      <SakuraPetals count={16} />
      <InkBleeds tone="light" />

      {/* ============================ PROLOOG ============================= */}
      <div className="relative flex min-h-[92vh] flex-col items-center justify-center px-5 py-24 text-center sm:px-8">
        <SumiLandscape className="opacity-90" tone="light" />
        <motion.div
          style={{
            y: prologY,
            background: 'radial-gradient(ellipse 72% 62% at 50% 46%, rgba(248,241,229,0.88) 0%, rgba(248,241,229,0.55) 48%, rgba(248,241,229,0) 74%)',
            WebkitMaskImage: 'radial-gradient(ellipse 82% 74% at 50% 46%, black 62%, transparent 86%)',
            maskImage: 'radial-gradient(ellipse 82% 74% at 50% 46%, black 62%, transparent 86%)',
          }}
          className="relative z-10 max-w-2xl rounded-[28px] px-2 py-8 sm:px-10"
          // zachte papier-scrim: houdt de gecentreerde tekst leesbaar boven
          // de drukke inktscène, vervaagt naar buiten (scene blijft zichtbaar)
        >
          <InkReveal as="p" className={cn('text-xs font-semibold uppercase tracking-[0.35em]', KIN)}>
            Est. 1993 · Steenbergen
          </InkReveal>
          <InkReveal delay={0.2} className="relative mt-6">
            <WatermarkKanji char="柔" className="-inset-x-24 -top-28" size={360} tone="light" />
            <h1 className={cn(
              'ink-title relative font-display text-4xl leading-[1.08] sm:text-6xl',
              INK,
            )}>
              Al dertig jaar<br />
              <span className={SHU}>bloeit judo hier</span>
            </h1>
          </InkReveal>
          <InkType delay={0.4} text={
            'Michigami groeide uit tot een van de grootste judoclubs van de regio — een bloeiende club die altijd doorging, door de gouden jaren en de stillere tijden. Meer dan dertig jaar later bloeit het judo hier nog steeds. Dit is het verhaal van een pad dat hier nooit gestopt heeft.'
          } as="p" className={cn(
            'mx-auto mt-7 max-w-xl font-serif text-lg leading-relaxed sm:text-xl',
            INK_SOFT,
          )} />

          <div className={cn('mx-auto mt-10 grid max-w-lg grid-cols-3 divide-x', 'divide-[var(--sumi-500)]/25')}>
            {[
              { n: 1993, l: 'opgericht', raw: true },
              { n: 2, l: 'locaties' },
              { n: 8, l: 'dan oprichter', suffix: 'e' },
            ].map((s, i) => (
              <InkReveal key={i} delay={0.5 + i * 0.12} className="px-3">
                <div className={cn('font-display text-3xl sm:text-4xl', i === 2 ? SHU : INK)}>
                  {s.raw ? (
                    <>19<CountUp value={93} delay={0.5 + i * 0.12} /></>
                  ) : (
                    <CountUp value={s.n} suffix={s.suffix ?? ''} delay={0.5 + i * 0.12} />
                  )}
                </div>
                <div className={cn('mt-1 text-[11px] uppercase tracking-[0.2em]', INK_FAINT)}>{s.l}</div>
              </InkReveal>
            ))}
          </div>

          <InkReveal delay={0.65} className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button onClick={() => onNavigate?.('leden')}
              className="bg-[var(--shu-600)] px-7 py-3 text-[var(--washi-50)] hover:bg-[var(--shu-700)]">
              Boek een proefles
            </Button>
            <Button onClick={() => onNavigate?.('timeline')}
              variant="outline"
              className="border-[var(--sumi-700)]/40 bg-transparent text-[var(--sumi-800)] hover:bg-[var(--sumi-900)]/5 hover:text-[var(--sumi-900)]">
              <ScrollText className="mr-2 h-4 w-4" />
              Bekijk de volledige tijdlijn
            </Button>
          </InkReveal>
        </motion.div>
      </div>

      {/* ====================== HOOFDSTUKKEN (verhaal) ===================== */}
      <div className="relative">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <InkReveal className="flex items-end gap-4">
            <span className={cn('font-jp text-6xl leading-none sm:text-7xl', 'text-[var(--shu-600)]/70')} aria-hidden>語</span>
            <div>
              <h2 className={cn('ink-title font-display text-3xl sm:text-4xl', INK)}>Zeven hoofdstukken, één pad</h2>
              <p className={cn('mt-1 text-sm', INK_FAINT)}>Van de wortels tot twee locaties, één club</p>
            </div>
          </InkReveal>
          <div className="mt-4 h-px w-24 origin-left bg-[var(--shu-600)]/50 brush-stroke" />

          {/* Ruglijn die zich trekt + reizende inkt-druppel */}
          <div ref={spineRef} className="relative mt-14 space-y-16">
            <div className="absolute left-2 top-2 h-full w-px bg-gradient-to-b from-[var(--sumi-500)]/40 via-[var(--shu-600)]/50 to-[var(--kin-500)]/60 sm:left-3" />
            <motion.div
              style={{ height: spineHeight }}
              className="absolute left-2 top-2 w-px origin-top bg-[var(--shu-600)] shadow-[0_0_10px_rgba(192,0,0,0.3)] sm:left-3"
            />
            <motion.div
              style={{ top: dropTop }}
              className="spine-drop absolute -left-[5px] z-10 sm:left-[7px]"
            />
            {storyChapters.map((ch, i) => (
              <Chapter key={i} index={i} data={ch} />
            ))}
          </div>
        </div>
      </div>

      {/* ===================== TWEEN OERBETUIGINGEN ======================== */}
      <div className="relative mt-24">
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <InkReveal className="text-center">
            <h2 className={cn('ink-title font-display text-3xl sm:text-4xl', INK)}>Eerbetuigingen</h2>
            <p className={cn('mx-auto mt-2 max-w-lg text-sm', INK_SOFT)}>
              De meester die de zachte weg naar het westen bracht — en de mensen die hier hun
              wortels sloegen.
            </p>
          </InkReveal>
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <TributeCard
              kanji="道"
              label="Eerbewijs aan de meester"
              title="Haku Michigami"
              sub="1912–2002 · de zachte weg naar het westen"
              body="Hij bracht judo naar het westen: dertien jaar in Nederland, technisch adviseur van de bond en vormgever van grootse judoka’s — waaronder Anton Geesink. Zijn traditie is de ziel die hier in Steenbergen haar naam draagt."
            />
            <TributeCard
              kanji="八"
              stamp="段"
              label="Eerbewijs aan de oprichter"
              title="Koos van Wezel"
              sub="八段 · 8e Dan"
              body="Meester in grondwerk, internationaal gerenommeerd scheidsrechter en hoofdscheidsrechter bij de CJJF. Hij groeide veel judoka’s groot en nam ze mee naar legio nationale en internationale toernooien — streng als het nodig was, maar vooral met de zachte hand."
            />
            <TributeCard
              kanji="絆"
              stamp="段"
              label="Eerbewijs aan een vast gezicht"
              title="Franco Hack"
              sub="1966–2026 · 4e Dan"
              body="Vader van Robin en Pascal, schoonzoon van Koos. Hij droeg de vlam van de club door het vuur — een judoka voor het leven."
              photoUrl="/images/minuut-stilte-franco.jpg"
              photoCaption="1 april 2026 · minuut stilte voor Franco, De Vossenkuil Oud-Vossemeer"
            />
          </div>
        </div>
      </div>

      {/* =========================== DE MEESTERS ========================== */}
      <div className="relative mt-24">
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <InkReveal className="text-center">
            <h2 className={cn('ink-title font-display text-3xl sm:text-4xl', INK)}>De Meesters</h2>
            <p className={cn('mx-auto mt-2 max-w-lg text-sm', INK_SOFT)}>
              De mannen en de vrouw die het pad nu verder dragen — samen met de geest van Koos en Franco.
            </p>
          </InkReveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {masters.map((m, i) => (
              <MasterCard key={i} index={i} name={m.name} dan={m.dan} danLabel={m.danLabel} role={m.role} />
            ))}
          </div>
        </div>
      </div>

      {/* =========================== DE ZACHT WEG ========================= */}
      <div className="relative mt-24">
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <InkReveal className="text-center">
            <WatermarkKanji char="道" className="-inset-x-16 -top-10" size={260} tone="light" />
            <h2 className={cn('ink-title relative font-display text-3xl sm:text-4xl', INK)}>De Zachte Weg</h2>
            <p className="relative mx-auto mt-3 max-w-xl font-serif leading-relaxed">
              <InkType text="柔 (ju) — de zachte kracht · 道 (dō) — de weg. Judo is meer dan vallen en opstaan: het is een filosofie van bescheidenheid, oprecht contact en het beste uit jezelf én je tegenstander halen." className={cn('font-serif text-base leading-relaxed', INK_SOFT)} />
            </p>
          </InkReveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {principles.map((p, i) => (
              <InkReveal key={i} delay={i * 0.12} className="ink-card ink-write-run rounded-xl p-6">
                <div className="flex items-center gap-4">
                  <span className={cn('font-jp text-4xl', SHU)}>{p.kanji}</span>
                  <div>
                    <div className={cn('font-display text-lg', INK)}>{p.name}</div>
                    <div className={cn('text-xs uppercase tracking-[0.15em]', KIN)}>{p.sub}</div>
                  </div>
                </div>
                <p className={cn('mt-4 font-serif text-sm leading-relaxed', INK_SOFT)}>{p.body}</p>
              </InkReveal>
            ))}
          </div>
        </div>
      </div>

      {/* ============================ EPILOOG ============================= */}
      <div className="relative mt-24 flex min-h-[70vh] flex-col items-center justify-center px-5 py-24 text-center sm:px-8">
        <SumiLandscape className="opacity-85" tone="light" />
        <div
          style={{
            background: 'radial-gradient(ellipse 74% 64% at 50% 46%, rgba(248,241,229,0.85) 0%, rgba(248,241,229,0.5) 48%, rgba(248,241,229,0) 74%)',
            WebkitMaskImage: 'radial-gradient(ellipse 84% 76% at 50% 46%, black 62%, transparent 86%)',
            maskImage: 'radial-gradient(ellipse 84% 76% at 50% 46%, black 62%, transparent 86%)',
          }}
          className="relative z-10 max-w-xl rounded-[24px] px-2 py-8 sm:px-10"
        >
          <InkReveal className="relative">
            <WatermarkKanji char="今" className="-inset-x-16 -top-12" size={300} tone="light" />
            <h2 className={cn('ink-title relative font-display text-3xl sm:text-5xl', INK)}>
              Het verhaal gaat <span className={SHU}>verder</span>
            </h2>
          </InkReveal>
          <InkType text="De volgende hoofdstukken worden hier geschreven, op de matten in Steenbergen en Oud-Vossemeer. Wil je erbij horen?" as="p" className={cn(
            'mx-auto mt-6 max-w-lg font-serif text-lg leading-relaxed',
            INK_SOFT,
          )} />
          <InkReveal delay={0.35} className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button onClick={() => onNavigate?.('leden')}
              className="bg-[var(--shu-600)] px-7 py-3 text-[var(--washi-50)] hover:bg-[var(--shu-700)]">
              Boek een proefles
            </Button>
            <Button onClick={() => (signupOpen ? onNavigate?.('leden') : setSignupOpen(true))}
              variant="outline"
              className="border-[var(--sumi-700)]/40 text-[var(--sumi-800)] hover:bg-[var(--sumi-900)]/5">
              <Award className="mr-2 h-4 w-4" />
              Lid worden
            </Button>
          </InkReveal>

          {/* Eenvoudige, nette overname-CTA als popup-vrij alternatief */}
          {signupOpen && (
            <div className="ink-card ink-write ink-write-run relative mt-8 rounded-xl p-6 text-left">
              <p className={cn('font-serif leading-relaxed', INK_SOFT)}>
                Inschrijven doe je via ons clubformulier — we nemen daarna persoonlijk contact met je op.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button onClick={() => onNavigate?.('leden')} className="bg-[var(--shu-600)] text-[var(--washi-50)] hover:bg-[var(--shu-700)]">
                  Ga naar Lid worden
                </Button>
                <Button onClick={() => onNavigate?.('contact')} variant="outline"
                  className="border-[var(--sumi-700)]/40 bg-transparent text-[var(--sumi-800)] hover:bg-[var(--sumi-900)]/5">
                  <ChevronRight className="mr-2 h-4 w-4" />
                  Contact
                </Button>
              </div>
            </div>
          )}

          {/* Pagina-pager staat onderaan de sectie (SectionPager) — oude
              '‹ Agenda / Lid worden ›'-knoppen zijn vervangen door die. */}
        </div>
      </div>
    </div>
  );
}

/* --- Een hoofdstuk aan de ruglijn ---------------------------------------- */
function Chapter({ index, data }: { index: number; data: (typeof storyChapters)[number] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [photoOpen, setPhotoOpen] = useState(false);
  const inView = useInView(ref, { once: true, margin: '-120px' });
  // Foto-parallax via eigen hook (ScrollArea-viewport, niet window)
  const paraP = useZenProgress(ref, 1.05, -0.05);
  const photoY = `${(paraP * 12 - 6).toFixed(2)}%`; // −6% → +6%
  return (
    <div ref={ref} className="relative pl-10 sm:pl-14">
      {/* Knot op de ruglijn */}
      <div className={cn(
        'div absolute left-0 top-1 flex h-9 w-9 items-center justify-center rounded-full border border-[var(--kin-500)]/50 bg-[var(--washi-50)]/90 text-[var(--kin-600)] shadow-sm sm:left-1',
        inView ? 'animate-hankoStamp' : 'opacity-0',
        index % 2 === 0 ? 'border-[var(--shu-600)]/50' : 'border-[var(--kin-500)]/60',
      )}>
        <span className={cn('font-jp text-lg', index % 2 === 0 ? SHU : KIN)}>{data.number}</span>
      </div>

      <div className="flex items-start gap-4">
        <span className={cn('shrink-0 font-jp text-5xl leading-none sm:text-6xl', 'text-[var(--sumi-700)]/15')} aria-hidden>
          {data.kanji}
        </span>
        <div className="min-w-0 flex-1">
          <div className={cn('text-[11px] uppercase tracking-[0.25em]', KIN)}>{data.era}</div>
          <h3 className={cn('ink-title mt-1 font-display text-2xl sm:text-3xl', INK)}>{data.title}</h3>
          <div className="mt-3 space-y-3">
            {data.paragraphs.map((p, i) => (
              <InkType key={i} text={p} as="p" className={cn('font-serif leading-relaxed', INK_SOFT)} />
            ))}
          </div>

          {/* Foto van het hoofdstuk — klikbaar voor grootbeeld */}
          {data.photoUrl && (
            <figure className="mt-5">
              <button
                type="button"
                onClick={() => setPhotoOpen(true)}
                className="group relative block w-full overflow-hidden rounded-lg border border-[var(--sumi-700)]/20 shadow-[0_10px_30px_-18px_rgba(42,33,28,0.7)]"
                aria-label={data.photoCaption ? `Grootbeeld: ${data.photoCaption}` : 'Grootbeeld openen'}
              >
                <div className={cn('parallax-frame relative w-full', data.photoAspect ?? 'aspect-[16/10]')}>
                  <motion.div style={{ y: photoY }} className="absolute inset-[-8%]">
                    <Image
                      src={data.photoUrl}
                      alt={data.photoCaption ?? data.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 700px"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                  </motion.div>
                </div>
              </button>
              {data.photoCaption && (
                <figcaption className="mt-2 text-center text-xs text-[var(--sumi-500)]">{data.photoCaption}</figcaption>
              )}
              {photoOpen && (
                <ImageLightbox
                  images={[data.photoUrl]}
                  initialIndex={0}
                  onClose={() => setPhotoOpen(false)}
                />
              )}
            </figure>
          )}
        </div>
      </div>
    </div>
  );
}

/* --- Eerbewijz-kaart ------------------------------------------------------ */
function TributeCard({ kanji, stamp, label, title, sub, body, photoUrl, photoCaption }: {
  kanji: string; stamp?: string; label: string; title: string; sub: string; body: string;
  photoUrl?: string; photoCaption?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [photoOpen, setPhotoOpen] = useState(false);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  return (
    <div ref={ref}
      className={cn('ink-card ink-write relative overflow-hidden rounded-xl p-7 sm:p-8', inView && 'ink-write-run')}>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <div className="relative shrink-0">
          <div className="flex h-20 w-20 items-center justify-center rounded-lg border border-[var(--shu-600)]/40 bg-[var(--shu-600)]/5">
            <span className={cn('font-jp text-4xl', SHU)}>{kanji}</span>
          </div>
          {stamp && (
            <span className="animate-hankoStamp absolute -right-2 -bottom-2 flex h-9 w-9 rotate-[-8deg] items-center justify-center rounded-sm bg-[var(--shu-600)] font-jp text-xs text-[var(--washi-50)] shadow-lg">
              {stamp}
            </span>
          )}
        </div>
        <div className="min-w-0">
          <div className={cn('text-xs uppercase tracking-[0.3em]', KIN)}>{label}</div>
          <h3 className={cn('mt-2 font-display text-2xl', INK)}>{title}</h3>
          <div className={cn('mt-1 font-display text-base', SHU)}>{sub}</div>
          <InkType text={body} as="p" className={cn('mt-4 font-serif leading-relaxed', INK_SOFT)} />
        </div>
      </div>

      {photoUrl && (
        <figure className="mt-6">
          <button
            type="button"
            onClick={() => setPhotoOpen(true)}
            className="group relative block w-full overflow-hidden rounded-lg border border-[var(--sumi-700)]/20 shadow-[0_10px_30px_-18px_rgba(42,33,28,0.7)]"
            aria-label={photoCaption ? `Grootbeeld: ${photoCaption}` : 'Grootbeeld'}
          >
            <div className="relative w-full aspect-[16/6]">
              <Image
                src={photoUrl}
                alt={photoCaption ?? title}
                fill
                sizes="(max-width: 640px) 100vw, 900px"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
            </div>
          </button>
          {photoCaption && (
            <figcaption className="mt-2 text-center text-xs text-[var(--sumi-500)]">{photoCaption}</figcaption>
          )}
          {photoOpen && (
            <ImageLightbox
              images={[photoUrl]}
              initialIndex={0}
              onClose={() => setPhotoOpen(false)}
            />
          )}
        </figure>
      )}
    </div>
  );
}

/* --- Meester-kaart: 3D-helling bij muis + hanko-stempel ------------------ */
function MasterCard({ index, name, dan, danLabel, role }: {
  index: number; name: string; dan: string; danLabel: string; role: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  // Rustige tilt: de kaart helt licht naar de muis
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(700px) rotateY(${px * 7}deg) rotateX(${py * -7}deg)`;
  };
  const onLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = '';
  };
  return (
    <div ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={cn('ink-card ink-write tilt-card relative overflow-hidden rounded-xl p-6', inView && 'ink-write-run')}
      style={{ transitionDelay: `${index * 90}ms` }}>
      <span className={cn('absolute right-4 top-3 font-jp text-5xl', 'text-[var(--sumi-700)]/12')} aria-hidden>{dan}</span>
      <span className="tilt-stamp absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-sm bg-[var(--shu-600)] font-jp text-xs text-[var(--washi-50)] shadow-lg">
        道
      </span>
      <div className="relative">
        <div className={cn('text-xs uppercase tracking-[0.2em]', KIN)}>{danLabel}</div>
        <h3 className={cn('mt-1 font-display text-xl', INK)}>{name}</h3>
        <p className={cn('mt-1 text-sm', INK_SOFT)}>{role}</p>
      </div>
    </div>
  );
}

