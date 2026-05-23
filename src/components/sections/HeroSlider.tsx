'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

const heroImages = [
  // Dojo / Club sfeer
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

function ClubLogo({ className = "", alt = "Judoclub Michigami" }: { className?: string; alt?: string }) {
  return <Image src="/logo.png" alt={alt} width={64} height={64} className={className} />;
}

export function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

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

  return (
    <div>
      <div
        className="relative h-56 sm:h-64 md:h-80 lg:h-96 overflow-hidden rounded-2xl group/slider"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {heroImages.map((image, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              idx === current ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="relative w-full h-full">
              <Image
                src={image.src}
                alt="Judoclub Michigami"
                fill
                sizes="100vw"
                className="object-cover"
                priority={idx === 0}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          </div>
        ))}

        {/* Navigation arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-opacity z-20"
          aria-label="Vorige foto"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="sm:w-5 sm:h-5"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-opacity z-20"
          aria-label="Volgende foto"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="sm:w-5 sm:h-5"><path d="M9 18l6-6-6-6"/></svg>
        </button>

        {/* Dots */}
        <div className="absolute bottom-3 right-4 sm:bottom-4 sm:right-6 flex gap-1.5 z-20">
          {heroImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`transition-all ${
                idx === current ? 'bg-white w-5' : 'bg-white/50 hover:bg-white/80 w-2'
              } h-2 rounded-full`}
              aria-label={`Ga naar foto ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Welkom banner — verplaatst van Wat is Judo tab */}
      <div className="mt-4 rounded-2xl overflow-hidden shadow-lg border border-[#fce0e0]">
        <div className="bg-gradient-to-r from-[#a90000] to-[#8c0000] p-4 sm:p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <ClubLogo className="w-10 h-10 object-contain flex-shrink-0" />
            <h3 className="text-xl sm:text-2xl font-bold">🥋 Welkom bij Judoclub Michigami!</h3>
          </div>
          <p className="text-white/90 text-sm sm:text-base">Judo voor jong en oud — van kleuters tot volwassenen, recreatief of competitief.</p>
        </div>
      </div>
    </div>
  );
}
