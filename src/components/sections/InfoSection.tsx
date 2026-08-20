'use client';

import { useRef, useState } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ScrollText, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import { clubInfo } from '@/data/club-info';
import { storyChapters } from '@/data/story-chapters';
import {
  SumiLandscape, SakuraPetals, InkBleeds, WatermarkKanji, VoxelGrid,
} from '@/components/sections/ZenScenery';
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

export function InfoSection({ onNavigate }: { onNavigate?: (s: Section) => void }) {
  const [signupOpen, setSignupOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: rootRef,
    offset: ['start start', 'end start'],
  });
  const prologY = useTransform(scrollYProgress, [0, 1], ['0%', '38%']);

  const masters = [
    { name: 'Robin Hack', dan: '三', danLabel: '3e Dan', role: 'Hoofdtrainer' },
    { name: 'Pascal Hack', dan: '三', danLabel: '3e Dan', role: 'Co-trainer' },
    { name: 'Robert Dingenouts', dan: '三', danLabel: '3e Dan', role: 'Trainer & penningmeester' },
    { name: 'Wendy Jansen', dan: '一', danLabel: '1e Dan', role: 'Trainer' },
  ];

  const principles = [
    {
      kanji: '力',
      name: 'Seiryoku Zen\'yō',
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
          <InkReveal delay={0.4} as="p" className={cn(
            'mx-auto mt-7 max-w-xl font-serif text-lg leading-relaxed sm:text-xl',
            INK_SOFT,
          )}>
            Bij het afscheid van de CJJF was Michigami de grootste club van de
            regio — en nu, meer dan dertig jaar later, bloeit het judo hier
            nog steeds. Dit is het verhaal van een pad dat hier nooit
            gestopt heeft.
          </InkReveal>

          <div className={cn('mx-auto mt-10 grid max-w-lg grid-cols-3 divide-x', 'divide-[var(--sumi-500)]/25')}>
            {[
              { n: '1993', l: 'opgericht' },
              { n: '2', l: 'locaties' },
              { n: '8e', l: 'dan oprichter' },
            ].map((s, i) => (
              <InkReveal key={i} delay={0.5 + i * 0.12} className="px-3">
                <div className={cn('font-display text-3xl sm:text-4xl', i === 2 ? SHU : INK)}>{s.n}</div>
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
              <h2 className={cn('ink-title font-display text-3xl sm:text-4xl', INK)}>Vijf hoofdstukken, één pad</h2>
              <p className={cn('mt-1 text-sm', INK_FAINT)}>Van de wortels tot twee locaties, één club</p>
            </div>
          </InkReveal>
          <div className="mt-4 h-px w-24 origin-left bg-[var(--shu-600)]/50 brush-stroke" />

          {/* Gouden ruglijn die zich trekt */}
          <div className="relative mt-14 space-y-16">
            <div className="absolute left-2 top-2 h-full w-px bg-gradient-to-b from-[var(--sumi-500)]/40 via-[var(--shu-600)]/50 to-[var(--kin-500)]/60 sm:left-3" />
            {storyChapters.map((ch, i) => (
              <Chapter key={i} index={i} data={ch} />
            ))}
          </div>
        </div>
      </div>

      {/* ===================== EERBETUIG AAN OPRICHTER ===================== */}
      <div className="relative mt-24">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <div className="ink-card ink-write ink-write-run relative overflow-hidden rounded-xl p-7 sm:p-10">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <div className="relative shrink-0">
                <div className="flex h-24 w-24 items-center justify-center rounded-lg border border-[var(--shu-600)]/40 bg-[var(--shu-600)]/5">
                  <span className={cn('font-jp text-5xl', SHU)}>八</span>
                </div>
                <span className="animate-hankoStamp absolute -right-2 -bottom-2 flex h-9 w-9 rotate-[-8deg] items-center justify-center rounded-sm bg-[var(--shu-600)] font-jp text-xs text-[var(--washi-50)] shadow-lg">
                  段
                </span>
              </div>
              <div className="min-w-0">
                <div className={cn('text-xs uppercase tracking-[0.3em]', KIN)}>Eerbewijs aan de oprichter</div>
                <h3 className={cn('mt-2 font-display text-3xl', INK)}>Koos van Wezel</h3>
                <div className={cn('mt-1 font-display text-lg', SHU)}>八段 · 8e Dan</div>
                <p className={cn('mt-4 font-serif leading-relaxed', INK_SOFT)}>
                  «Zelfs de zwakste kan vallen — maar alleen een ware judoka
                  kan weer opstaan.» Hij bracht de zachte weg van Haku Michigami
                  naar het westen, en liet er een club na die zijn naam draagt.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================== DE MEESTERS ========================== */}
      <div className="relative mt-24">
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <InkReveal className="text-center">
            <h2 className={cn('ink-title font-display text-3xl sm:text-4xl', INK)}>De Meesters</h2>
            <p className={cn('mx-auto mt-2 max-w-lg text-sm', INK_SOFT)}>
              De mannen en vrouw die het pad nu verder dragen — samen met de geest van Koos.
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
            <p className={cn('relative mx-auto mt-3 max-w-xl font-serif leading-relaxed', INK_SOFT)}>
              <span className="font-jp text-lg text-[var(--shu-600)]">柔</span> (ju) — de zachte kracht ·
              <span className="font-jp text-lg text-[var(--shu-600)]"> 道</span> (dō) — de weg.
              Judo is meer dan vallen en opstaan: het is een filosofie van bescheidenheid,
              oprecht contact en het beste uit jezelf én je tegenstander halen.
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
          <InkReveal delay={0.2} as="p" className={cn('mx-auto mt-6 max-w-lg font-serif text-lg leading-relaxed', INK_SOFT)}>
            De volgende hoofdstukken worden hier geschreven, op de matten in Steenbergen
            en Oud-Vossemeer. Wil je erbij horen?
          </InkReveal>
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

          <div className={cn('mt-14 flex items-center justify-center gap-4 text-sm', INK_FAINT)}>
            <Button onClick={() => onNavigate?.('agenda')} variant="ghost" className="text-[var(--sumi-500)] hover:text-[var(--sumi-900)]">
              <ChevronLeft className="mr-1 h-4 w-4" /> Agenda
            </Button>
            <span className="h-px w-8 bg-[var(--sumi-500)]/40" />
            <Button onClick={() => onNavigate?.('leden')} variant="ghost" className="text-[var(--sumi-500)] hover:text-[var(--sumi-900)]">
              Lid worden <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* --- Een hoofdstuk aan de ruglijn ---------------------------------------- */
function Chapter({ index, data }: { index: number; data: (typeof storyChapters)[number] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-120px' });
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
              <InkReveal key={i} delay={0.1 + i * 0.14} as="p" className={cn('font-serif leading-relaxed', INK_SOFT)}>
                {p}
              </InkReveal>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* --- Meester-kaart -------------------------------------------------------- */
function MasterCard({ index, name, dan, danLabel, role }: {
  index: number; name: string; dan: string; danLabel: string; role: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <div ref={ref}
      className={cn('ink-card ink-write relative overflow-hidden rounded-xl p-6', inView && 'ink-write-run')}
      style={{ transitionDelay: `${index * 90}ms` }}>
      <span className={cn('absolute right-4 top-3 font-jp text-5xl', 'text-[var(--sumi-700)]/12')} aria-hidden>{dan}</span>
      <div className="relative">
        <div className={cn('text-xs uppercase tracking-[0.2em]', KIN)}>{danLabel}</div>
        <h3 className={cn('mt-1 font-display text-xl', INK)}>{name}</h3>
        <p className={cn('mt-1 text-sm', INK_SOFT)}>{role}</p>
      </div>
    </div>
  );
}