'use client';

import { useEffect, useRef } from 'react';

/**
 * ZenInkField — een levend sumi-inktveld op canvas.
 *
 * Fijne inktdeeltjes drijven langzaam als inkt die in water verspreidt,
 * met een zacht "breathe" op de grootte. Een muis-aanwezigheid duwt de
 * deeltjes op een respectvolle afstand weg (geen harde stoten). Alles is
 * monochroom sumi met zeer lage alpha, zodat het achter de washi-achtergrond
 * als een ademend landschap staat zonder te storen.
 *
 * Prestatie: deeltjesaantal schaalt met oppervlak (met een cap), devicePixelRatio
 * is gekapt op 2, de rAF-lus pauzeert bij een verborgen tab, en bij
 * prefers-reduced-motion tekenen we één statisch frame (geen animatie).
 */
interface ZenInkFieldProps {
  className?: string;
  /** Basis dichtheid (deeltjes per ~100k px²). Default 1. */
  density?: number;
  /** Kleur van de inkt (rgb triplet). Default sumi 900. */
  ink?: [number, number, number];
  /** Maximale alpha van een deeltje. Default 0.10. */
  maxAlpha?: number;
}

interface Mote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;        // basis straal
  rPhase: number;   // fase voor breathe
  rSpeed: number;   // breathe snelheid
  alpha: number;    // basis alpha
  drift: number;    // langzame horizontale drift
}

export default function ZenInkField({
  className,
  density = 1,
  ink = [28, 25, 21],
  maxAlpha = 0.1,
}: ZenInkFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const [ir, ig, ib] = ink;
    let motes: Mote[] = [];
    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = 0;
    let running = false;
    let reduced = false;
    const pointer = { x: -9999, y: -9999, active: false };

    const makeMotes = () => {
      const target = Math.min(90, Math.max(18, Math.round(((w * h) / 100000) * density)));
      motes = Array.from({ length: target }, () => {
        const r = 0.6 + Math.random() * 2.4;
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.06,
          vy: -0.02 - Math.random() * 0.06,
          r,
          rPhase: Math.random() * Math.PI * 2,
          rSpeed: 0.004 + Math.random() * 0.008,
          alpha: 0.03 + Math.random() * (maxAlpha - 0.03),
          drift: (Math.random() - 0.5) * 0.02,
        };
      });
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = Math.max(1, rect.width);
      h = Math.max(1, rect.height);
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      makeMotes();
      if (reduced) drawFrame(0);
    };

    const drawFrame = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      for (const m of motes) {
        // Breathe — de straal pulst heel langzaam
        const breathe = 1 + Math.sin(t * m.rSpeed + m.rPhase) * 0.25;
        const rr = m.r * breathe;

        // Muis-afstoting — zachte, inverse-afstand kracht
        if (pointer.active) {
          const dx = m.x - pointer.x;
          const dy = m.y - pointer.y;
          const d2 = dx * dx + dy * dy;
          const radius = 130;
          if (d2 < radius * radius && d2 > 0.01) {
            const d = Math.sqrt(d2);
            const force = (1 - d / radius) * 0.35;
            m.vx += (dx / d) * force * 0.02;
            m.vy += (dy / d) * force * 0.02;
          }
        }

        // Integratie + drift
        m.x += m.vx + m.drift;
        m.y += m.vy;

        // Damping terug naar rust
        m.vx *= 0.985;
        m.vy *= 0.985;

        // Wrappen aan de randen (met marge)
        const pad = 24;
        if (m.x < -pad) m.x = w + pad;
        if (m.x > w + pad) m.x = -pad;
        if (m.y < -pad) m.y = h + pad;
        if (m.y > h + pad) m.y = -pad;

        // Tekenen — zachte inktvlek via radiale gradient
        const g = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, rr * 3);
        g.addColorStop(0, `rgba(${ir}, ${ig}, ${ib}, ${m.alpha})`);
        g.addColorStop(0.6, `rgba(${ir}, ${ig}, ${ib}, ${m.alpha * 0.4})`);
        g.addColorStop(1, `rgba(${ir}, ${ig}, ${ib}, 0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(m.x, m.y, rr * 3, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const loop = (t: number) => {
      if (!running) return;
      drawFrame(t);
      raf = requestAnimationFrame(loop);
    };

    const start = () => {
      if (running || reduced) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      // Alleen actief als de pointer daadwerkelijk boven het veld zweeft
      if (x >= 0 && y >= 0 && x <= rect.width && y <= rect.height) {
        pointer.x = x;
        pointer.y = y;
        pointer.active = true;
      } else {
        pointer.active = false;
      }
    };
    const onPointerLeave = () => {
      pointer.active = false;
      pointer.x = -9999;
      pointer.y = -9999;
    };

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    reduced = mq.matches;
    const onMq = () => {
      reduced = mq.matches;
      stop();
      if (reduced) drawFrame(0);
      else start();
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();
    if (!reduced) start();

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerout', onPointerLeave);
    mq.addEventListener?.('change', onMq);

    return () => {
      stop();
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerout', onPointerLeave);
      mq.removeEventListener?.('change', onMq);
    };
  }, [density, ink, maxAlpha]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    />
  );
}
