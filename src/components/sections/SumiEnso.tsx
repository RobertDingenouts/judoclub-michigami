'use client';

import { useEffect, useId, useRef } from 'react';
import { animate, motion, useInView, useMotionValue } from 'framer-motion';

/**
 * SumiEnso — een inkringsel (ensō) dat zich tekent alsof de kwast in één
 * adem de cirkel zet.
 *
 * Gedrag: zodra het ringel in beeld komt (useInView, once) animeert de
 * stroke-dashoffset van "niet getekend" naar de kleine opening over ~2,2s
 * met een kwast-achtige ease. Werkt in de Radix ScrollArea én bij mount
 * (als het direct zichtbaar is). Bij prefers-reduced-motion springt het
 * direct naar de getekende staat (geen animatie).
 *
 * De kwastvoering is ongelijkedikt via drie overlappende strokes (brede
 inkt-diffusie, hoofdkwast, en de "hikimoku" die iets achterloopt) + een
 ruwe fractaal-filter, zodat het organisch en niet vector-plat oogt.
 */
interface SumiEnsoProps {
  className?: string;
  /** Diameter in px (CSS). Default 240. */
  size?: number;
  /** Stroke-kleur. Default shu 600. */
  color?: string;
  /** Maximale stroke-dikte. Default 10. */
  weight?: number;
  /** Hoeveel van de cirkel wordt getekend (0-1). Default 0.92 = kleine opening. */
  sweep?: number;
  /** Rotatie van de opening (graden). Default -40. */
  rotate?: number;
  /** Duur van de teken-animatie in seconden. Default 2.2. */
  duration?: number;
}

export default function SumiEnso({
  className,
  size = 240,
  color = 'var(--shu-600, #a90000)',
  weight = 10,
  sweep = 0.92,
  rotate = -40,
  duration = 2.2,
}: SumiEnsoProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const inView = useInView(wrapRef, { amount: 0.25, once: true });

  const r = 42; // viewBox 100, straal 42 → omtrek ≈ 264
  const circumference = 2 * Math.PI * r;
  const finalOffset = circumference * (1 - sweep);

  const offset = useMotionValue(circumference);
  const offsetLag = useMotionValue(circumference * 1.06);

  useEffect(() => {
    if (!inView) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      offset.set(finalOffset);
      offsetLag.set(finalOffset + circumference * 0.05);
      return;
    }

    const controls = animate(offset, finalOffset, {
      duration,
      ease: [0.65, 0, 0.35, 1],
    });
    const controlsLag = animate(offsetLag, finalOffset + circumference * 0.05, {
      duration: duration * 1.05,
      ease: [0.65, 0, 0.35, 1],
    });
    return () => {
      controls.stop();
      controlsLag.stop();
    };
  }, [inView, finalOffset, circumference, duration, offset, offsetLag]);

  const uid = useId().replace(/:/g, '');
  const roughId = `enso-rough-${uid}`;
  const inkId = `enso-ink-${uid}`;

  return (
    <div
      ref={wrapRef}
      className={className}
      style={{ width: size, height: size, position: 'relative', pointerEvents: 'none' }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ overflow: 'visible' }}>
        <defs>
          {/* Ruwe kwastrand — fractaal ruis op de stroke */}
          <filter id={roughId} x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="noise" seed="7" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.2" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          {/* Inktverloop — donkerder in het midden van de "kwastslag" */}
          <linearGradient id={inkId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.55" />
            <stop offset="45%" stopColor={color} stopOpacity="0.95" />
            <stop offset="80%" stopColor={color} stopOpacity="0.75" />
            <stop offset="100%" stopColor={color} stopOpacity="0.35" />
          </linearGradient>
        </defs>
        <g transform={`rotate(${rotate} 50 50)`} filter={`url(#${roughId})`}>
          {/* Breed, zacht onderliggend laag (de inkt die in het papier trekt) */}
          <motion.circle
            cx="50" cy="50" r={r}
            fill="none"
            stroke={color}
            strokeOpacity="0.14"
            strokeWidth={weight * 1.9}
            strokeLinecap="round"
            strokeDasharray={circumference}
            style={{ strokeDashoffset: offset }}
          />
          {/* Hoofd-kwastslag */}
          <motion.circle
            cx="50" cy="50" r={r}
            fill="none"
            stroke={`url(#${inkId})`}
            strokeWidth={weight}
            strokeLinecap="round"
            strokeDasharray={circumference}
            style={{ strokeDashoffset: offset }}
          />
          {/* Dikke "hikimoku" — de plaats waar de kwast de inkt oplaadt */}
          <motion.circle
            cx="50" cy="50" r={r}
            fill="none"
            stroke={color}
            strokeOpacity="0.5"
            strokeWidth={weight * 0.55}
            strokeLinecap="round"
            strokeDasharray={circumference}
            style={{ strokeDashoffset: offsetLag }}
          />
        </g>
      </svg>
    </div>
  );
}
