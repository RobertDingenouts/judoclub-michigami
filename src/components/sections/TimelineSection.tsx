'use client';

import { useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { timelineEvents, type TimelineEvent } from '@/data/timeline-data';
import { SakuraPetals, SumiLandscape, InkBleeds } from '@/components/sections/ZenScenery';
import ZenInkField from '@/components/sections/ZenInkField';
import ParallaxKanji from '@/components/sections/ParallaxKanji';
import { useInkHover } from '@/components/sections/useInkHover';
import { Trophy, Award, MapPin, Star, Users, Swords } from 'lucide-react';
import { ImageLightbox } from '@/components/ui/ImageLightbox';
import { type Section } from '@/components/nav-config';
import { cn } from '@/lib/utils';

const EASE = [0.22, 1, 0.36, 1] as const;

const iconMap: Record<string, React.ReactNode> = {
  judo: <Swords className="w-4 h-4" />,
  club: <Users className="w-4 h-4" />,
  person: <Star className="w-4 h-4" />,
  award: <Award className="w-4 h-4" />,
  location: <MapPin className="w-4 h-4" />,
  star: <Trophy className="w-4 h-4" />,
};

/* --------------------------- tijdlijn-item -------------------------------- */
function TimelineItem({ event, index }: { event: TimelineEvent; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [photoOpen, setPhotoOpen] = useState(false);
  const inView = useInView(ref, { once: true, margin: '-120px' });
  const isLeft = index % 2 === 0;
  const inkHover = useInkHover();

  return (
    <div
      ref={ref}
      className={`relative flex items-start w-full ${index < timelineEvents.length - 1 ? 'mb-10 sm:mb-14' : ''} ${
        isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
      }`}
    >
      {/* Node op de ruglijn */}
      <div className="absolute left-4 md:left-1/2 md:-translate-x-1/2 z-10 -top-1">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={inView ? { scale: 1, opacity: 1 } : {}}
          transition={{ delay: 0.15, type: 'spring', stiffness: 260, damping: 18 }}
          className={`flex items-center justify-center rounded-full ${
            event.memorial
              ? 'w-11 h-11 bg-gradient-to-br from-[#d98a3a] to-[var(--shu-800)] text-[var(--washi-50)] shadow-[0_0_26px_rgba(217,138,58,0.55)] ring-4 ring-[rgba(217,138,58,0.22)]'
              : event.isMilestone
                ? 'w-12 h-12 bg-gradient-to-br from-[var(--kin-400)] to-[var(--kin-600)] text-[#241c14] shadow-[0_0_24px_rgba(160,125,46,0.35)] ring-4 ring-[rgba(160,125,46,0.18)]'
                : 'w-9 h-9 bg-[var(--shu-600)] border border-[var(--kin-400)]/50 text-[var(--washi-50)]'
          }`}
        >
          {iconMap[event.icon || 'club']}
        </motion.div>
      </div>

      {/* Kaart */}
      <div className={`ml-12 md:ml-0 md:w-[calc(50%-3rem)] ${isLeft ? 'md:pr-0' : 'md:pl-0'}`}>
        <motion.div
          initial={{ opacity: 0, y: 28, filter: 'blur(6px)' }}
          animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
          className="relative"
        >
          {/* Kaarsgloed — twee lagen:
              1. Halo: warme gloed rond de kaart (buiten, op de washi-achtergrond)
              2. Overlay: warme verkleuring op de kaart zelf */}
          {event.memorial && (
            <>
              {/* Halo — licht dat van de kaart afstraalt */}
              <div
                className="pointer-events-none absolute -inset-14 z-0 rounded-3xl"
                style={{
                  background: 'radial-gradient(ellipse 75% 65% at 50% 58%, rgba(250,175,95,0.55), rgba(235,145,60,0.30) 42%, rgba(205,105,45,0.10) 62%, transparent 78%)',
                  filter: 'blur(22px)',
                  animation: 'candleFlicker 4.5s ease-in-out infinite',
                }}
                aria-hidden
              />
              {/* Overlay — warme verkleuring op de kaart */}
              <div
                className="candle-glow pointer-events-none absolute inset-0 z-30 rounded-lg"
                aria-hidden
              />
            </>
          )}

          <article
            onPointerMove={inkHover}
            className={cn(
              'ink-card ink-bloom relative z-10 overflow-hidden rounded-lg p-5 sm:p-6 transition-all duration-500',
              event.memorial
                ? 'border-[var(--shu-600)]/45 shadow-[0_0_0_1px_rgba(217,138,58,0.18),0_0_44px_6px_rgba(230,150,70,0.30),0_0_90px_20px_rgba(210,110,50,0.16),0_14px_36px_-24px_rgba(169,0,0,0.35)]'
                : event.isMilestone
                  ? 'border-[var(--kin-500)]/50 shadow-[0_14px_40px_-24px_rgba(42,33,28,0.6)]'
                  : 'hover:border-[var(--shu-400)]/40 hover:shadow-[0_14px_36px_-26px_rgba(0,0,0,0.8)]',
            )}
          >
            {/* Jaar — groot, in mincho-stijl */}
            <div className="relative z-10 flex items-baseline gap-3 mb-3">
              <span className={`font-heading leading-none ${event.memorial ? 'text-3xl sm:text-4xl text-[#b5651d]' : event.isMilestone ? 'text-3xl sm:text-4xl text-[var(--shu-700)]' : 'text-2xl sm:text-3xl text-[var(--sumi-900)]'}`}>
                {event.year}
              </span>
              {event.isMilestone && (
                <span className="text-[10px] uppercase tracking-[0.3em] text-[var(--kin-700)]">
                  mijlpaal
                </span>
              )}
              {event.memorial && (
                <span className="text-[10px] uppercase tracking-[0.3em] text-[var(--shu-600)]/70">
                  ter herinnering
                </span>
              )}
            </div>

            <h3 className="relative z-10 font-heading text-base sm:text-lg text-[var(--sumi-900)] leading-snug">
              {event.title}
            </h3>
            <p className="relative z-10 text-sm text-[var(--sumi-700)] leading-[1.75] mt-2">{event.description}</p>

            {/* Foto van het moment — klikbaar voor lightbox */}
            {event.photoUrl && (
              <figure className="relative z-10 mt-4">
                <button
                  type="button"
                  onClick={() => setPhotoOpen(true)}
                  className="group relative block w-full overflow-hidden rounded-lg border border-[var(--sumi-700)]/20 shadow-[0_10px_30px_-18px_rgba(42,33,28,0.7)]"
                  aria-label={event.photoCaption ? `Grootbeeld: ${event.photoCaption}` : 'Grootbeeld openen'}
                >
                  <div className={cn('relative w-full', event.photoAspect ?? 'aspect-square')}>
                    <Image
                      src={event.photoUrl}
                      alt={event.photoCaption || event.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 420px"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                  </div>
                </button>
                {event.photoCaption && (
                  <figcaption className="mt-2 text-center text-xs text-[var(--sumi-500)]">{event.photoCaption}</figcaption>
                )}
                {photoOpen && (
                  <ImageLightbox
                    images={[event.photoUrl]}
                    initialIndex={0}
                    onClose={() => setPhotoOpen(false)}
                  />
                )}
              </figure>
            )}

            {/* Rode onderstreep bij milestones */}
            {event.isMilestone && (
              <div className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-[var(--shu-600)]/70 via-[var(--kin-500)]/70 to-transparent" />
            )}
            {/* Shu-lijn bij memorials */}
            {event.memorial && (
              <div className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-[var(--shu-700)]/60 via-[var(--shu-600)]/40 to-transparent" />
            )}
          </article>

          {/* Lokale vallende bloesem — waait over de gedenkkaart (vooraan, z-20) */}
          {event.memorial && (
            <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-lg" aria-hidden>
              {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                <span
                  key={i}
                  className="petal-local"
                  style={{
                    left: `${10 + i * 13}%`,
                    width: `${12 + (i % 3) * 4}px`,
                    height: `${12 + (i % 3) * 4}px`,
                    background: 'radial-gradient(circle at 35% 30%, rgba(250,170,182,0.95), rgba(236,120,142,0.6))',
                    borderRadius: '50% 50% 50% 0',
                    animationDuration: `${6.5 + i * 1.4}s`,
                    animationDelay: `${i * 0.7}s`,
                    ['--sway' as string]: `${(i % 2 === 0 ? 1 : -1) * (20 + i * 6)}px`,
                    ['--petal-o' as string]: 0.7 + i * 0.04,
                  }}
                />
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Spacer */}
      <div className="hidden md:block md:w-[calc(50%-3rem)]" />
    </div>
  );
}

/* ================================= COMPONENT =============================== */
export function TimelineSection({ onNavigate }: { onNavigate?: (s: Section) => void }) {
  void onNavigate; // gereserveerd voor latere navigatie
  const spineRef = useRef<HTMLDivElement>(null);

  // De ruglijn trekt zich mee met het scrollen
  const { scrollYProgress } = useScroll({
    target: spineRef,
    offset: ['start 0.75', 'end 0.6'],
  });
  const spineHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true, margin: '-100px' });

  // Parallax-kanji's — vastgelegd met useMemo zodat ze niet opnieuw renderen
  const kanjiParallax = useMemo(() => [
    { kanji: '始', cls: 'left-[4%] top-32 font-jp text-[14rem] leading-none text-[var(--sumi-800)] sm:text-[19rem]', depth: 80, opacity: 0.045 },
    { kanji: '道', cls: 'right-[3%] top-[38rem] font-jp text-[12rem] leading-none text-[var(--shu-700)] sm:text-[17rem]', depth: -65, opacity: 0.04 },
    { kanji: '絆', cls: 'left-[8%] top-[72rem] font-jp text-[13rem] leading-none text-[var(--sumi-800)] sm:text-[18rem]', depth: 70, opacity: 0.04 },
    { kanji: '継', cls: 'right-[6%] top-[108rem] font-jp text-[12rem] leading-none text-[var(--kin-700)] sm:text-[16rem]', depth: -55, opacity: 0.035 },
  ], []);

  return (
    <div className="ink-paper zen-fullbleed zen-scroll relative min-h-screen overflow-hidden">
      {/* Levend inktveld */}
      <ZenInkField density={0.7} maxAlpha={0.07} />
      <InkBleeds tone="light" className="opacity-60" />
      <SakuraPetals count={14} className="opacity-90" />

      {/* Parallax-kanji's die in eigen tempo meedrijven */}
      {kanjiParallax.map((k, i) => (
        <ParallaxKanji
          key={i}
          kanji={k.kanji}
          depth={k.depth}
          peakOpacity={k.opacity}
          className={cn('pointer-events-none absolute', k.cls)}
        />
      ))}

      <div className="relative z-10 max-w-4xl mx-auto px-5 sm:px-10 py-10 sm:py-16">
        {/* Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
          animate={headerInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ duration: 0.9, ease: EASE }}
          className="relative text-center"
        >
          <SumiLandscape tone="light" className="opacity-80 h-[280px] top-[-80px]" />
          <p className="relative text-[10px] sm:text-xs uppercase tracking-[0.5em] text-[var(--kin-700)]">
            1882 — heden
          </p>
          <h1 className="relative ink-title font-heading text-3xl sm:text-5xl text-[var(--sumi-900)] mt-3">
            De tijdlijn <span className="text-[var(--shu-700)]">van het pad</span>
          </h1>
          <div className="relative h-px w-40 mx-auto mt-5 bg-gradient-to-r from-transparent via-[var(--kin-500)]/70 to-transparent brush-stroke" />
          <p className="relative max-w-xl mx-auto mt-5 text-sm sm:text-[15px] leading-[1.8] text-[var(--sumi-700)]">
            Van de Kodokan in Tokio tot de matten in Steenbergen — elke stap op dit pad
            stond niet alleen.
          </p>
        </motion.div>

        {/* Tijdlijn */}
        <div ref={spineRef} className="relative mt-12 sm:mt-16">
          {/* Brush-spine: rood-gouden vulling die meeloopt + pulserende kwastpunt.
              De track (2px) is de "leeg" ruglijn; de fill (6px) trekt zich mee. */}
          <div className="brush-spine absolute left-4 md:left-1/2 md:-translate-x-1/2 top-0 w-[6px] h-full pointer-events-none">
            <div className="brush-spine-track" />
            <motion.div
              style={{ height: spineHeight }}
              className="brush-spine-fill"
            />
            <motion.div
              style={{ top: spineHeight }}
              className="brush-spine-tip"
            />
          </div>

          {timelineEvents.map((event, index) => (
            <TimelineItem key={event.year + index} event={event} index={index} />
          ))}
        </div>

        {/* Epiloog */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, delay: 0.15, ease: EASE }}
          className="mt-14 text-center"
        >
          <div className="ink-card ink-bloom relative overflow-hidden rounded-xl px-5 py-8 sm:px-10">
            <SakuraPetals count={6} />
            <p className="relative font-jp text-4xl text-[var(--shu-600)] kanji-float select-none">道</p>
            <p className="relative max-w-lg mx-auto mt-4 text-sm sm:text-[15px] leading-[1.8] text-[var(--sumi-700)]">
              <span className="font-semibold text-[var(--sumi-900)]">Judoclub Michigami</span> —
              meer dan 30 jaar de zachte weg, in Steenbergen en Oud-Vossemeer.
              Respect, discipline en passie.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
