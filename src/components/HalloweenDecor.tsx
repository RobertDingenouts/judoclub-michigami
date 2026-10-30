'use client';

import { useEffect, useState } from 'react';
import { isHalloweenPeriod } from '@/lib/seasonal';

// Seizoensdecor: spinnenwebben in de hoeken, een hangende spin,
// een spin die onderlangs het scherm loopt en een pompoen.
// Puur CSS-animaties (geen JS-animaties), pointer-events-none,
// en volledig uit voor prefers-reduced-motion.
export function HalloweenDecor() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (isHalloweenPeriod()) setOn(true);
  }, []);
  if (!on) return null;

  return (
    <div aria-hidden="true" className="mhx-root">
      <style>{`
        .mhx-root { position: fixed; inset: 0; pointer-events: none; z-index: 40; }
        .mhx-web { position: absolute; color: rgba(150,150,140,.5); }
        @media (prefers-color-scheme: dark) { .mhx-web { color: rgba(255,255,255,.22); } }
        .mhx-dark .mhx-web, .is-dark .mhx-web { color: rgba(255,255,255,.22); }
        .mhx-web-tl { top: 0; left: 0; }
        .mhx-web-tr { top: 0; right: 0; transform: scaleX(-1); }
        @media (max-width: 640px) { .mhx-web { width: 130px; height: 130px; } }

        /* Hangende spin aan draadje uit linker web */
        .mhx-dangle { position: absolute; top: 118px; left: 74px; transform-origin: top center; animation: mhx-sway 5.5s ease-in-out infinite; }
        @media (max-width: 640px) { .mhx-dangle { top: 70px; left: 44px; } }
        .mhx-thread { width: 1px; height: 64px; margin: 0 auto; background: currentColor; color: rgba(120,120,110,.55); }
        @media (prefers-color-scheme: dark) { .mhx-thread { color: rgba(255,255,255,.3); } }
        @keyframes mhx-sway { 0%,100% { transform: rotate(-5deg); } 50% { transform: rotate(5deg); } }

        /* Spin die onderlangs het scherm loopt */
        .mhx-walk { position: absolute; bottom: 4px; left: -64px; animation: mhx-cross 46s linear infinite; }
        .mhx-walk-inner { animation: mhx-step .7s steps(2, end) infinite; }
        @keyframes mhx-cross { from { transform: translateX(0); } to { transform: translateX(calc(100vw + 128px)); } }
        @keyframes mhx-step { from { transform: translateY(0) rotate(-1.5deg); } to { transform: translateY(-2px) rotate(1.5deg); } }

        /* Pompoen rechtsonder */
        .mhx-pumpkin { position: absolute; bottom: 6px; right: 14px; }
        @media (max-width: 640px) { .mhx-pumpkin { bottom: 74px; right: 10px; width: 40px; height: 40px; } }

        @media (prefers-reduced-motion: reduce) {
          .mhx-dangle, .mhx-walk, .mhx-walk-inner { animation: none; }
          .mhx-walk { left: auto; right: 80px; }
        }
      `}</style>

      {/* Spinnewebben in beide bovenhoeken */}
      <svg className="mhx-web mhx-web-tl" width="210" height="210" viewBox="0 0 210 210" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M0 0 L210 0 M0 0 L198 68 M0 0 L148 148 M0 0 L68 198 M0 0 L0 210" />
        <path d="M52 0 Q48 20 36 36 Q20 48 0 52" />
        <path d="M104 0 Q96 40 72 72 Q40 96 0 104" />
        <path d="M156 0 Q144 60 108 108 Q60 144 0 156" />
        <path d="M208 0 Q192 80 144 144 Q80 192 0 208" />
      </svg>
      <svg className="mhx-web mhx-web-tr" width="210" height="210" viewBox="0 0 210 210" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M0 0 L210 0 M0 0 L198 68 M0 0 L148 148 M0 0 L68 198 M0 0 L0 210" />
        <path d="M52 0 Q48 20 36 36 Q20 48 0 52" />
        <path d="M104 0 Q96 40 72 72 Q40 96 0 104" />
        <path d="M156 0 Q144 60 108 108 Q60 144 0 156" />
        <path d="M208 0 Q192 80 144 144 Q80 192 0 208" />
      </svg>

      {/* Spin aan draadje */}
      <div className="mhx-dangle">
        <div className="mhx-thread" />
        <svg width="26" height="22" viewBox="0 0 26 22" fill="none" stroke="rgba(30,30,30,.85)" strokeWidth="1.6">
          <ellipse cx="13" cy="13" rx="5.5" ry="6" fill="rgba(30,30,30,.85)" stroke="none" />
          <circle cx="13" cy="6" r="3" fill="rgba(30,30,30,.85)" stroke="none" />
          <path d="M9 10 L2 6 M9 13 L1 13 M9 16 L2 20 M17 10 L24 6 M17 13 L25 13 M17 16 L24 20" />
        </svg>
      </div>

      {/* Lopende spin */}
      <div className="mhx-walk">
        <div className="mhx-walk-inner">
          <svg width="42" height="30" viewBox="0 0 26 22" fill="none" stroke="rgba(25,25,25,.8)" strokeWidth="1.5">
            <ellipse cx="13" cy="13" rx="5.5" ry="6" fill="rgba(25,25,25,.8)" stroke="none" />
            <circle cx="13" cy="6" r="3" fill="rgba(25,25,25,.8)" stroke="none" />
            <path d="M9 10 L2 5 M9 12 L0 11 M9 15 L1 19 M9 17 L3 22 M17 10 L24 5 M17 12 L26 11 M17 15 L25 19 M17 17 L23 22" />
          </svg>
        </div>
      </div>

      {/* Pompoen */}
      <svg className="mhx-pumpkin" width="52" height="52" viewBox="0 0 52 52">
        <path d="M26 12 C12 12 6 20 6 30 C6 40 14 46 26 46 C38 46 46 40 46 30 C46 20 40 12 26 12 Z" fill="#e8720c" />
        <path d="M26 12 C20 14 18 22 18 30 C18 38 21 44 26 46" fill="none" stroke="#c25a06" strokeWidth="2" />
        <path d="M26 12 C32 14 34 22 34 30 C34 38 31 44 26 46" fill="none" stroke="#c25a06" strokeWidth="2" />
        <path d="M25 12 C24 8 23 6 20 5 M25 12 C27 9 29 8 31 8" stroke="#4a7a2a" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M15 28 L21 24 L21 31 Z M37 28 L31 24 L31 31 Z M26 32 L22 38 L30 38 Z" fill="#3a1d05" />
      </svg>
    </div>
  );
}
