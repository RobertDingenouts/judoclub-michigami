'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { PlayCircle, ArrowRight } from 'lucide-react';
import { openProeflesForm } from '@/lib/form-events';

const heroImages = [
  { src: '/hero/dojo-2024.jpg' },
  { src: '/hero/insta-jubileum-2024.webp' },
  { src: '/hero/michigami-25jaar-1.jpg' },
  { src: '/hero/insta-training-2024.webp' },
  { src: '/hero/budodag-actie-1.jpg' },
  { src: '/hero/insta-actie-2024.webp' },
  { src: '/hero/heerle-toernooi-1.jpg' },
  { src: '/hero/insta-feest-2024.webp' },
  { src: '/hero/clubkamp-groep.jpg' },
  { src: '/hero/insta-nieuwjaar-2026.webp' },
  { src: '/hero/training-oud.jpg' },
  { src: '/hero/insta-club-2024.webp' },
  { src: '/hero/jubileum-groepsfoto.jpg' },
  { src: '/hero/insta-zomer-2025.webp' },
  { src: '/hero/examen-dangraad.jpg' },
  { src: '/hero/insta-groep-2024.webp' },
  { src: '/hero/dojo-nieuwe-matten.jpg' },
  { src: '/hero/insta-sportief-2024.webp' },
  { src: '/hero/michigami-25jaar-2.jpg' },
  { src: '/hero/insta-winter-2025.webp' },
  { src: '/hero/budodag-actie-3.jpg' },
  { src: '/hero/heerle-toernooi-2.jpg' },
  { src: '/hero/clubkamp-actie.jpg' },
  { src: '/hero/training-oud-2.jpg' },
  { src: '/hero/jubileum-feest.jpg' },
  { src: '/hero/examen-3dan.jpg' },
  { src: '/hero/budodag-actie-2.jpg' },
  { src: '/hero/heerle-actie-2.jpg' },
  { src: '/hero/heerle-groep.jpg' },
  { src: '/hero/budodag-actie-4.jpg' },
];

export function HeroSlider() {
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
    const timer = setInterval(nextSlide, 7000);
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
      className="relative h-[440px] sm:h-[520px] lg:h-[600px] w-full overflow-hidden rounded-none group/slider shadow-xl shadow-black/10 touch-pan-y"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slides with Ken Burns zoom */}
      {heroImages.map((image, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            idx === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <div className={`relative w-full h-full ${idx === current ? 'animate-heroZoom' : ''}`}>
            <Image
              src={image.src}
              alt="Judoclub Michigami"
              fill
              sizes="100vw"
              className="object-cover"
              priority={idx === 0}
            />
          </div>
        </div>
      ))}

      {/* Sumi ink gradient — deep, cinematic, warm at the base */}
      <div className="absolute inset-0 z-20 bg-gradient-to-t from-[#14120e]/90 via-[#14120e]/35 to-[#14120e]/45" />
      <div className="absolute inset-0 z-20 bg-gradient-to-r from-[#14120e]/60 via-transparent to-transparent" />
      {/* Vermilion ember glow, bottom-left */}
      <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-[#a90000]/12 blur-3xl z-20" />

      {/* Vertical kanji — 柔道 (judo), right edge, classical */}
      <div className="absolute right-6 sm:right-9 top-1/2 -translate-y-1/2 z-30 hidden sm:flex flex-col items-center gap-4 pointer-events-none">
        <span className="text-vertical font-mincho text-3xl lg:text-4xl text-white/85 tracking-[0.5em] drop-shadow-lg">
          柔道
        </span>
        <span className="w-px h-10 bg-gradient-to-b from-white/50 to-transparent" />
        <span className="text-vertical text-[10px] lg:text-xs text-white/50 tracking-[0.4em] font-medium">
          柔心剛意
        </span>
      </div>

      {/* Hero content */}
      <div className="absolute inset-0 z-30 flex flex-col justify-center px-5 sm:px-10 lg:px-14">
        <div className="max-w-2xl">
          {/* Brand row: hanko seal + name */}
          <div className="flex items-center gap-3 mb-5">
            <span className="hanko hanko--lg w-11 h-11 sm:w-12 sm:h-12 text-lg sm:text-xl rotate-[-4deg]">
              道
            </span>
            <div className="flex items-baseline gap-2.5">
              <span className="text-white/90 text-sm sm:text-base font-medium tracking-[0.18em] uppercase">
                Judoclub Michigami
              </span>
              <span className="text-white/60 text-[10px] sm:text-xs font-mincho tracking-[0.3em]">
                道上
              </span>
            </div>
          </div>

          {/* Gold hairline above headline */}
          <div className="divider-kin mb-4 max-w-[220px]" />

          <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-[1.05] drop-shadow-xl">
            Judo voor jong &amp; oud
          </h1>

          <p className="mt-3 sm:mt-4 text-base sm:text-lg lg:text-2xl text-white/85 font-light drop-shadow-md max-w-xl">
            Van kleuters tot volwassenen — recreatief of competitief, in Steenbergen &amp; Oud-Vossemeer.
          </p>

          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3">
            <button
              onClick={openProeflesForm}
              className="btn-shu inline-flex items-center justify-center gap-2 rounded-none px-6 py-3 text-base font-semibold"
            >
              <PlayCircle className="w-5 h-5" />
              Gratis proefles
            </button>
            <a
              href="/inschrijven"
              className="btn-outline-kin inline-flex items-center justify-center gap-2 rounded-none px-6 py-3 text-base font-semibold"
            >
              Lid worden
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>

          {/* Est. line — mincho, gold */}
          <p className="mt-6 text-[11px] sm:text-xs text-white/55 font-mincho tracking-[0.35em]">
            OPGERICHT 1993 · 心技体
          </p>
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-5 sm:left-7 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-opacity z-40 backdrop-blur-sm border border-white/15"
        aria-label="Vorige foto"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="sm:w-5 sm:h-5"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-5 sm:right-7 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-opacity z-40 backdrop-blur-sm border border-white/15"
        aria-label="Volgende foto"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="sm:w-5 sm:h-5"><path d="M9 18l6-6-6-6"/></svg>
      </button>

      {/* Progress indicator — washi pill with gold counter */}
      <div className="absolute bottom-6 right-6 sm:bottom-8 sm:right-9 flex items-center gap-2 z-40">
        <button
          onClick={prevSlide}
          className="w-9 h-9 rounded-full bg-black/55 hover:bg-black/75 text-white flex items-center justify-center transition-colors backdrop-blur-sm border border-white/15"
          aria-label="Vorige foto"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <span className="text-white text-sm font-semibold tabular-nums bg-black/55 backdrop-blur-sm px-3 py-1.5 rounded-full min-w-[64px] text-center border border-white/15">
          {current + 1} / {heroImages.length}
        </span>
        <button
          onClick={nextSlide}
          className="w-9 h-9 rounded-full bg-black/55 hover:bg-black/75 text-white flex items-center justify-center transition-colors backdrop-blur-sm border border-white/15"
          aria-label="Volgende foto"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>
    </div>
  );
}
