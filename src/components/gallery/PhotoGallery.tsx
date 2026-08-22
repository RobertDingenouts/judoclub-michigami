'use client';

import { useState, useRef, useEffect } from 'react';
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
  // Onbeperkte index (geen modulo) zodat de carousel-track soepel kan
  // meeglijden; de foto-content wordt modulo-afgeleid.
  const [index, setIndex] = useState(initialIndex);
  // Gelukt/mislukt per bron-URL (Set i.p.v. één waarde): elke foto houdt
  // zijn eigen status, ook bij snel doorswipen.
  const [loadedSrcs, setLoadedSrcs] = useState<Set<string>>(new Set());
  const [failedSrcs, setFailedSrcs] = useState<Set<string>>(new Set());
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  // Mutable drag-state in refs: React-state is asynchroon, dus een
  // pointermove direct na pointerdown zou anders op een stale `dragging`
  // (nog false) controleren en de move negeren.
  const draggingRef = useRef(false);
  const startXRef = useRef(0);
  const dragXRef = useRef(0);
  const widthRef = useRef(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const n = images.length;
  const at = (i: number) => images[((i % n) + n) % n];
  const current = at(index);

  // Hoogere-resolutie versie voor de lightbox (x.jpg → x_orig.jpg);
  // valt terug op de kleine versie zodra die bron faalde.
  const srcFor = (img: GalleryImage) => {
    const full = img.fullSrc ?? fullResSrc(img.src);
    return failedSrcs.has(full) ? img.src : full;
  };
  const markLoaded = (src: string) =>
    setLoadedSrcs(prev => {
      if (prev.has(src)) return prev;
      const next = new Set(prev);
      next.add(src);
      return next;
    });

  const changeIndex = (delta: number) => setIndex((i) => i + delta);

  // Window-level drag: tijdens de drag volgen we de vinger overal (ook
  // buiten de track), dus pointer-capture is niet nodig — dat kan op
  // sommige mobile browsers een pointercancel uitlokken.
  const endDrag = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setDragging(false);
    const dx = dragXRef.current;
    const threshold = Math.max(50, widthRef.current * 0.18);
    if (dx <= -threshold) changeIndex(1);
    else if (dx >= threshold) changeIndex(-1);
    dragXRef.current = 0;
    setDragX(0);
    detach();
  };

  // Stabiele wrapper-functies (zelfde referentie over renders heen) die
  // via een ref naar de actuele handler wijzen. Zo werkt
  // removeEventListener betrouwbaar — anders zou elke render een nieuw
  // functie-object maken en de listener nooit verwijderd worden.
  const moveRef = useRef<(e: PointerEvent) => void>(() => {});
  const upRef = useRef<() => void>(() => {});
  moveRef.current = (e: PointerEvent) => {
    if (!draggingRef.current) return;
    const dx = e.clientX - startXRef.current;
    dragXRef.current = dx;
    setDragX(dx);
  };
  upRef.current = () => endDrag();

  const onWinMove = useRef((e: PointerEvent) => moveRef.current(e)).current;
  const onWinUp = useRef(() => upRef.current()).current;

  const attach = () => {
    window.addEventListener("pointermove", onWinMove);
    window.addEventListener("pointerup", onWinUp);
    window.addEventListener("pointercancel", onWinUp);
  };
  const detach = () => {
    window.removeEventListener("pointermove", onWinMove);
    window.removeEventListener("pointerup", onWinUp);
    window.removeEventListener("pointercancel", onWinUp);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (n <= 1) return;
    draggingRef.current = true;
    startXRef.current = e.clientX;
    dragXRef.current = 0;
    widthRef.current = trackRef.current?.offsetWidth ?? window.innerWidth;
    setDragging(true);
    setDragX(0);
    attach();
  };

  const counter = ((index % n) + n) % n + 1;

  // Spinner-status: de actieve foto is "klaar" als zijn bron geladen is.
  // Belangrijk: een gecachete browser-foto vuurt soms géén onLoad-event
  // meer — daarom checken we ook of de bron al in loadedSrcs zit vóór we
  // de spinner tonen, en resetten we nooit globaal bij index-wissel.
  const currentSrc = srcFor(current);
  const currentLoaded = loadedSrcs.has(currentSrc);

  // Buur-foto's vooraf laden: bij snel doorswipen staat de volgende foto
  // dan al in de cache in plaats van pas te beginnen na de render.
  // Fouten worden genegeerd (de carousel heeft al een fallback per foto).
  useEffect(() => {
    for (const off of [-1, 1, -2, 2]) {
      const img = at(index + off);
      if (!img) continue;
      const pre = new window.Image();
      pre.src = img.fullSrc ?? fullResSrc(img.src);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  // Bij unmount (lightbox sluit) eventuele actieve window-listeners opruimen.
  useEffect(() => {
    return () => {
      draggingRef.current = false;
      detach();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 bg-[var(--sumi-950)]/92 backdrop-blur-sm flex flex-col items-center justify-center"
      onClick={onClose}
    >
      {/* Sluiten */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 sm:top-4 sm:right-4 text-white/70 hover:text-white z-20 p-2"
        aria-label="Sluiten"
      >
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Teller */}
      <div className="absolute top-4 sm:top-5 left-1/2 -translate-x-1/2 z-20 text-white/60 text-xs sm:text-sm tabular-nums px-3 py-1 rounded-full bg-black/30">
        {counter} / {n}
      </div>

      {/* Swipe-track — foto beweegt mee met de vinger, volgende glijdt in */}
      <div
        ref={trackRef}
        className="w-full flex-1 overflow-hidden touch-none select-none"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={onPointerDown}
      >
        <div
          className="flex h-full"
          style={{
            // Slides staan vast als [vorige, huidige, volgende]; de viewport
            // toont altijd de MIDDELSTE (−100%). Zo zie je bij openen direct
            // de aangeklikte foto (een track op −index*100% toonde bij
            // index=0 per ongeluk de laatste foto van het album).
            transform: `translateX(calc(-100% + ${dragX}px))`,
            transition: dragging ? 'none' : 'transform 0.42s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          {[-1, 0, 1].map((off) => {
            const item = at(index + off);
            const isCurrent = off === 0;
            return (
              <div
                key={off}
                className="w-full flex-shrink-0 h-full relative flex items-center justify-center px-2 sm:px-8"
              >
                <Image
                  src={srcFor(item)}
                  alt={item.caption}
                  fill
                  sizes="100vw"
                  priority={isCurrent}
                  loading="eager"
                  onLoad={() => markLoaded(srcFor(item))}
                  className="object-contain rounded-md shadow-2xl"
                  onError={() => {
                    const full = item.fullSrc ?? fullResSrc(item.src);
                    setFailedSrcs(prev => {
                      if (prev.has(full)) return prev;
                      const next = new Set(prev);
                      next.add(full);
                      return next;
                    });
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Lading-indicator: geen "leeg donker scherm" tijdens het laden */}
      {!currentLoaded && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="w-10 h-10 rounded-full border-2 border-white/20 border-t-white/80 animate-spin" />
        </div>
      )}

      {/* Bijschrift */}
      <p className="z-20 text-[var(--washi-100)]/90 mt-2 sm:mt-3 mb-3 sm:mb-5 text-sm text-center px-14 max-w-2xl leading-snug">
        {current.caption}
      </p>

      {/* Vorige / Volgende (vooral desktop; op mobiel werkt swipe) */}
      {n > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); changeIndex(-1); }}
            className="absolute left-1 sm:left-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white p-2 z-10"
            aria-label="Vorige"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); changeIndex(1); }}
            className="absolute right-1 sm:right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white p-2 z-10"
            aria-label="Volgende"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}

export function PhotoGallery() {
  const [lightbox, setLightbox] = useState<{ images: GalleryImage[]; index: number; openId: number } | null>(null);
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
                      onImageClick={(images, index) => setLightbox({ images, index, openId: Date.now() })}
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
          opgevangen wordt door de transform van de sectie-overgang.
          key forceert een verse mount per opening (state altijd schoon). */}
      {lightbox && typeof document !== 'undefined' &&
        createPortal(
          <Lightbox
            key={lightbox.openId}
            images={lightbox.images}
            initialIndex={lightbox.index}
            onClose={() => setLightbox(null)}
          />,
          document.body
        )}
    </div>
  );
}
