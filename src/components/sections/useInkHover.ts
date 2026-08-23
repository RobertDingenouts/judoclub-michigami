'use client';

import { useCallback } from 'react';

/**
 * useInkHover — koppelt de cursor-positie van een kaart aan de CSS-variabelen
 * --ink-x / --ink-y die de `.ink-bloom`-class (globals.css) volgt.
 *
 * Werkt via `e.currentTarget` (het element zelf), dus je hoeft géén ref te
 * managen — de hook kan naast een bestaande inView-ref op hetzelfde element
 * blijven. Alleen de muis triggerd de bloem (touch/pencil → stil).
 *
 * Gebruik:
 *   const inkHover = useInkHover();
 *   <div className="ink-card ink-bloom" onPointerMove={inkHover}>…</div>
 */
export function useInkHover() {
  return useCallback((e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType !== 'mouse') return;
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--ink-x', `${e.clientX - rect.left}px`);
    el.style.setProperty('--ink-y', `${e.clientY - rect.top}px`);
  }, []);
}
