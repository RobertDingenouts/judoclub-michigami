'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const heroImages = [
  '/hero/michigami-25jaar-1.jpg',
  '/hero/budodag-actie-1.jpg',
  '/hero/heerle-toernooi-1.jpg',
  '/hero/dojo-2024.jpg',
];

function ClubLogo({ className = "", alt = "Judoclub Michigami" }: { className?: string; alt?: string }) {
  return <Image src="/logo.png" alt={alt} width={64} height={64} className={className} />;
}

export function HeroSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-48 sm:h-56 md:h-72 lg:h-80 overflow-hidden rounded-2xl">
      {heroImages.map((src, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            idx === current ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="relative w-full h-full">
          <Image
            src={src}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
            priority
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
      </div>

      {/* Dots */}
      <div className="absolute bottom-3 right-4 sm:bottom-4 sm:right-6 flex gap-1.5 z-20">
        {heroImages.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`w-2 h-2 rounded-full transition-all ${
              idx === current ? 'bg-white w-5' : 'bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
