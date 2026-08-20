'use client';

import { useMemo } from 'react';

/* ============================================================================
   ZEN SCENERY — sumi-e (Japans inkt) op oud papier.
   Berge, nevel, torii, rivier, bomen, valende bloesem — heel rustige beweging.
   Alles pointer-events: none, decoratief. Kleuren: lichte sumi-inkt op washi.
   ========================================================================== */

const INK = 'rgba(236, 225, 206, ';    // lichte inkt (moon-wash op donkerrood)
const INK_SOFT = 'rgba(236, 225, 206, ';// idem, lagere alpha per gebruik
const SHU = 'rgba(212, 58, 58, ';     // shu-rood (helder op donker)
const KIN = 'rgba(212, 168, 67, ';    // kin-goud
const SAKURA = 'rgba(236, 158, 178, ';// sakura-roze (bloesem, niet rood)

function rnd(seed: number[]) {
  let i = 0;
  return () => {
    i = (i + 1) % seed.length;
    return seed[i];
  };
}

/* --- Sakura-bloesemblaadjes die langzaam vallen (roze-rode vlekjes) ------- */
export function SakuraPetals({ count = 12, className = '' }: { count?: number; className?: string }) {
  const petals = useMemo(() => {
    const rand = rnd([7, 13, 29, 41, 53, 71, 89, 97]);
    return Array.from({ length: count }, (_, i) => {
      const left = rand() * 96 + 2;
      const size = 4 + rand() * 5;
      const dur = 17 + rand() * 15;
      const delay = -(rand() * dur);
      const sway = 20 + rand() * 40;
      const o = 0.16 + rand() * 0.2;
      const pink = rand() > 0.35;
      return (
        <span
          key={i}
          className="petal"
          style={{
            left: `${left}%`,
            width: size,
            height: size * 0.8,
            ['--sway' as string]: `${sway}px`,
            ['--petal-o' as string]: o,
            animationDuration: `${dur}s`,
            animationDelay: `${delay}s`,
            borderRadius: '60% 40% 55% 45% / 55% 45% 60% 40%',
            background: pink
              ? `radial-gradient(ellipse at 40% 35%, ${SHU}0.55), ${SHU}0.15)`
              : `radial-gradient(ellipse at 40% 35%, ${KIN}0.5), ${KIN}0.14)`,
            filter: 'blur(0.4px)',
          }}
        />
      );
    });
  }, [count]);
  return <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>{petals}</div>;
}

/* --- Sumi-e landschap: maan, bergen, torii, rivier met reflectie, bomen ---- */
export function SumiLandscape({ className = '' }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1200 900"
        preserveAspectRatio="xMidYMax slice"
        fill="none"
      >
        <defs>
          <radialGradient id="ml-moon" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(245,235,215,0.95)" />
            <stop offset="70%" stopColor="rgba(245,235,215,0.7)" />
            <stop offset="100%" stopColor="rgba(245,235,215,0)" />
          </radialGradient>
          <radialGradient id="ml-moon-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(245,235,215,0.3)" />
            <stop offset="60%" stopColor="rgba(245,235,215,0.08)" />
            <stop offset="100%" stopColor="rgba(245,235,215,0)" />
          </radialGradient>
          <linearGradient id="ml-ink-far" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={INK_SOFT + '0.5)'} />
            <stop offset="100%" stopColor={INK_SOFT + '0.1)'} />
          </linearGradient>
          <linearGradient id="ml-ink-mid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={INK_SOFT + '0.65)'} />
            <stop offset="100%" stopColor={INK_SOFT + '0.12)'} />
          </linearGradient>
          <linearGradient id="ml-river" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={INK_SOFT + '0.12)'} />
            <stop offset="50%" stopColor={INK_SOFT + '0.4)'} />
            <stop offset="100%" stopColor={INK_SOFT + '0.25)'} />
          </linearGradient>
          <linearGradient id="ml-moon-reflect" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(245,235,215,0.85)" />
            <stop offset="60%" stopColor="rgba(245,235,215,0.45)" />
            <stop offset="100%" stopColor="rgba(245,235,215,0)" />
          </linearGradient>
          {/* Heldere reflectiekolom — de "spiegel" van de maan */}
          <linearGradient id="ml-moon-column" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(248,240,222,0.9)" />
            <stop offset="45%" stopColor="rgba(245,235,215,0.5)" />
            <stop offset="100%" stopColor="rgba(245,235,215,0)" />
          </linearGradient>
          <clipPath id="ml-water-clip">
            <rect x="-40" y="540" width="1320" height="90" />
          </clipPath>
          <linearGradient id="ml-veil" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(16,9,10,0)" />
            <stop offset="100%" stopColor="rgba(16,9,10,0.35)" />
          </linearGradient>
        </defs>

        {/* Maan — helder met zachte halo (rechts, buiten de player-widget) */}
        <circle cx="780" cy="150" r="125" fill="url(#ml-moon-glow)" className="moon-glow" />
        <circle cx="780" cy="150" r="64" fill="rgba(245,235,215,0.92)" />
        <circle cx="780" cy="150" r="64" fill="none" stroke="rgba(245,235,215,0.3)" strokeWidth="1.5" />
        {/* subtiele kraters */}
        <circle cx="762" cy="132" r="9" fill="rgba(200,185,160,0.25)" />
        <circle cx="798" cy="165" r="6" fill="rgba(200,185,160,0.2)" />

        {/* Verre berg — inktvlek met meer contrast */}
        <path
          d="M -20 480 C 140 430 250 370 370 400 C 470 425 510 370 610 350 C 750 320 850 400 970 420 C 1070 435 1140 410 1220 440 L 1220 620 L -20 620 Z"
          fill="url(#ml-ink-far)"
          className="ink-bleed"
          style={{ ['--ink-o' as string]: 1 }}
        />
        {/* Midde berg — dikkere kwast */}
        <path
          d="M -20 570 C 110 530 210 470 320 490 C 420 508 490 440 600 422 C 730 400 820 475 940 498 C 1050 518 1130 490 1220 520 L 1220 680 L -20 680 Z"
          fill="url(#ml-ink-mid)"
        />
        {/* Nevelstreken */}
        {[520, 560, 610].map((y, i) => (
          <rect key={i} x={-40 + i * 50} y={y} width={1320 - i * 100} height={8 + i * 4} rx={8}
            fill={[INK_SOFT + '0.14)', INK_SOFT + '0.18)', INK_SOFT + '0.22)'][i]} className="animate-mist"
            style={{ animationDuration: `${24 + i * 8}s`, animationDelay: `${-i * 8}s` }} />
        ))}

        {/* Torii — links-midden, buiten de titelband, rechts van de sakura */}
        <g className="animate-flicker" style={{ animationDuration: '8s' }}>
          <path d="M 410 430 C 380 415 340 408 310 415 L 308 430 C 340 422 375 426 408 438 Z"
            fill={SHU + '0.95)'} />
          <rect x="312" y="435" width="96" height="10" rx="3" fill={SHU + '0.9)'} />
          <rect x="320" y="430" width="13" height="140" rx="3" fill={SHU + '0.85)'} />
          <rect x="388" y="430" width="13" height="140" rx="3" fill={SHU + '0.85)'} />
          <rect x="316" y="472" width="84" height="7" rx="2" fill={SHU + '0.7)'} />
        </g>

        {/* Waterbaan — breed horizontaal vlak tussen de berge (reflectie-drager) */}
        <rect x="-40" y="540" width="1320" height="90" fill="url(#ml-river)" opacity="0.9" />
        {/* wateroppervlak-lijnen */}
        {[555, 572, 590, 610].map((y, i) => (
          <line key={i} x1="-20" y1={y} x2="1260" y2={y} stroke={INK_SOFT + '0.15)'} strokeWidth="1" strokeDasharray="40 60" />
        ))}

        {/* Maan-reflectie — zachte gloeiende druppel op de waterbaan + rimpels */}
        <ellipse cx="776" cy="585" rx="13" ry="42" fill="url(#ml-moon-column)" filter="blur(5px)" clipPath="url(#ml-water-clip)" className="animate-mist" style={{ animationDuration: '13s' }} />
        <ellipse cx="775" cy="555" rx="40" ry="5.5" fill="url(#ml-moon-reflect)" opacity="0.95" className="animate-mist" style={{ animationDuration: '11s' }} />
        <ellipse cx="785" cy="578" rx="30" ry="4.5" fill="url(#ml-moon-reflect)" opacity="0.7" className="animate-mist" style={{ animationDuration: '15s', animationDelay: '-4s' }} />
        <ellipse cx="766" cy="600" rx="22" ry="3.5" fill="url(#ml-moon-reflect)" opacity="0.55" className="animate-mist" style={{ animationDuration: '13s', animationDelay: '-2s' }} />
        <ellipse cx="784" cy="622" rx="15" ry="2.5" fill="url(#ml-moon-reflect)" opacity="0.42" className="animate-mist" style={{ animationDuration: '17s', animationDelay: '-6s' }} />

        {/* Stroming */}
        <path d="M 520 580 C 570 565 620 558 680 555" stroke={INK_SOFT + '0.35)'} strokeWidth="2"
          strokeLinecap="round" strokeDasharray="22 50" className="river-flow" />
        <path d="M 620 600 C 670 588 710 578 770 575" stroke={INK_SOFT + '0.25)'} strokeWidth="1.5"
          strokeLinecap="round" strokeDasharray="16 60" className="river-flow"
          style={{ animationDuration: '30s' }} />

        {/* Sakuraboom links — inktstam + dichte roze bloesemkruin */}
        <g className="canopy">
          <path d="M 80 750 C 90 680 70 610 100 540 C 110 515 128 495 145 480"
            stroke={INK_SOFT + '0.85)'} strokeWidth="9" strokeLinecap="round" />
          <path d="M 100 590 C 130 570 155 550 170 520" stroke={INK_SOFT + '0.65)'} strokeWidth="5" strokeLinecap="round" />
          <path d="M 90 650 C 65 630 50 610 45 585" stroke={INK_SOFT + '0.55)'} strokeWidth="4" strokeLinecap="round" />
          {[
            [90, 490, 48], [160, 460, 56], [225, 498, 44], [52, 540, 40], [190, 545, 48], [115, 528, 46], [255, 465, 32], [145, 480, 42],
          ].map(([cx, cy, r], i) => (
            <circle key={i} cx={cx} cy={cy} r={r} fill={SAKURA + (i % 2 ? '0.4)' : '0.5)')} filter="blur(3px)" />
          ))}
          {/* scherpe individuele bloemetjes — vijf kelken, geven textuur */}
          {[
            [72, 470], [120, 452], [168, 442], [216, 470], [90, 510], [140, 498],
            [190, 516], [60, 530], [230, 500], [110, 430], [175, 472], [55, 480],
          ].map(([cx, cy], i) => (
            <g key={i} stroke={SAKURA + '0.75)'} strokeWidth="1.5" fill="none">
              {[[0, -5], [4.8, -1.5], [3, 4], [-3, 4], [-4.8, -1.5]].map(([dx, dy], j) => (
                <ellipse key={j} cx={cx + dx} cy={cy + dy} rx="3.4" ry="4.6" transform={`rotate(${i * 25 + j * 72} ${cx + dx} ${cy + dy})`} />
              ))}
              <circle cx={cx} cy={cy} r="1.6" fill={KIN + '0.8)'} stroke="none" />
            </g>
          ))}
          {/* losse bloesemblaadjes rond de kruin */}
          {[
            [60, 440, 5], [200, 430, 4], [270, 445, 4], [30, 500, 3.5], [240, 530, 4], [110, 420, 3],
          ].map(([cx, cy, r], i) => (
            <ellipse key={i} cx={cx} cy={cy} rx={r} ry={r * 0.7} fill={SAKURA + '0.55)'} transform={`rotate(${i * 40} ${cx} ${cy})`} />
          ))}
        </g>

        {/* Bonsai rechts — op een steen, duidelijk */}
        <g opacity="0.9">
          <path d="M 1000 720 C 1008 690 998 670 1012 650 C 1020 638 1035 630 1050 626"
            stroke={INK_SOFT + '0.75)'} strokeWidth="6" strokeLinecap="round" />
          <path d="M 1008 680 C 1025 672 1038 660 1044 645" stroke={INK_SOFT + '0.55)'} strokeWidth="4" strokeLinecap="round" />
          <ellipse cx="1030" cy="618" rx="45" ry="18" fill={INK_SOFT + '0.5)'} filter="blur(4px)" />
          <ellipse cx="1068" cy="636" rx="30" ry="13" fill={INK_SOFT + '0.4)'} filter="blur(3px)" />
          <ellipse cx="1000" cy="630" rx="25" ry="11" fill={SHU + '0.3)'} filter="blur(3px)" />
          <path d="M 970 728 L 1080 728 L 1070 748 L 980 748 Z" fill={INK_SOFT + '0.45)'} />
        </g>

        {/* Dennenboom rechts — klassieke Japans-den met gelamineerde bladen */}
        <g opacity="0.85">
          <path d="M 1120 760 C 1126 700 1116 650 1130 590" stroke={INK_SOFT + '0.75)'} strokeWidth="6" strokeLinecap="round" />
          {/* drie lagen denbladeren (gelamineerd) */}
          <path d="M 1080 600 Q 1130 570 1180 600 Q 1160 610 1130 612 Q 1100 610 1080 600 Z" fill={INK_SOFT + '0.55)'} />
          <path d="M 1090 560 Q 1130 535 1170 560 Q 1155 570 1130 572 Q 1105 570 1090 560 Z" fill={INK_SOFT + '0.5)'} />
          <path d="M 1100 525 Q 1130 505 1160 525 Q 1150 533 1130 535 Q 1110 533 1100 525 Z" fill={INK_SOFT + '0.45)'} />
          <ellipse cx="1130" cy="505" rx="14" ry="8" fill={INK_SOFT + '0.4)'} />
        </g>

        {/* Vogels */}
        <g stroke={INK_SOFT + '0.55)'} strokeWidth="2.5" strokeLinecap="round" fill="none">
          <path d="M 420 280 q 10 -9 20 0 q 10 -9 20 0" />
          <path d="M 480 310 q 8 -7 16 0 q 8 -7 16 0" />
          <path d="M 390 320 q 6 -5 12 0 q 6 -5 12 0" />
          <path d="M 520 260 q 7 -6 14 0 q 7 -6 14 0" />
        </g>

        {/* Voorkant: nevel die de onderkant verzacht */}
        <rect x="-40" y="640" width="1280" height="280" fill="url(#ml-veil)" />
      </svg>
    </div>
  );
}

/* --- Inkt-overspoelingsvlekken (sumi-e blots) aan de randen ---------------- */
export function InkBleeds({ className = '' }: { className?: string }) {
  const blots = useMemo(() => {
    const rand = rnd([3, 17, 37, 59, 79, 101]);
    return Array.from({ length: 14 }, (_, i) => {
      const left = rand() * 100;
      const top = rand() * 100;
      const size = 30 + rand() * 90;
      const o = 0.03 + rand() * 0.05;
      return (
        <span key={i}
          className="ink-bleed absolute rounded-full"
          style={{
            left: `${left}%`, top: `${top}%`,
            width: size, height: size * (0.5 + rand() * 0.5),
            ['--ink-o' as string]: o,
            animationDelay: `${-rand() * 4}s`,
            background: `radial-gradient(ellipse, ${INK_SOFT + '0.5)'} 0%, transparent 65%)`,
            filter: 'blur(2px)',
            transform: `rotate(${rand() * 90}deg)`,
          }}
        />
      );
    });
  }, []);
  return <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>{blots}</div>;
}

/* --- Voxel-motief: een discreet grid van kleine Japanse blokken ------------ */
export function VoxelGrid({ count = 60, className = '' }: { count?: number; className?: string }) {
  const cells = useMemo(() => {
    const rand = rnd([11, 23, 47, 61, 73, 83, 97, 103, 113, 127]);
    return Array.from({ length: count }, (_, i) => {
      const left = rand() * 100;
      const top = rand() * 100;
      const s = 3 + rand() * 4;
      const red = rand() > 0.55;
      const o = 0.05 + rand() * 0.09;
      return (
        <span key={i} className="absolute"
          style={{
            left: `${left}%`, top: `${top}%`,
            width: s, height: s,
            background: red ? SHU + `${o})` : INK_SOFT + `${o})`,
            transform: `rotate(${rand() > 0.5 ? 45 : 0}deg)`,
            borderRadius: 1,
          }}
        />
      );
    });
  }, [count]);
  return <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>{cells}</div>;
}

/* --- Grote, vage kanji op de achtergrond (sumi-inkt, heel licht) ----------- */
export function WatermarkKanji({ char, className = '', size = 420 }: { char: string; className?: string; size?: number }) {
  return (
    <span
      className={`pointer-events-none absolute select-none font-jp ${className ?? ''}`}
      aria-hidden
      style={{
        width: size, height: size,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.82,
        color: INK_SOFT + '0.05)',
        filter: 'blur(1.2px)',
      }}
    >
      {char}
    </span>
  );
}