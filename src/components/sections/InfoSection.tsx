'use client';

import { useRef, useState } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, MapPin, ArrowRight } from 'lucide-react';
import { type Section } from '@/components/nav-config';
import { clubInfo } from '@/data/club-info';
import { openProeflesForm } from '@/lib/form-events';
import { SignupConfirmationModal } from '@/components/SignupConfirmationModal';

/* ============================================================================
   OVER ONS — "De Zachte Weg"
   Een mysterieuze, verhalende reis door de geschiedenis van Judoclub Michigami.
   After-dark dojo-esthetiek: sumi-duister, washi-licht, shu-rood en kin-goud.
   ==========================================================================*/

const EASE = [0.22, 1, 0.36, 1] as const;

/* --------------------------------- helpers -------------------------------- */

/** Verhaal-hoofdstuk voor de geschiedenis. */
interface Chapter {
  kanji: string;
  reading: string;
  number: string;
  title: string;
  paragraphs: string[];
}

/** De rijke geschiedenis-tekst van club-info, opgesplitst in hoofdstukken. */
function buildChapters(): Chapter[] {
  const raw = clubInfo.history;
  const blocks = raw.split(/\n\n/);
  const chapters: Chapter[] = [];

  const kanjiSet: [string, string][] = [
    ['根', 'ne — wortel'],
    ['光', 'kō — licht'],
    ['継', 'kei — overerving'],
    ['合', 'gō — vereniging'],
    ['今', 'ima — nu'],
  ];

  let current: Chapter | null = null;
  const numberFor = (i: number) => {
    const nums = ['一', '二', '三', '四', '五'];
    return nums[i] ?? String(i + 1);
  };

  for (const block of blocks) {
    const header = block.match(/^##\s+(.+)$/);
    if (header) {
      if (current) chapters.push(current);
      const [kanji, reading] = kanjiSet[chapters.length] ?? ['道', 'dō — weg'];
      current = {
        kanji,
        reading,
        number: numberFor(chapters.length),
        title: header[1].trim(),
        paragraphs: [],
      };
    } else if (current) {
      current.paragraphs.push(block.trim());
    }
  }
  if (current) chapters.push(current);

  // De intro-paragraaf (voor het eerste ##) hangt los — hang hem aan een
  // opening-chapter zodat het verhaal soepel begint.
  const intro = blocks[0];
  const firstHeaderIdx = blocks.findIndex((b) => b.startsWith('##'));
  if (firstHeaderIdx === 1 && intro.trim()) {
    chapters[0].paragraphs.unshift(intro.trim());
  }
  return chapters;
}

const CHAPTERS = buildChapters();

/* ------------------------------- enso teken ------------------------------- */

function Enso({ size = 64, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} aria-hidden>
      <circle
        cx="50" cy="50" r="42"
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        className="enso-draw"
        transform="rotate(-90 50 50)"
      />
    </svg>
  );
}

/* ---------------------------- mist-achtergrond ---------------------------- */

function Mist() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <div
        className="animate-mist absolute -top-1/3 -left-1/4 w-[70%] h-[90%] rounded-full"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(176,141,62,0.10), transparent 65%)',
        }}
      />
      <div
        className="animate-mist absolute -bottom-1/3 -right-1/4 w-[70%] h-[90%] rounded-full"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(169,0,0,0.10), transparent 65%)',
          animationDelay: '-13s',
          animationDuration: '34s',
        }}
      />
    </div>
  );
}

/* --------------------------- scroll-reveal wrapper ------------------------- */

function Reveal({
  children,
  delay = 0,
  className = '',
  as: Tag = 'div',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: 'div' | 'section' | 'article' | 'p';
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 36, filter: 'blur(8px)' }}
      animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
      transition={{ duration: 0.9, delay, ease: EASE }}
      className={className}
    >
      <Tag>{children}</Tag>
    </motion.div>
  );
}

/* ------------------------------ hoofdstuk blok ---------------------------- */

function ChapterBlock({ chapter, index }: { chapter: Chapter; index: number }) {
  return (
    <Reveal delay={0.05}>
      <article className="relative pl-8 sm:pl-14">
        {/* Gouden ruglijn */}
        <div className="absolute left-0 sm:left-4 top-2 bottom-2 w-px bg-gradient-to-b from-[var(--kin-500)] via-[rgba(176,141,62,0.35)] to-transparent" />

        {/* Kanji + nummer */}
        <div className="flex items-baseline gap-4 mb-4">
          <span className="font-mincho text-5xl sm:text-6xl text-[var(--kin-400)] leading-none kanji-float select-none">
            {chapter.kanji}
          </span>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-[var(--kin-300)]/80">
              Hoofdstuk {chapter.number} · {chapter.reading}
            </p>
            <h3 className="font-heading text-xl sm:text-2xl md:text-3xl text-[var(--washi-50)] mt-1 leading-tight">
              {chapter.title}
            </h3>
          </div>
        </div>

        <div className="space-y-4">
          {chapter.paragraphs.map((p, i) => (
            <p
              key={i}
              className="text-[15px] sm:text-base leading-[1.8] text-[#cfc8bb]
                         first-of-type:font-mincho first-of-type:text-lg first-of-type:leading-[1.9]
                         first-of-type:text-[var(--washi-100)] first-of-type:drop-shadow-[0_1px_12px_rgba(0,0,0,0.5)]"
            >
              {p}
            </p>
          ))}
        </div>

        {/* Scheidings-enss voor alle behalve laatste */}
        {index < CHAPTERS.length - 1 && (
          <div className="mt-12 flex items-center gap-3 text-[var(--kin-500)]/60">
            <div className="h-px flex-1 line-gilded opacity-40" />
            <span className="font-mincho text-lg">❖</span>
            <div className="h-px flex-1 line-gilded opacity-40" />
          </div>
        )}
      </article>
    </Reveal>
  );
}

/* ------------------------------- oprichter -------------------------------- */

function FounderMemorial() {
  return (
    <Reveal>
      <section
        className="relative overflow-hidden rounded-xl border border-[rgba(176,141,62,0.25)]
                   bg-gradient-to-b from-[#191512] to-[#100e0b] px-5 py-8 sm:px-10 sm:py-12"
      >
        <Mist />
        {/* Kaarsgloed */}
        <div
          className="animate-flicker absolute left-1/2 top-0 -translate-x-1/2 w-[130%] h-64 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 0%, rgba(244,226,166,0.14), transparent 70%)',
          }}
          aria-hidden
        />
        <div className="relative z-10 text-center">
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.4em] text-[var(--kin-300)]">
            De oprichter · 1947 – 2021
          </p>

          {/* Hanko-stempel */}
          <div className="animate-hankoStamp mt-6 mx-auto w-20 h-20 rounded-md bg-[var(--shu-600)] flex items-center justify-center shadow-[0_8px_30px_rgba(169,0,0,0.45)] ring-1 ring-[rgba(255,255,255,0.15)] rotate-0">
            <span className="font-mincho text-white text-3xl font-bold select-none">光</span>
          </div>

          <h3 className="font-heading text-2xl sm:text-4xl text-[var(--washi-50)] mt-6">
            Koos van Wezel
          </h3>
          <p className="text-gilded font-mincho text-lg sm:text-xl mt-1">八段 · 8e Dan</p>

          <p className="max-w-2xl mx-auto mt-5 text-sm sm:text-[15px] leading-[1.9] text-[#cfc8bb]">
            {clubInfo.leadership.founder.description}
          </p>

          <p className="max-w-xl mx-auto mt-4 font-mincho text-[var(--kin-300)] text-base leading-relaxed italic">
            «Judo is niet bedoeld om in gevechten of op het veld te worden toegepast,
            <br className="hidden sm:block" /> maar om het menselijk karakter te volkomen te vormen.»
          </p>
          <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--sumi-400)] mt-3">
            Jigoro Kano — het pad waarop Koos zijn levenswerk bouwde
          </p>
        </div>
      </section>
    </Reveal>
  );
}

/* -------------------------------- meesters -------------------------------- */

function Masters() {
  const people = clubInfo.leadership.current;
  const danKanji: Record<string, string> = {
    '3e Dan': '三',
    '1e Dan': '一',
  };
  return (
    <section className="relative">
      <Reveal>
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <p className="text-[10px] sm:text-xs uppercase tracking-[0.4em] text-[var(--kin-300)]">
              De huidige meesters
            </p>
            <h3 className="font-heading text-2xl sm:text-3xl text-[var(--washi-50)] mt-1">
              Vieren die één pad bewandelen
            </h3>
          </div>
          <div className="hidden sm:block text-[var(--kin-500)]/50">
            <Enso size={56} />
          </div>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {people.map((person, i) => (
          <Reveal key={person.name} delay={i * 0.08}>
            <article className="group relative h-full overflow-hidden rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#16130f] p-5 sm:p-6 transition-colors duration-500 hover:border-[rgba(176,141,62,0.4)]">
              {/* Ink-wash hover */}
              <div className="ink-wash absolute inset-0" aria-hidden />
              {/* Hanko-seal rechtsboven */}
              <div className="absolute right-4 top-4 w-11 h-11 rounded bg-[var(--shu-600)]/90 flex items-center justify-center ring-1 ring-[rgba(255,255,255,0.12)] group-hover:animate-hankoStamp">
                <span className="font-mincho text-white text-xl font-bold">
                  {danKanji[person.dan] ?? '道'}
                </span>
              </div>

              <div className="relative z-10 pr-14">
                <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--kin-300)]">
                  {person.dan}
                </p>
                <h4 className="font-heading text-lg sm:text-xl text-[var(--washi-50)] mt-1">
                  {person.name}
                </h4>
                <p className="text-xs text-[var(--shu-400)] font-medium mt-0.5 tracking-wide">
                  {person.role}
                </p>
                <p className="text-sm text-[#b9b1a3] leading-relaxed mt-3">
                  {person.description}
                </p>
              </div>
              {/* Gouden onderstreep die groeit bij hover */}
              <div className="absolute bottom-0 left-0 h-0.5 w-full origin-left scale-x-0 bg-gradient-to-r from-[var(--kin-500)] to-[var(--shu-500)] transition-transform duration-700 group-hover:scale-x-100" />
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------ wat is judo ------------------------------- */

function JudoPrinciples() {
  return (
    <section className="relative">
      <Reveal>
        <p className="text-[10px] sm:text-xs uppercase tracking-[0.4em] text-[var(--kin-300)]">
          De kunst · 柔道
        </p>
        <h3 className="font-heading text-2xl sm:text-3xl text-[var(--washi-50)] mt-1">
          De Zachte Weg
        </h3>
        <div className="h-px w-24 line-gilded mt-4" />
      </Reveal>

      <Reveal delay={0.1}>
        <p className="mt-6 max-w-3xl text-[15px] sm:text-base leading-[1.9] text-[#cfc8bb]">
          <span className="font-mincho text-2xl text-[var(--kin-400)] mr-2">柔</span>
          <em className="text-[var(--washi-100)]">ju</em> — zacht — en{' '}
          <span className="font-mincho text-2xl text-[var(--kin-400)] mx-2">道</span>
          <em className="text-[var(--washi-100)]">dō</em> — de weg. Judo is geen strijd tegen
          je tegenstander, maar het gebruik van diens kracht, als water dat de steen omvloeit
          zonder te breken.
        </p>
      </Reveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
        {[
          {
            kanji: '精力善用',
            romaji: 'Seiryoku Zenyō',
            nl: 'Maximale efficiëntie met minimale inspanning',
            text: 'Niet harder duwen dan je tegenstander — slimmer. Open de deur, trap er niet tegenaan.',
          },
          {
            kanji: '相互協力',
            romaji: 'Jita Kyōei',
            nl: 'Wederzijds welzijn en voordeel',
            text: 'Je traint met je partner, niet tegen je partner. Samen worden jullie allebei sterker.',
          },
        ].map((p, i) => (
          <Reveal key={p.romaji} delay={i * 0.1}>
            <article className="group h-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#16130f] p-5 sm:p-6 transition-colors duration-500 hover:border-[rgba(176,141,62,0.4)]">
              <div className="font-mincho text-2xl sm:text-3xl text-[var(--kin-400)] leading-none">
                {p.kanji}
              </div>
              <p className="text-xs uppercase tracking-[0.25em] text-[var(--shu-400)] mt-3">{p.romaji}</p>
              <h4 className="font-heading text-lg text-[var(--washi-50)] mt-1">{p.nl}</h4>
              <p className="text-sm text-[#b9b1a3] leading-relaxed mt-2">{p.text}</p>
            </article>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.1}>
        <p className="mt-8 max-w-3xl text-sm sm:text-[15px] leading-[1.8] text-[#a39a8c]">
          {clubInfo.philosophy}
        </p>
      </Reveal>
    </section>
  );
}

/* --------------------------------- locaties ------------------------------- */

function TwoDojos() {
  const locs = clubInfo.locations;
  return (
    <Reveal>
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {locs.map((loc, i) => (
          <article
            key={loc.name}
            className={`group relative overflow-hidden rounded-lg border p-5 sm:p-6 transition-colors duration-500
              ${i === 0
                ? 'border-[rgba(176,141,62,0.35)] bg-gradient-to-br from-[#1c1712] to-[#141110]'
                : 'border-[rgba(255,255,255,0.08)] bg-[#16130f] hover:border-[rgba(176,141,62,0.35)]'}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="w-10 h-10 rounded-full border border-[var(--kin-500)]/40 bg-[var(--kin-500)]/10 flex items-center justify-center text-[var(--kin-400)]">
                <MapPin className="w-5 h-5" />
              </div>
              {loc.isPrimary && (
                <span className="text-[10px] uppercase tracking-[0.25em] text-[var(--kin-300)] border border-[var(--kin-500)]/30 rounded-full px-3 py-1">
                  Hoofddojo
                </span>
              )}
            </div>
            <h4 className="font-heading text-lg sm:text-xl text-[var(--washi-50)] mt-4">{loc.name}</h4>
            <p className="text-sm text-[#b9b1a3] mt-1">{loc.address}</p>
            <a
              href={loc.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--kin-300)] mt-4 group-hover:text-[var(--kin-400)] transition-colors"
            >
              Route zien <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </article>
        ))}
      </section>
    </Reveal>
  );
}

/* ================================= COMPONENT ============================== */

export function InfoSection({ onNavigate }: { onNavigate?: (s: Section) => void }) {
  const [signupOpen, setSignupOpen] = useState(false);

  // Scroll-progress voor de proloog-parallax
  const prologueRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: prologueRef,
    offset: ['start start', 'end start'],
  });
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  return (
    <div className="-m-2 -mb-[8rem] sm:-m-4 sm:mb-0 md:-m-8 zen-grain relative bg-[#100e0c]">
      {/* ============================== PROLOOG ============================= */}
      <div ref={prologueRef} className="relative">
        <motion.div
          style={{ scale: heroScale }}
          className="relative overflow-hidden"
        >
          <Mist />
          <motion.div style={{ opacity: heroOpacity }} className="relative z-10 px-5 py-14 sm:px-10 sm:py-20 md:py-24 text-center">
            {/* Enso die zich tekent */}
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: EASE }}
              className="text-[var(--kin-400)] mx-auto w-fit"
            >
              <Enso size={88} />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.4, ease: EASE }}
              className="mt-6 text-[10px] sm:text-xs uppercase tracking-[0.5em] text-[var(--kin-300)]"
            >
              Over Ons · Est. 1993
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 1.1, delay: 0.55, ease: EASE }}
              className="font-heading text-3xl sm:text-5xl md:text-6xl text-[var(--washi-50)] mt-4 leading-[1.05]"
            >
              Er was een tijd
              <br />
              <span className="text-gilded">dat judo hier ademde</span>
            </motion.h1>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 0.9, ease: EASE }}
              className="h-px w-40 mx-auto mt-6 line-gilded origin-center"
            />

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 1, ease: EASE }}
              className="max-w-xl mx-auto mt-6 text-sm sm:text-[15px] leading-[1.9] text-[#cfc8bb]"
            >
              Drie decennia lang was de dojo in Steenbergen een plek waar de zachte weg
              niet alleen werd geleerd, maar geleefd — van de eerste knoop van een kind
              tot het zwart van een meester. Dit is het verhaal van Judoclub Michigami.
            </motion.p>

            {/* Stats strip */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 1.2, ease: EASE }}
              className="mt-10 grid grid-cols-3 max-w-lg mx-auto divide-x divide-[rgba(176,141,62,0.25)]"
            >
              {[
                { n: '1993', l: 'opgericht' },
                { n: '2', l: 'locaties' },
                { n: '8e', l: 'dan van de oprichter' },
              ].map((s) => (
                <div key={s.l} className="px-3">
                  <p className="font-heading text-2xl sm:text-3xl text-[var(--kin-400)]">{s.n}</p>
                  <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[var(--sumi-400)] mt-1">
                    {s.l}
                  </p>
                </div>
              ))}
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 1.35, ease: EASE }}
              onClick={() => onNavigate?.('timeline')}
              className="mt-8 inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-[var(--kin-300)] hover:text-[var(--kin-400)] transition-colors border-b border-[var(--kin-500)]/40 pb-1"
            >
              Bekijk de volledige tijdlijn <ArrowRight className="w-3.5 h-3.5" />
            </motion.button>
          </motion.div>
        </motion.div>
      </div>

      {/* =========================== GESCHIEDENIS =========================== */}
      <div className="zen-grain relative -mt-1 rounded-t-none bg-gradient-to-b from-transparent to-[#100e0c]">
        <div className="zen-grain relative bg-[#100e0c] rounded-b-xl px-5 py-12 sm:px-10 sm:py-16 space-y-14 sm:space-y-16">
          <Reveal>
            <div>
              <p className="text-[10px] sm:text-xs uppercase tracking-[0.4em] text-[var(--kin-300)]">
                Het verhaal
              </p>
              <h2 className="font-heading text-2xl sm:text-4xl text-[var(--washi-50)] mt-2">
                Vijf hoofdstukken, één pad
              </h2>
            </div>
          </Reveal>

          <div className="max-w-3xl">
            {CHAPTERS.map((ch, i) => (
              <div key={ch.title} className={i > 0 ? 'mt-14' : ''}>
                <ChapterBlock chapter={ch} index={i} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ============================= EERBETOOM ============================ */}
      <div className="bg-[#100e0c] px-5 sm:px-10 pb-12 sm:pb-16">
        <FounderMemorial />

        {/* Meesters */}
        <div className="mt-14">
          <Masters />
        </div>
      </div>

      {/* ============================== JUDO KUNST =========================== */}
      <div className="bg-[#100e0c] px-5 sm:px-10 pb-12 sm:pb-16">
        <JudoPrinciples />
      </div>

      {/* =============================== EPILOOG ============================= */}
      <div className="bg-[#100e0c] px-5 sm:px-10 pb-12 sm:pb-16">
        <TwoDojos />

        <Reveal delay={0.1}>
          <section className="zen-grain relative mt-10 overflow-hidden rounded-xl border border-[rgba(176,141,62,0.3)] bg-gradient-to-br from-[#1c1712] to-[#12100d] px-5 py-10 sm:px-10 text-center">
            <Mist />
            <div className="relative z-10">
              <p className="font-mincho text-3xl text-[var(--kin-400)] kanji-float select-none">柔</p>
              <h3 className="font-heading text-2xl sm:text-3xl text-[var(--washi-50)] mt-4">
                Het verhaal gaat verder
              </h3>
              <p className="max-w-lg mx-auto mt-3 text-sm sm:text-[15px] leading-relaxed text-[#cfc8bb]">
                De volgende hoofdstukken worden hier geschreven, op de matten in Steenbergen en
                Oud-Vossemeer. Kom ze meeschrijven — met {clubInfo.costs.proeflessen} als begin.
              </p>
              <div className="flex flex-wrap justify-center gap-3 mt-6">
                <Button
                  onClick={() => openProeflesForm()}
                  className="bg-[var(--shu-600)] hover:bg-[var(--shu-700)] text-white font-semibold tracking-wide px-8 h-11"
                >
                  Gratis proefles
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSignupOpen(true)}
                  className="border-[var(--kin-500)]/50 text-[var(--kin-300)] hover:bg-[var(--kin-500)]/10 hover:text-[var(--kin-400)] font-medium tracking-wide h-11"
                >
                  Inschrijven
                </Button>
              </div>
            </div>
          </section>
        </Reveal>
      </div>

      {/* Prev/Next */}
      <div className="bg-[#100e0c] px-5 sm:px-10 pb-8">
        <div className="flex items-center justify-between gap-4 border-t border-[rgba(255,255,255,0.08)] pt-6">
          <Button
            onClick={() => onNavigate?.('agenda')}
            variant="outline"
            className="border-[rgba(176,141,62,0.4)] text-[var(--kin-300)] hover:bg-[var(--kin-500)]/10 hover:text-[var(--kin-400)] gap-2 text-sm flex-1"
          >
            <ChevronLeft className="w-4 h-4" /> Agenda
          </Button>
          <Button
            onClick={() => onNavigate?.('leden')}
            variant="outline"
            className="border-[rgba(176,141,62,0.4)] text-[var(--kin-300)] hover:bg-[var(--kin-500)]/10 hover:text-[var(--kin-400)] gap-2 text-sm flex-1"
          >
            Lid worden <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Signup Modal */}
      <SignupConfirmationModal open={signupOpen} onClose={() => setSignupOpen(false)} signupUrl="/inschrijven" />
    </div>
  );
}