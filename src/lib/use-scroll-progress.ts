'use client';

import { useEffect, useState, type RefObject } from 'react';

/**
 * Scroll-progress (0..1) voor een element, gemeten binnen de
 * ScrollArea-viewport van de site (niet het venster).
 *
 * startFrac/endFrac: viewport-fracties waarop progress respectievelijk
 * 0 en 1 is (element-top raakt de startlijn, element-bottom raakt de
 * eindlijn).
 */
export function useScrollProgress(
  ref: RefObject<HTMLElement | null>,
  startFrac: number,
  endFrac: number,
): number {
  const [p, setP] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const container = (
      el.closest('[data-slot="scroll-area-viewport"]') as HTMLElement | null
    );

    let raf = 0;
    const compute = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const s = vh * startFrac - rect.top;
      const d = rect.height + vh * (startFrac - endFrac);
      const next = d > 0 ? Math.min(1, Math.max(0, s / d)) : 0;
      setP((prev) => (Math.abs(prev - next) < 0.0015 ? prev : next));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(compute); };

    compute();
    container?.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      container?.removeEventListener('scroll', onScroll);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [ref, startFrac, endFrac]);

  return p;
}
