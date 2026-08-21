'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { galleryData, type GalleryImage, fullResSrc } from '@/data/gallery';
import { ChevronDown, ChevronUp, Camera } from 'lucide-react';

function ImageGrid({ images, onImageClick }: { images: GalleryImage[]; onImageClick: (images: GalleryImage[], index: number) => void }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {images.map((img, idx) => (
        <button
          key={idx}
          onClick={() => onImageClick(images, idx)}
          className="group relative h-44 sm:h-56 md:h-48 overflow-hidden rounded-md bg-[var(--washi-200)] border border-[var(--washi-300)] hover:border-[var(--shu-600)] transition-all duration-200 hover:shadow-lg hover:shadow-[var(--sumi-900)]/10"
        >
          <Image
            src={img.src}
            alt={img.caption}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--sumi-950)]/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          <p className="absolute bottom-0 left-0 right-0 p-2 text-[var(--washi-50)] text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-center truncate">
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
  const [errorSrc, setErrorSrc] = useState<string | null>(null);
  const current = images[currentIndex];

  // Hoogere-resolutie versie voor de lightbox (x.jpg → x_orig.jpg).
  const lightboxSrc = errorSrc ?? (current.fullSrc ?? fullResSrc(current.src));

  const changeIndex = (delta: number) => {
    setCurrentIndex((i) => (i + delta + images.length) % images.length);
    setErrorSrc(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[var(--sumi-950)]/90 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/70 hover:text-white z-10 p-2"
        aria-label="Sluiten"
      >
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <button
        onClick={(e) => { e.stopPropagation(); changeIndex(-1); }}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2"
        aria-label="Vorige"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); changeIndex(1); }}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2"
        aria-label="Volgende"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <div className="w-full max-w-4xl max-h-[85vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
        <div className="relative w-full max-w-3xl h-[62vh] max-h-[62vh] flex items-center justify-center">
          <Image
            key={lightboxSrc}
            src={lightboxSrc}
            alt={current.caption}
            fill
            sizes="(max-width: 1280px) 100vw, 1280px"
            loading="eager"
            className="object-contain rounded-md shadow-2xl"
            onError={() => {
              if (errorSrc !== current.src) setErrorSrc(current.src);
            }}
          />
        </div>
        <p className="text-[var(--washi-100)]/90 mt-3 text-sm text-center px-12">{current.caption}</p>
        <p className="text-white/40 mt-1 text-xs tabular-nums">
          {currentIndex + 1} / {images.length}
        </p>
      </div>
    </div>
  );
}

export function PhotoGallery() {
  const [lightbox, setLightbox] = useState<{ images: GalleryImage[]; index: number } | null>(null);
  const [expandedAlbums, setExpandedAlbums] = useState<Set<string>>(new Set());

  // Sorteer op order (Archive = 999, altijd onderaan).
  const sortedAlbums = [...galleryData].sort((a, b) => a.order - b.order);
  const totalPhotos = galleryData.reduce((s, a) => s + a.images.length, 0);

  const toggleAlbum = (id: string) => {
    setExpandedAlbums(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="ink-paper zen-fullbleed zen-scroll relative min-h-screen overflow-hidden">
      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-14">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-12">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[var(--shu-600)] border border-[var(--kin-400)]/40 mb-4">
            <Camera className="w-7 h-7 text-[var(--washi-50)]" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--sumi-900)] tracking-tight">Foto&apos;s</h1>
          <div className="w-16 h-0.5 bg-[var(--shu-600)] rounded-full mx-auto mt-4" />
          <p className="text-[var(--sumi-500)] mt-4 text-sm sm:text-base max-w-xl mx-auto">
            {totalPhotos} beelden van onze judoclub, toernooien en evenementen — van de eerste
            toernooien tot vandaag. Klik op een album om het te openen.
          </p>
        </div>

        {/* Gallery Albums */}
        <div className="space-y-4">
          {sortedAlbums.map((album) => {
            const isExpanded = expandedAlbums.has(album.id);
            const thumbnail = album.images[0];

            return (
              <div
                key={album.id}
                className="bg-[var(--washi-50)] rounded-lg shadow-sm border border-[var(--washi-300)] overflow-hidden transition-shadow hover:shadow-md"
              >
                {/* Album header — clickbaar om te openen/sluiten */}
                <button
                  onClick={() => toggleAlbum(album.id)}
                  className="w-full flex items-center gap-4 p-4 hover:bg-[var(--washi-100)] transition-colors text-left"
                >
                  {thumbnail && (
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-md overflow-hidden flex-shrink-0 bg-[var(--washi-200)] border border-[var(--washi-300)]">
                      <Image
                        src={thumbnail.src}
                        alt={album.title}
                        fill
                        sizes="(max-width: 640px) 80px, 80px"
                        className="object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h2 className="text-base sm:text-lg font-bold text-[var(--shu-700)] truncate">{album.title}</h2>
                    <p className="text-xs sm:text-sm text-[var(--sumi-500)] mt-0.5">
                      {album.images.length} foto{album.images.length !== 1 ? '\u2019s' : ''}
                    </p>
                  </div>

                  <div className="flex-shrink-0 text-[var(--sumi-400)]">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4">
                    <ImageGrid
                      images={album.images}
                      onImageClick={(images, index) => setLightbox({ images, index })}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer note */}
        <div className="mt-10 bg-[var(--washi-100)] rounded-lg p-5 border border-[var(--washi-300)]">
          <p className="text-sm text-[var(--sumi-700)] leading-relaxed">
            Heb jij leuke foto&apos;s die je op onze site wilt zetten? Stuur dan een{' '}
            <a href="mailto:judoclub_michigami@hotmail.com" className="text-[var(--shu-600)] hover:text-[var(--shu-700)] underline font-semibold">
              e-mail
            </a>{' '}
            naar judoclub_michigami@hotmail.com met de foto&apos;s als bijlage, of bespreek het even tijdens de les.
          </p>
        </div>
      </div>

      {/* Lightbox — via portal naar body, zodat position:fixed niet
          opgevangen wordt door de transform van de sectie-overgang. */}
      {lightbox && typeof document !== 'undefined' &&
        createPortal(
          <Lightbox
            images={lightbox.images}
            initialIndex={lightbox.index}
            onClose={() => setLightbox(null)}
          />,
          document.body
        )}
    </div>
  );
}
