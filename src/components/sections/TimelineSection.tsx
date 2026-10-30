'use client';

import { useRef, useState } from 'react';
import { GhostSpot } from '@/components/GhostSpot'
import Image from 'next/image';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { timelineEvents, type TimelineEvent } from '@/data/timeline-data';
import { SakuraPetals, SumiLandscape, InkBleeds } from '@/components/sections/ZenScenery';
import { Trophy, Award, MapPin, Star, Users, Swords } from 'lucide-react';
import { ImageLightbox } from '@/components/ui/ImageLightbox';
import { type Section } from '@/components/nav-config';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n/LangContext';
import { timelineItemFor } from '@/i18n/content';

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
function TimelineItem({ event: evNl, index, occurrence = 0 }: { event: TimelineEvent; index: number; occurrence?: number }) {
  const { t, lang } = useT();
  const event = timelineItemFor(evNl, lang, occurrence);
  const ref = useRef<HTMLDivElement>(null);
  const [photoOpen, setPhotoOpen] = useState(false);
  const inView = useInView(ref, { once: true, margin: '-120px' });
  const isLeft = index % 2 === 0;

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
            event.isMilestone
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
        >
          <article
            className={`ink-card relative overflow-hidden rounded-lg p-5 sm:p-6 transition-all duration-500
              ${event.isMilestone
                ? 'border-[var(--kin-500)]/50 shadow-[0_14px_40px_-24px_rgba(42,33,28,0.6)]'
                : 'hover:border-[var(--shu-400)]/40 hover:shadow-[0_14px_36px_-26px_rgba(0,0,0,0.8)]'}`}
          >
            {/* Jaar — groot, in mincho-stijl */}
            <div className="flex items-baseline gap-3 mb-3">
              <span className={`font-heading leading-none ${event.isMilestone ? 'text-3xl sm:text-4xl text-[var(--shu-700)]' : 'text-2xl sm:text-3xl text-[var(--sumi-900)]'}`}>
                {event.year}
              </span>

            </div>

            <h3 className="font-heading text-base sm:text-lg text-[var(--sumi-900)] leading-snug">
              {event.title}
            </h3>
            <p className="text-sm text-[var(--sumi-700)] leading-[1.75] mt-2">{event.description}</p>

            {/* Foto van het moment — klikbaar voor lightbox */}
            {event.photoUrl && (
              <figure className="mt-4">
                <button
                  type="button"
                  onClick={() => setPhotoOpen(true)}
                  className="group relative block w-full overflow-hidden rounded-lg border border-[var(--sumi-700)]/20 shadow-[0_10px_30px_-18px_rgba(42,33,28,0.7)]"
                  aria-label={event.photoCaption ? `${t('Grootbeeld')}: ${event.photoCaption}` : t('Grootbeeld openen')}
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
          </article>
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

  return (
    <div className="ink-paper zen-fullbleed zen-scroll relative min-h-screen overflow-hidden">
      <InkBleeds tone="light" className="opacity-60" />
      <SakuraPetals count={14} className="opacity-90" />

      <div className="relative z-10 max-w-4xl mx-auto px-5 sm:px-10 py-10 sm:py-16"
            <GhostSpot className="absolute top-2 right-0 w-6 text-[#8a8a80]/25" />>
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
          {/* Basisruglijn */}
          <div className="absolute left-4 md:left-1/2 md:-translate-x-px top-0 bottom-0 w-px bg-[var(--sumi-800)]/25" />
          {/* Rood-gouden vulling die meeloopt */}
          <motion.div
            style={{ height: spineHeight }}
            className="absolute left-4 md:left-1/2 md:-translate-x-px top-0 w-px origin-top bg-gradient-to-b from-[var(--kin-500)] via-[var(--shu-500)] to-[var(--shu-600)] shadow-[0_0_10px_rgba(192,0,0,0.25)]"
          />

          {timelineEvents.map((event, index) => (
            <TimelineItem key={event.year + index} event={event} index={index} occurrence={timelineEvents.slice(0, index).filter((e) => e.year === event.year).length} />
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
          <div className="ink-card relative overflow-hidden rounded-xl px-5 py-8 sm:px-10">
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