'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { openProeflesForm } from '@/lib/form-events';
import { useT } from '@/i18n/LangContext';

// Curated, rustige selectie — geen 30 foto's meer, alleen de sterkste
const heroImages = [
  { src: '/hero/dojo-2024.jpg' },
  { src: '/hero/insta-groep-2024.webp' },
  { src: '/hero/dojo-nieuwe-matten.jpg' },
  { src: '/hero/insta-training-2024.webp' },
  { src: '/hero/jubileum-groepsfoto.jpg' },
  { src: '/hero/insta-actie-2024.webp' },
  { src: '/hero/examen-dangraad.jpg' },
  { src: '/hero/insta-club-2024.webp' },
];

export function HeroSlider() {
  const { t } = useT();
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const nextSlide = useCallback(() => {
    setCurrent(prev => (prev + 1) % heroImages.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrent(prev => (prev - 1 + heroImages.length) % heroImages.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(nextSlide, 9000);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(deltaX) > 40) {
      if (deltaX > 0) prevSlide();
      else nextSlide();
    }
    touchStartX.current = null;
  };

  return (
    <div
      className="relative h-[440px] sm:h-[520px] lg:h-[580px] w-full overflow-hidden rounded-2xl group/slider shadow-xl shadow-black/10 touch-pan-y"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slides — zachte crossfade, geen ken-burns gedoe */}
      {heroImages.map((image, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-[1400ms] ${
            idx === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <Image
            src={image.src}
            alt="Judoclub Michigami"
            fill
            sizes="100vw"
            className="object-cover"
            priority={idx === 0}
          />
        </div>
      ))}

      {/* Egale, kalme overlay — eentje, rustig verloop + extra donker aan de tekstkant */}
      <div className="absolute inset-0 z-20 bg-gradient-to-t from-[#14120e]/85 via-[#14120e]/35 to-[#14120e]/25" />
      <div className="absolute inset-0 z-20 bg-gradient-to-r from-[#14120e]/55 via-transparent to-transparent" />

      {/* Verticale kanji — alleen desktop, rustig */}
      <div className="absolute right-9 top-1/2 -translate-y-1/2 z-30 hidden lg:flex flex-col items-center gap-3 pointer-events-none">
        <span className="text-vertical font-mincho text-3xl text-white/70 tracking-[0.5em]">
          柔道
        </span>
        <span className="w-px h-10 bg-gradient-to-b from-white/40 to-transparent" />
      </div>

      {/* Hero content — pt houdt ruimte vrij voor de hamburgerknop op mobiel */}
      <div className="absolute inset-0 z-30 flex flex-col justify-center px-5 sm:px-10 lg:px-14 pt-14 sm:pt-0">
        <div className="max-w-2xl">
          {/* Brand row: hanko seal + name */}
          <div className="flex items-center gap-3 mb-5">
            <span className="hanko hanko--lg w-11 h-11 sm:w-12 sm:h-12 text-lg sm:text-xl">
              道
            </span>
            <span className="text-white/90 text-sm sm:text-base font-medium tracking-[0.18em] uppercase">
              Judoclub Michigami
            </span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-[1.05]">
            Judo <span className="whitespace-nowrap">{t('voor jong & oud')}</span>
          </h1>

          <p className="mt-3 sm:mt-4 text-base sm:text-lg text-white/80 font-light max-w-xl">
            {t('Van kleuters tot volwassenen, recreatief of competitief. In Steenbergen en Oud-Vossemeer.')}
          </p>

          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3">
            <button
              onClick={openProeflesForm}
              className="btn-shu inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-base font-semibold"
            >
              {t('Gratis proefles')}
            </button>
            <a
              href="/inschrijven"
              className="btn-outline-kin inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-base font-semibold"
            >
              {t('Lid worden')}
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>

          <p className="mt-6 text-[11px] sm:text-xs text-white/50 tracking-[0.3em]">
            {t('OPGERICHT 1993')}
          </p>
        </div>
      </div>

      {/* Pijltjes alleen op desktop (hover) */}
      <button
        onClick={prevSlide}
        className="hidden sm:flex absolute left-7 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/35 hover:bg-black/60 text-white items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-opacity duration-500 z-40 border border-white/15"
        aria-label={t('Vorige foto')}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <button
        onClick={nextSlide}
        className="hidden sm:flex absolute right-7 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/35 hover:bg-black/60 text-white items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-opacity duration-500 z-40 border border-white/15"
        aria-label={t('Volgende foto')}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
      </button>

      {/* Rustige dots — alleen desktop */}
      <div className="hidden sm:flex absolute bottom-6 left-1/2 -translate-x-1/2 z-40 items-center gap-2">
        {heroImages.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            aria-label={`Foto ${idx + 1}`}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              idx === current ? 'w-6 bg-white/90' : 'w-1.5 bg-white/40 hover:bg-white/60'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
