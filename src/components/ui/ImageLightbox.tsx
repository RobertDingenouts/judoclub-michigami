'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';

export function ImageLightbox({
  images,
  initialIndex,
  onClose,
}: {
  images: string[];
  initialIndex: number;
  onClose: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const overlay = (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/80 hover:text-white z-10"
        aria-label="Sluiten"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Prev button */}
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); setCurrentIndex((currentIndex - 1 + images.length) % images.length); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2"
          aria-label="Vorige"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Next button */}
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); setCurrentIndex((currentIndex + 1) % images.length); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2"
          aria-label="Volgende"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7-7-7 7" />
          </svg>
        </button>
      )}

      {/* Image */}
      <div className="w-full max-w-4xl max-h-[85vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
        <div className="relative w-full max-w-3xl h-[62vh] max-h-[62vh] flex items-center justify-center">
          <Image
            src={images[currentIndex]}
            alt={`Foto ${currentIndex + 1}`}
            fill
            sizes="(max-width: 1280px) 100vw, 1280px"
            loading="eager"
            className="object-contain rounded-lg shadow-2xl"
          />
        </div>
        {images.length > 1 && (
          <p className="text-white/50 mt-3 text-xs">
            {currentIndex + 1} / {images.length}
          </p>
        )}
      </div>
    </div>
  );

  // Portal naar body: position:fixed wordt anders opgevangen door een
  // transform op een ancestor (sectie-overgang) en de overlay dekt dan
  // niet de viewport maar de hele sectie.
  if (typeof document === 'undefined') return null;
  return createPortal(overlay, document.body);
}
