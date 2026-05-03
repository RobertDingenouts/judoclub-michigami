'use client';

import { useState } from 'react';
import { galleryData, type GalleryImage } from '@/data/gallery';

function ImageGrid({ images, onImageClick }: { images: GalleryImage[]; onImageClick: (images: GalleryImage[], index: number) => void }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {images.map((img, idx) => (
        <button
          key={idx}
          onClick={() => onImageClick(images, idx)}
          className="group relative aspect-square overflow-hidden rounded-xl bg-[#f5f5f0] border border-[#e8eaed] hover:border-[#a90000] transition-all duration-200 hover:shadow-md"
        >
          <img
            src={img.src}
            alt={img.caption}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          <p className="absolute bottom-0 left-0 right-0 p-2 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-center truncate">
            {img.caption}
          </p>
        </button>
      ))}
    </div>
  );
}

function Lightbox({
  images,
  initialIndex,
  onClose,
}: {
  images: GalleryImage[];
  initialIndex: number;
  onClose: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const current = images[currentIndex];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/80 hover:text-white z-10"
        aria-label="Sluiten"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <button
        onClick={(e) => { e.stopPropagation(); setCurrentIndex((currentIndex - 1 + images.length) % images.length); }}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2"
        aria-label="Vorige"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={(e) => { e.stopPropagation(); setCurrentIndex((currentIndex + 1) % images.length); }}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2"
        aria-label="Volgende"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <div className="max-w-4xl max-h-[80vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
        <img
          src={current.src}
          alt={current.caption}
          className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl"
        />
        <p className="text-white/80 mt-3 text-sm text-center">{current.caption}</p>
        <p className="text-white/50 mt-1 text-xs">
          {currentIndex + 1} / {images.length}
        </p>
      </div>
    </div>
  );
}

export function PhotoGallery() {
  const [lightbox, setLightbox] = useState<{ images: GalleryImage[]; index: number } | null>(null);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#a90000] to-[#8c0000] rounded-2xl p-4 sm:p-5 md:p-6 lg:p-8 text-white shadow-lg relative overflow-hidden">
        <svg
          viewBox="0 0 100 80"
          className="absolute top-0 right-0 w-20 sm:w-24 md:w-32 h-20 sm:h-24 md:h-32 text-white opacity-[0.06]"
          fill="currentColor"
        >
          <rect x="5" y="8" width="90" height="6" rx="2" />
          <rect x="12" y="18" width="76" height="4" rx="1" />
          <rect x="20" y="18" width="6" height="58" rx="1" />
          <rect x="74" y="18" width="6" height="58" rx="1" />
        </svg>
        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold truncate">Foto&apos;s</h1>
        <p className="text-white/80 mt-1 text-xs sm:text-sm">
          Beelden van onze judoclub, toernooien en evenementen
        </p>
        <div className="w-10 sm:w-12 md:w-16 h-0.5 sm:h-1 bg-white/30 rounded-full mt-2 sm:mt-3" />
      </div>

      {/* Gallery Albums */}
      <div className="space-y-8">
        {galleryData.map((album) => (
          <div key={album.id}>
            <h2 className="text-xl sm:text-2xl font-bold text-[#8c0000] mb-4">{album.title}</h2>
            <ImageGrid
              images={album.images}
              onImageClick={(images, index) => setLightbox({ images, index })}
            />
          </div>
        ))}
      </div>

      {/* Footer note */}
      <div className="bg-[#fdf6f6] rounded-2xl p-4 sm:p-5 border border-[#e8eaed]">
        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
          Heb jij leuke foto&apos;s die je op onze site wilt zetten? Stuur dan een{' '}
          <a href="mailto:judoclub_michigami@hotmail.com" className="text-[#a90000] hover:text-[#8c0000] underline font-semibold">
            e-mail
          </a>{' '}
          naar judoclub_michigami@hotmail.com met de foto&apos;s als bijlage, of bespreek het even tijdens de les.
        </p>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <Lightbox
          images={lightbox.images}
          initialIndex={lightbox.index}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
}
