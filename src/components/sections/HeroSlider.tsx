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
      className="relative h-[440px] sm:h-[520px] lg:h-[600px] w-full overflow-hidden rounded-2xl group/slider shadow-xl shadow-black/10 touch-pan-y"
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

      {/* Dark gradient overlays for text legibility */}
      <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/80 via-black/30 to-black/40" />
      <div className="absolute inset-0 z-20 bg-gradient-to-r from-[#a90000]/30 to-transparent mix-blend-multiply" />

      {/* Hero content */}
      <div className="absolute inset-0 z-30 flex flex-col justify-center px-5 sm:px-10 lg:px-14">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <Image
              src="/logo-hd.png"
              alt="Judoclub Michigami"
              width={56}
              height={56}
              className="w-12 h-12 sm:w-14 sm:h-14 object-contain drop-shadow-lg"
            />
            <span className="text-white/80 text-sm sm:text-base font-medium tracking-wide uppercase">
              Judoclub Michigami
            </span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-[1.05] drop-shadow-xl">
            Judo voor jong & oud
          </h1>

          <p className="mt-3 sm:mt-4 text-base sm:text-lg lg:text-2xl text-white/90 font-light drop-shadow-md max-w-xl">
            Van kleuters tot volwassenen — recreatief of competitief, in Steenbergen & Oud-Vossemeer.
          </p>

          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3">
            <button
              onClick={openProeflesForm}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#a90000] px-6 py-3 text-base font-semibold text-white shadow-lg shadow-red-900/40 transition-all hover:bg-[#8c0000] hover:scale-[1.03] active:scale-95"
            >
              <PlayCircle className="w-5 h-5" />
              Gratis proefles
            </button>
            <a
              href="/inschrijven"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/15 backdrop-blur-md px-6 py-3 text-base font-semibold text-white ring-1 ring-white/40 transition-all hover:bg-white/25 hover:scale-[1.03] active:scale-95"
            >
              Lid worden
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-opacity z-40"
        aria-label="Vorige foto"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="sm:w-5 sm:h-5"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-opacity z-40"
        aria-label="Volgende foto"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="sm:w-5 sm:h-5"><path d="M9 18l6-6-6-6"/></svg>
      </button>

      {/* Progress indicator (compact instead of many dots) */}
      <div className="absolute bottom-4 right-4 sm:bottom-5 sm:right-6 flex items-center gap-2 z-40">
        <button
          onClick={prevSlide}
          className="w-9 h-9 rounded-full bg-black/55 hover:bg-black/75 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
          aria-label="Vorige foto"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <span className="text-white text-sm font-semibold tabular-nums bg-black/55 backdrop-blur-sm px-3 py-1.5 rounded-full min-w-[64px] text-center">
          {current + 1} / {heroImages.length}
        </span>
        <button
          onClick={nextSlide}
          className="w-9 h-9 rounded-full bg-black/55 hover:bg-black/75 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
          aria-label="Volgende foto"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>
    </div>
  );
}
