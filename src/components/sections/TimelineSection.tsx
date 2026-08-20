'use client';

import { useRef } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { timelineEvents, type TimelineEvent } from '@/data/timeline-data';
import { Trophy, Award, MapPin, Star, Users, Swords, ArrowLeft } from 'lucide-react';
import { type Section } from '@/components/nav-config';

const EASE = [0.22, 1, 0.36, 1] as const;

const iconMap: Record<string, React.ReactNode> = {
  judo: <Swords className="w-4 h-4" />,
  club: <Users className="w-4 h-4" />,
  person: <Star className="w-4 h-4" />,
  award: <Award className="w-4 h-4" />,
  location: <MapPin className="w-4 h-4" />,
  star: <Trophy className="w-4 h-4" />,
};

/* --------------------------- mist-achtergrond ----------------------------- */
function Mist() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <div
        className="animate-mist absolute -top-1/3 -left-1/4 w-[70%] h-[90%] rounded-full"
        style={{ background: 'radial-gradient(ellipse at center, rgba(176,141,62,0.08), transparent 65%)' }}
      />
      <div
        className="animate-mist absolute -bottom-1/3 -right-1/4 w-[70%] h-[90%] rounded-full"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(169,0,0,0.08), transparent 65%)',
          animationDelay: '-14s',
          animationDuration: '32s',
        }}
      />
    </div>
  );
}

/* ------------------------------ tijdlijn-item ----------------------------- */
function TimelineItem({ event, index }: { event: TimelineEvent; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
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
              ? 'w-12 h-12 bg-gradient-to-br from-[var(--kin-400)] to-[var(--kin-600)] text-[#141210] shadow-[0_0_28px_rgba(176,141,62,0.45)] ring-4 ring-[rgba(176,141,62,0.15)]'
              : 'w-9 h-9 bg-[#1c1915] border border-[rgba(176,141,62,0.5)] text-[var(--kin-400)]'
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
            className={`relative overflow-hidden rounded-lg border bg-[#16130f] p-5 sm:p-6 transition-colors duration-500
              ${event.isMilestone
                ? 'border-[rgba(176,141,62,0.4)] shadow-[0_0_40px_rgba(176,141,62,0.08)]'
                : 'border-[rgba(255,255,255,0.08)] hover:border-[rgba(176,141,62,0.3)]'}`}
          >
            {/* Jaar — groot, in mincho-stijl */}
            <div className="flex items-baseline gap-3 mb-3">
              <span className={`font-heading leading-none ${event.isMilestone ? 'text-gilded text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl text-[var(--washi-100)]'}`}>
                {event.year}
              </span>
              {event.isMilestone && (
                <span className="text-[10px] uppercase tracking-[0.3em] text-[var(--kin-300)]">
                  mijlpaal
                </span>
              )}
            </div>

            <h3 className="font-heading text-base sm:text-lg text-[var(--washi-50)] leading-snug">
              {event.title}
            </h3>
            <p className="text-sm text-[#b3aa9b] leading-[1.75] mt-2">{event.description}</p>

            {/* Gouden onderstreep bij milestones */}
            {event.isMilestone && (
              <div className="absolute bottom-0 left-0 h-0.5 w-full line-gilded opacity-60" />
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
  const wrapRef = useRef<HTMLDivElement>(null);
  const spineRef = useRef<HTMLDivElement>(null);

  // De gouden ruglijn trekt zich mee met het scrollen
  const { scrollYProgress } = useScroll({
    target: spineRef,
    offset: ['start 0.75', 'end 0.6'],
  });
  const spineHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true, margin: '-100px' });

  return (
    <div ref={wrapRef} className="-m-2 -mb-[8rem] sm:-m-4 sm:mb-0 md:-m-8 zen-grain relative bg-[#100e0c] min-h-screen">
      <Mist />
      <div className="relative z-10 max-w-4xl mx-auto px-5 sm:px-10 py-10 sm:py-16">
        {/* Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
          animate={headerInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ duration: 0.9, ease: EASE }}
          className="text-center"
        >
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.5em] text-[var(--kin-300)]">
            1882 — heden
          </p>
          <h1 className="font-heading text-3xl sm:text-5xl text-[var(--washi-50)] mt-3">
            De tijdlijn <span className="text-gilded">van het pad</span>
          </h1>
          <div className="h-px w-40 mx-auto mt-5 line-gilded" />
          <p className="max-w-xl mx-auto mt-5 text-sm sm:text-[15px] leading-[1.8] text-[#cfc8bb]">
            Van de Kodokan in Tokio tot de matten in Steenbergen — elke stap op dit pad
            stond niet alleen.
          </p>
        </motion.div>

        {/* Tijdlijn */}
        <div ref={spineRef} className="relative mt-12 sm:mt-16">
          {/* Basisruglijn */}
          <div className="absolute left-4 md:left-1/2 md:-translate-x-px top-0 bottom-0 w-px bg-[rgba(176,141,62,0.18)]" />
          {/* Gouden vulling die meeloopt */}
          <motion.div
            style={{ height: spineHeight }}
            className="absolute left-4 md:left-1/2 md:-translate-x-px top-0 w-px origin-top bg-gradient-to-b from-[var(--kin-400)] via-[var(--kin-500)] to-[var(--shu-500)] shadow-[0_0_12px_rgba(176,141,62,0.5)]"
          />

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
          <div className="zen-grain relative overflow-hidden rounded-xl border border-[rgba(176,141,62,0.25)] bg-gradient-to-br from-[#191512] to-[#100e0c] px-5 py-8 sm:px-10">
            <p className="font-mincho text-4xl text-[var(--kin-400)] kanji-float select-none">道</p>
            <p className="max-w-lg mx-auto mt-4 text-sm sm:text-[15px] leading-[1.8] text-[#cfc8bb]">
              <span className="font-semibold text-[var(--washi-100)]">Judoclub Michigami</span> —
              meer dan 30 jaar de zachte weg, in Steenbergen en Oud-Vossemeer.
              Respect, discipline en passie.
            </p>
            {onNavigate && (
              <Button
                onClick={() => onNavigate('info')}
                variant="outline"
                className="mt-6 border-[rgba(176,141,62,0.4)] text-[var(--kin-300)] hover:bg-[var(--kin-500)]/10 hover:text-[var(--kin-400)] gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Terug naar Over Ons
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}