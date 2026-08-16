'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import type { NewsArticle } from '@/data/news-archive';
import { ImageLightbox } from '@/components/ui/ImageLightbox';

const SLIDE_INTERVAL = 5000;

export function NewsSlider({ articles, onNavigate }: { articles: NewsArticle[]; onNavigate?: () => void }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [direction, setDirection] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Collect all image URLs for lightbox navigation
  const allImageUrls = articles
    .map((a) => a.imageUrl)
    .filter((url): url is string => !!url);

  const total = articles.length;
  if (total === 0) return null;

  const goTo = useCallback((index: number) => {
    setDirection(index > current ? 1 : index < current ? -1 : 0);
    setCurrent(index);
  }, [current]);

  const goNext = useCallback(() => {
    goTo((current + 1) % total);
  }, [current, total, goTo]);

  const goPrev = useCallback(() => {
    goTo((current - 1 + total) % total);
  }, [current, total, goTo]);

  // Auto-play with pause on hover / touch
  useEffect(() => {
    if (paused || total <= 1) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      return;
    }
    timerRef.current = setInterval(goNext, SLIDE_INTERVAL);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [paused, total, goNext]);

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    setPaused(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    // Only horizontal swipe (ignore vertical scroll)
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      if (dx < 0) goNext();
      else goPrev();
    }
    setPaused(false);
  };

  // Mouse hover pause
  const handleMouseEnter = () => setPaused(true);
  const handleMouseLeave = () => setPaused(false);

  const article = articles[current];

  return (
    <div
      className="relative overflow-hidden transition-all group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header bar */}
      <div className="px-4 py-3 border-b border-[#2a2a2a]/10 flex items-center justify-between">
        <h3 className="font-bold text-[#1c1915] flex items-center gap-2 section-title">
          <Sparkles className="w-4 h-4" style={{ color: '#a90000' }} /> Nieuws
        </h3>
        {onNavigate && (
          <button onClick={onNavigate} className="text-xs font-medium hover:underline" style={{ color: '#a90000' }}>
            Alles →
          </button>
        )}
      </div>

      {/* Slider viewport */}
      <div className="relative p-4" style={{ minHeight: total > 1 ? 150 : undefined }}>
        <AnimatePresence custom={direction}>
          <motion.div
            key={current}
            initial={{ x: direction >= 0 ? '100%' : '-100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction >= 0 ? '-100%' : '100%', opacity: 0 }}
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.45 },
            }}
            className="relative"
          >
            {/* Article card — clickable to navigate to news section */}
            <div
              className="flex gap-4 cursor-pointer"
              onClick={() => onNavigate?.()}
            >
              {article.imageUrl && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const idx = allImageUrls.indexOf(article.imageUrl!);
                    if (idx >= 0) setLightboxIndex(idx);
                  }}
                  className="group/thumb relative aspect-square w-28 flex-shrink-0 rounded-xl overflow-hidden shadow-sm cursor-pointer"
                >
                  {/* Blurred background layer */}
                  <div className="absolute inset-0">
                    <Image
                      src={article.imageUrl}
                      alt=""
                      fill
                      sizes="112px"
                      className="object-cover blur-xl scale-125"
                      loading="lazy"
                      quality={40}
                    />
                  </div>
                  {/* Sharp foreground image */}
                  <div className="absolute inset-0">
                    <Image
                      src={article.imageUrl}
                      alt={article.title}
                      fill
                      sizes="112px"
                      className="object-cover transition-transform duration-300 group-hover/thumb:scale-105"
                      loading="lazy"
                    />
                  </div>
                  {/* Zoom overlay hint */}
                  <div className="absolute inset-0 bg-black/0 group-hover/thumb:bg-black/20 transition-colors flex items-center justify-center">
                    <svg className="w-5 h-5 text-white opacity-0 group-hover/thumb:opacity-80 transition-opacity drop-shadow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                </button>
              )}
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <h4 className="text-base font-bold text-gray-800 leading-snug line-clamp-3">
                  {article.title}
                </h4>
                <p className="text-xs text-gray-400 mt-2">{article.date || ''}</p>
                {article.content && (
                  <p className="text-sm text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">
                    {article.content.split('\n')[0]}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation arrows — desktop only */}
      {total > 1 && (
        <>
          <button
            onClick={goPrev}
            className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow-md items-center justify-center hover:bg-white transition-colors z-10 opacity-0 group-hover:opacity-100"
            aria-label="Vorige nieuwsbericht"
          >
            <ChevronLeft className="w-4 h-4 text-[#8c0000]" />
          </button>
          <button
            onClick={goNext}
            className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow-md items-center justify-center hover:bg-white transition-colors z-10 opacity-0 group-hover:opacity-100"
            aria-label="Volgende nieuwsbericht"
          >
            <ChevronRight className="w-4 h-4 text-[#8c0000]" />
          </button>
        </>
      )}

      {/* Dots navigation */}
      {total > 1 && (
        <div className="relative px-4 pb-3 flex items-center justify-between">
          <div className="flex gap-1.5">
            {articles.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goTo(idx)}
                className={`rounded-full transition-all duration-300 ${
                  idx === current
                    ? 'bg-[#c00000] w-5 h-2'
                    : 'bg-gray-300 hover:bg-gray-400 w-2 h-2'
                }`}
                aria-label={`Nieuwsbericht ${idx + 1}`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-400">
            {current + 1} / {total}
          </span>
        </div>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <ImageLightbox
          images={allImageUrls}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
}
