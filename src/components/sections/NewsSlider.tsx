'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import type { NewsArticle } from '@/data/news-archive';

const SLIDE_INTERVAL = 5000;

export function NewsSlider({ articles, onNavigate }: { articles: NewsArticle[]; onNavigate?: () => void }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [direction, setDirection] = useState(0);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
      className="relative overflow-hidden rounded-2xl shadow-sm border border-gray-100 backdrop-blur-xl bg-white/80 transition-all hover:shadow-lg hover:shadow-red-100/30 group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#fdf6f6] via-white/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

      {/* Header bar */}
      <div className="relative px-4 py-3 border-b border-gray-100/50 flex items-center justify-between">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <Sparkles className="w-4 h-4" style={{ color: '#c00000' }} /> Nieuws
        </h3>
        {onNavigate && (
          <button onClick={onNavigate} className="text-xs font-medium hover:underline" style={{ color: '#c00000' }}>
            Alles →
          </button>
        )}
      </div>

      {/* Slider viewport */}
      <div className="relative p-4" style={{ minHeight: total > 1 ? 220 : undefined }}>
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
            {/* Article card */}
            <div className="flex gap-4">
              {article.imageUrl && (
                <div className="w-28 h-32 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 relative shadow-sm">
                  <Image
                    src={article.imageUrl}
                    alt={article.title}
                    fill
                    sizes="112px"
                    className="object-cover"
                    loading="lazy"
                  />
                </div>
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
    </div>
  );
}
