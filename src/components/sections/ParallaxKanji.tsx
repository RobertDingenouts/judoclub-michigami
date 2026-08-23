'use client';

import { useRef, type CSSProperties } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

/**
 * ParallaxKanji — een groot, vaag achtergrond-kanji dat in eigen tempo
 * meebeweegt met het scrollen (parallax) en zacht fade-in/out op de
 * randen van zijn bereik. Geept de sectie diepte: de kanji "leeft"
 * achter de washi zonder de tekst te storen.
 *
 * Werkt met de Radix ScrollArea (useScroll op de eigen wrapper).
 * Bij prefers-reduced-motion staat de parallax stil (CSS-override).
 */
interface ParallaxKanjiProps {
  kanji: string;
  /** Klassenaampjes voor positie/maat/kleur (Tailwind + custom). */
  className?: string;
  style?: CSSProperties;
  /** Hoeveel px het element meebeweegt t.o.v. de scroll (parallax). Default 60. */
  depth?: number;
  /** Opacity piek in het midden van het bereik. Default 1 (× basis-alpha). */
  peakOpacity?: number;
}

export default function ParallaxKanji({
  kanji,
  className = '',
  style,
  depth = 60,
  peakOpacity = 1,
}: ParallaxKanjiProps) {
  const ref = useRef<HTMLSpanElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // Parallax: van +depth (beneden) naar -depth (boven) over het bereik.
  const y = useTransform(scrollYProgress, [0, 1], [depth, -depth]);
  // Fade: onzichtbaar aan beide randen, piek in het midden.
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.25, 0.5, 0.75, 1],
    [0, peakOpacity, peakOpacity, peakOpacity, 0]
  );

  return (
    <motion.span
      ref={ref}
      className={`kanji-ghost kanji-float ${className}`}
      style={{ ...style, y, opacity }}
      aria-hidden="true"
    >
      {kanji}
    </motion.span>
  );
}
