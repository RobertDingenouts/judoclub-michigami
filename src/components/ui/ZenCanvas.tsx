'use client';

import { useEffect, useRef } from 'react';

/**
 * ZenCanvas — cinematisch particle-systeem op <canvas>.
 *
 * Lagen (achtergrond → voorgrond):
 *  1. God-rays: zachte, traag zwaaiende lichtstralen (additive blending)
 *  2. Stof: kleine deeltjes die in de lichtstralen dwarrelen
 *  3. Sakura: kersenbloesemblaadjes die tuimelend neervallen
 *
 * Performance: devicePixelRatio-cap op 2, pauzeert wanneer de tab
 * onzichtbaar is, en respecteert prefers-reduced-motion.
 */

type Props = {
  /** dichtheid sakura (0 = uit) */
  petals?: number;
  /** dichtheid stofdeeltjes */
  dust?: number;
  /** god-rays tonen */
  rays?: boolean;
  /** basis-tint van de lagen */
  tint?: 'warm' | 'dusk';
  className?: string;
};

interface Petal {
  x: number; y: number; vx: number; vy: number;
  rot: number; vr: number; sway: number; swayPhase: number;
  size: number; alpha: number;
}
interface Dust {
  x: number; y: number; vx: number; vy: number;
  r: number; phase: number; speed: number; alpha: number;
}

export function ZenCanvas({ petals = 14, dust = 26, rays = true, tint = 'warm', className }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    let running = true;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0, H = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      W = rect.width; H = rect.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // ── deeltjes init ──
    const R = () => Math.random();
    const mkPetal = (spawnAnywhere = false): Petal => ({
      x: R() * W,
      y: spawnAnywhere ? R() * H : -20 - R() * H * 0.5,
      vx: -0.25 + R() * 0.5,
      vy: 0.35 + R() * 0.75,
      rot: R() * Math.PI * 2,
      vr: (R() - 0.5) * 0.04,
      sway: 12 + R() * 26,
      swayPhase: R() * Math.PI * 2,
      size: 4 + R() * 5,
      alpha: 0.45 + R() * 0.4,
    });
    const mkDust = (): Dust => ({
      x: R() * W, y: R() * H,
      vx: -0.06 + R() * 0.12,
      vy: -0.03 + R() * 0.06,
      r: 0.6 + R() * 1.4,
      phase: R() * Math.PI * 2,
      speed: 0.004 + R() * 0.012,
      alpha: 0.15 + R() * 0.35,
    });
    const petalArr: Petal[] = Array.from({ length: reduced ? 0 : petals }, () => mkPetal(true));
    const dustArr: Dust[] = Array.from({ length: reduced ? 0 : dust }, mkDust);

    // ── god-rays: vaste bundels met langzame sinus-zwaai ──
    const rayAngles = [0, 1, 2].map(i => ({
      baseX: 0.62 + i * 0.13,
      spread: 40 + i * 22,
      phase: i * 1.9,
      alpha: 0.05 + 0.03 * (i % 2),
    }));

    let t = 0;
    const draw = () => {
      if (!running) return;
      t += 0.008;
      ctx.clearRect(0, 0, W, H);

      // 1) god-rays
      if (rays && !reduced) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        for (const r of rayAngles) {
          const x0 = (r.baseX + Math.sin(t * 0.7 + r.phase) * 0.02) * W;
          const g = ctx.createLinearGradient(x0, 0, x0 + r.spread, H);
          if (tint === 'warm') {
            g.addColorStop(0, `rgba(255,214,150,${r.alpha})`);
            g.addColorStop(1, 'rgba(255,190,120,0)');
          } else {
            g.addColorStop(0, `rgba(180,170,230,${r.alpha})`);
            g.addColorStop(1, 'rgba(140,130,220,0)');
          }
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.moveTo(x0 - r.spread * 0.35, 0);
          ctx.lineTo(x0 + r.spread * 0.65, 0);
          ctx.lineTo(x0 + r.spread * 1.6 + 60, H);
          ctx.lineTo(x0 + r.spread * 0.6 + 60, H);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }

      // 2) stof
      for (const d of dustArr) {
        d.x += d.vx + Math.sin(t * 8 + d.phase) * 0.08;
        d.y += d.vy + Math.cos(t * 6 + d.phase) * 0.05;
        if (d.y < -5) { d.y = H + 5; d.x = R() * W; }
        if (d.x < -5) d.x = W + 5;
        if (d.x > W + 5) d.x = -5;
        const tw = 0.6 + 0.4 * Math.sin(t * 30 + d.phase);
        ctx.fillStyle = tint === 'warm'
          ? `rgba(255,228,180,${d.alpha * tw})`
          : `rgba(210,200,255,${d.alpha * tw})`;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3) sakura — blaadje als geroteerde ellipse met vouwlijn
      for (const p of petalArr) {
        p.swayPhase += 0.02;
        p.x += p.vx + Math.sin(p.swayPhase) * (p.sway / 240);
        p.y += p.vy;
        p.rot += p.vr;
        if (p.y > H + 24 || p.x < -30 || p.x > W + 30) Object.assign(p, mkPetal());
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot + Math.sin(p.swayPhase) * 0.4);
        ctx.scale(1, 0.55 + 0.25 * Math.sin(p.swayPhase * 2)); // tuimel-effect
        ctx.fillStyle = `rgba(246,183,201,${p.alpha})`;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.72, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(233,158,182,${p.alpha * 0.8})`;
        ctx.beginPath();
        ctx.ellipse(p.size * 0.18, 0, p.size * 0.55, p.size * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      raf = requestAnimationFrame(draw);
    };

    draw();

    const onVis = () => {
      running = document.visibilityState === 'visible';
      if (running) draw();
      else cancelAnimationFrame(raf);
    };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [petals, dust, rays, tint]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={`pointer-events-none absolute inset-0 h-full w-full ${className ?? ''}`}
    />
  );
}
