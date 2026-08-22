'use client';

import { useEffect, useState, type RefObject } from 'react';

/**
 * Scroll-progress (0..1) voor elementen binnen de Radix ScrollArea-viewport.
 *
 * Waarom niet framer-motion's useScroll? Die luistert standaard naar het
 * venster — maar de secties van deze site scrollen binnen de
 * [data-slot="scroll-area-viewport"]-container, dus window-scroll-events
 * komen nooit. Deze hook zoekt zelf de dichtstbijzijnde scroll-container
 * en rekent de progress lokaal uit.
 *
 * @param ref        element waarvan de progress gemeten wordt
 * @param startFrac  viewport-fractie waarbij progress 0 is (element-top raakt deze lijn)
 * @param endFrac    viewport-fractie waarbij progress 1 is (element-bottom raakt deze lijn)
 */
export function useZenProgress(
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
      const s = vh * startFrac - rect.top;          // afstand voorbij startlijn
      const d = rect.height + vh * (startFrac - endFrac); // totale reisafstand
      const next = d > 0 ? Math.min(1, Math.max(0, s / d)) : 0;
      setP((prev) => (Math.abs(prev - next) < 0.002 ? prev : next));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(compute); };

    compute();
    // Luister op de container én op window (fallback buiten de ScrollArea)
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
