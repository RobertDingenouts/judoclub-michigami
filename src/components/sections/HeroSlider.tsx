'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

const heroImages = [
  { src: '/hero/dojo-2024.jpg', label: 'Welkom bij Judoclub Michigami!' },
  { src: '/hero/dojo-nieuwe-matten.jpg', label: 'Onze nieuwe matten in Steenbergen' },
  { src: '/hero/michigami-25jaar-1.jpg', label: '25 jaar Judoclub Michigami' },
  { src: '/hero/michigami-25jaar-2.jpg', label: 'Jubileumviering Michigami' },
  { src: '/hero/jubileum-groepsfoto.jpg', label: 'Clubfamilie Michigami' },
  { src: '/hero/jubileum-feest.jpg', label: 'Feesten met de club' },
  { src: '/hero/budodag-actie-1.jpg', label: 'Activiteiten op de Budodag' },
  { src: '/hero/budodag-actie-2.jpg', label: 'Judodag Michigami' },
  { src: '/hero/budodag-actie-3.jpg', label: 'Actief op de Budodag' },
  { src: '/hero/budodag-actie-4.jpg', label: 'Budodag activiteiten' },
  { src: '/hero/heerle-toernooi-1.jpg', label: 'Toernooi Heerle' },
  { src: '/hero/heerle-toernooi-2.jpg', label: 'Wedstrijden Michigami' },
  { src: '/hero/heerle-actie-2.jpg', label: 'Actie op het toernooi' },
  { src: '/hero/heerle-groep.jpg', label: 'Team Michigami op toernooi' },
  { src: '/hero/clubkamp-groep.jpg', label: 'Clubkampioenschappen' },
  { src: '/hero/clubkamp-actie.jpg', label: 'Clubkampioenschappen in actie' },
  { src: '/hero/examen-dangraad.jpg', label: 'Dangraad examens' },
  { src: '/hero/examen-3dan.jpg', label: '3e Dan examens' },
  { src: '/hero/training-oud.jpg', label: 'Trainingen door de jaren' },
  { src: '/hero/training-oud-2.jpg', label: 'Traditie en passie' },
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
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  return (
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
              alt={image.label}
              fill
              sizes="100vw"
              className="object-cover"
              priority={idx === 0}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        </div>
      ))}

      {/* Content overlay */}
      <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 md:p-8 text-white z-10">
        <div className="flex items-center gap-2 sm:gap-3 mb-2">
          <ClubLogo className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 object-contain flex-shrink-0" />
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Judoclub Michigami</h1>
            <p className="text-white/80 text-xs sm:text-sm">Steenbergen • Opgericht in 1993</p>
          </div>
        </div>
        <p className="text-white/90 text-sm sm:text-base font-medium mt-1">
          {heroImages[current].label}
        </p>
      </div>

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
  );
}
