'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';

/**
 * Gedeelde lightbox met swipe-carousel (foto beweegt mee met de vinger),
 * wrap-around, buur-preload en portal naar body (position:fixed is anders
 * gebroken binnen getransformeerde sectie-ancestors).
 */
export function ImageLightbox({
  images,
  initialIndex,
  onClose,
}: {
  images: string[];
  initialIndex: number;
  onClose: () => void;
}) {
  // Onbeperkte index (wrap-around via modulo-afleiding)
  const [index, setIndex] = useState(initialIndex);
  const [loadedIdxs, setLoadedIdxs] = useState<Set<number>>(new Set());
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const draggingRef = useRef(false);
  const startXRef = useRef(0);
  const dragXRef = useRef(0);
  const widthRef = useRef(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const n = images.length;
  const at = (i: number) => images[((i % n) + n) % n];

  const changeIndex = (delta: number) => setIndex((i) => i + delta);

  // ── Slide-animatie in twee fases (zelfde als PhotoGallery) ────────────
  const [pos, setPos] = useState(initialIndex);
  const [settle, setSettle] = useState(0);
  const [instant, setInstant] = useState(false);

  useEffect(() => {
    if (!settle) return;
    const t = setTimeout(() => {
      setInstant(true);
      setPos(index);
      setSettle(0);
      requestAnimationFrame(() => requestAnimationFrame(() => setInstant(false)));
    }, 440);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settle]);

  const settling = settle !== 0;
  const goTo = (delta: number) => {
    if (settling || n <= 1) return;
    changeIndex(delta);
    setSettle(delta);
  };

  const endDrag = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setDragging(false);
    const dx = dragXRef.current;
    const threshold = Math.max(50, widthRef.current * 0.18);
    if (dx <= -threshold) goTo(1);
    else if (dx >= threshold) goTo(-1);
    dragXRef.current = 0;
    setDragX(0);
    detach();
  };

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
    window.addEventListener('pointermove', onWinMove);
    window.addEventListener('pointerup', onWinUp);
    window.addEventListener('pointercancel', onWinUp);
  };
  const detach = () => {
    window.removeEventListener('pointermove', onWinMove);
    window.removeEventListener('pointerup', onWinUp);
    window.removeEventListener('pointercancel', onWinUp);
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

  // Gecachete foto's vuurt soms geen onLoad meer — daarom bijhouden welke
  // indexen geladen zijn en nooit globaal resetten.
  const markLoaded = (i: number) =>
    setLoadedIdxs(prev => prev.has(i) ? prev : new Set(prev).add(i));
  const currentLoaded = loadedIdxs.has(((index % n) + n) % n);

  // Buur-foto's vooraf laden
  useEffect(() => {
    for (const off of [-1, 1, -2, 2]) {
      const src = at(index + off);
      if (!src) continue;
      const pre = new window.Image();
      pre.src = src;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  // Listeners opruimen bij unmount
  useEffect(() => {
    return () => {
      draggingRef.current = false;
      detach();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Toetsen: Escape sluit, pijltjes navigeren (via goTo voor de animatie)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') goTo(-1);
      else if (e.key === 'ArrowRight') goTo(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const overlay = (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center"
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
      {n > 1 && (
        <div className="absolute top-4 sm:top-5 left-1/2 -translate-x-1/2 z-20 text-white/60 text-xs sm:text-sm tabular-nums px-3 py-1 rounded-full bg-black/30">
          {counter} / {n}
        </div>
      )}

      {/* Swipe-track */}
      <div
        ref={trackRef}
        className="w-full flex-1 overflow-hidden touch-none select-none"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={onPointerDown}
      >
        <div
          className="flex h-full"
          style={{
            // Drie fysieke posities (zelfde twee-fases-mechaniek als
            // PhotoGallery): idle −100%, settle+1 → −200%, settle−1 → 0%.
            transform: `translateX(calc(${settle === 0 ? -100 : settle === 1 ? -200 : 0}% + ${dragX}px))`,
            transition: (dragging || instant) ? 'none' : 'transform 0.42s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          {[-1, 0, 1].map((off) => (
            <div
              key={off}
              className="w-full flex-shrink-0 h-full relative flex items-center justify-center px-2 sm:px-8"
            >
              <Image
                src={at(pos + off)}
                alt={`Foto ${(((pos + off) % n) + n) % n + 1}`}
                fill
                sizes="100vw"
                priority={off === 0}
                loading="eager"
                onLoad={() => { if (off === 0) markLoaded((((pos % n) + n) % n)); }}
                className="object-contain rounded-md shadow-2xl"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Lading-indicator */}
      {!currentLoaded && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="w-10 h-10 rounded-full border-2 border-white/20 border-t-white/80 animate-spin" />
        </div>
      )}

      {/* Vorige / volgende (desktop) */}
      {n > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); goTo(-1); }}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white z-20 p-2"
            aria-label="Vorige"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); goTo(1); }}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white z-20 p-2"
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

  if (typeof document === 'undefined') return null;
  return createPortal(overlay, document.body);
}
