'use client';

import { useState } from 'react';
import { galleryData, type GalleryImage } from '@/data/gallery';
import { ChevronDown, ChevronUp } from 'lucide-react';

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
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7-7-7 7" />
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
  const [expandedAlbums, setExpandedAlbums] = useState<Set<string>>(new Set());

  // Sorteer op jaartal — jongste bovenaan (Archive altijd onderaan)
  const sortedAlbums = [...galleryData].sort((a, b) => {
    if (a.title === 'Archive') return 1;
    if (b.title === 'Archive') return -1;
    return b.title.localeCompare(a.title);
  });

  const toggleAlbum = (id: string) => {
    setExpandedAlbums(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#a90000] to-[#8c0000] rounded-2xl p-4 sm:p-5 md:p-6 lg:p-8 text-white shadow-lg relative overflow-hidden">
        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold truncate">Foto&apos;s</h1>
        <p className="text-white/80 mt-1 text-xs sm:text-sm">
          Beelden van onze judoclub, toernooien en evenementen
        </p>
        <div className="w-10 sm:w-12 md:w-16 h-0.5 sm:h-1 bg-white/30 rounded-full mt-2 sm:mt-3" />
      </div>

      {/* Gallery Albums — jongste bovenaan */}
      <div className="space-y-4">
        {sortedAlbums.map((album) => {
          const isExpanded = expandedAlbums.has(album.id);
          const thumbnail = album.images[0];

          return (
            <div key={album.id} className="bg-white rounded-2xl shadow-sm border border-[#e8eaed] overflow-hidden">
              {/* Album header — clickbaar om te openen/sluiten */}
              <button
                onClick={() => toggleAlbum(album.id)}
                className="w-full flex items-center gap-4 p-4 hover:bg-[#fdf6f6] transition-colors text-left"
              >
                {/* Thumbnail */}
                {thumbnail && (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 bg-[#f5f5f0] border border-[#e8eaed]">
                    <img
                      src={thumbnail.src}
                      alt={album.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg sm:text-xl font-bold text-[#8c0000]">{album.title}</h2>
                  <p className="text-sm text-gray-500 mt-0.5">{album.images.length} foto&apos;s</p>
                </div>

                {/* Toggle icon */}
                <div className="flex-shrink-0 text-gray-400">
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </div>
              </button>

              {/* Expanded content */}
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
