'use client';

/**
 * MiniPlayer — klein, versleepbaar mp3-spelertje dat overal op de site
 * meelopet. De muziek blijft door bij sectiewissel (engine zit in
 * MusicPlayerContext, nooit onmount).
 *
 * Drie standen:
 *  - full: volledige player (seek, prev/next, mute, naar Club Muziek)
 *  - bar:  slanke balk met titel + play/pauze + voortgangslintje
 *  - dot:  klein rond bolletje (48px) met albumcover + play/pauze
 *
 * Verslepen: via de grip in de kop (of het hele bolletje). Dragging is 1:1
 * (pointer events + touch-action: none), dus de pagina eronder beweegt
 * nooit mee en pull-to-refresh kan niet meer getriggerd worden.
 * Positie én stand worden onthouden (localStorage).
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, ListMusic, Minus,
} from 'lucide-react';
import { useMusicPlayer } from '@/context/MusicPlayerContext';

const POS_KEY = 'michigami-miniplayer-pos-v2';
const MODE_KEY = 'michigami-miniplayer-mode-v2';

type Mode = 'full' | 'bar' | 'dot';

interface Pos { x: number; y: number; }

const DOT = 56;

function formatTime(sec: number): string {
  if (!isFinite(sec) || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function isMobileWidth(): boolean {
  return typeof window !== 'undefined' && window.innerWidth < 768;
}

function clampPos(x: number, y: number, w: number, h: number, dotHitbox = false): Pos {
  const buf = isMobileWidth() ? 60 : 8; // 60 = ruimte voor mobiele onderbalk
  // Dot: de hitbox is 88px maar het zichtbare bolletje is 56px (16px marge
  // rondom). Clamp op 56 zodat het BOLLETJE nooit buiten beeld hangt; de
  // onzichtbare marge mag de rand een beetje overlappen.
  const margin = dotHitbox ? 16 : 0;
  const maxX = Math.max(4, window.innerWidth - w - 4 - margin);
  const maxY = Math.max(4, window.innerHeight - h - buf - margin);
  return {
    x: Math.min(Math.max(4, x), maxX),
    y: Math.min(Math.max(4, y), maxY),
  };
}

function GripIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="5" cy="6" r="1.6" /><circle cx="12" cy="6" r="1.6" /><circle cx="19" cy="6" r="1.6" />
      <circle cx="5" cy="12" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="19" cy="12" r="1.6" />
      <circle cx="5" cy="18" r="1.6" /><circle cx="12" cy="18" r="1.6" /><circle cx="19" cy="18" r="1.6" />
    </svg>
  );
}

export function MiniPlayer({ onOpenMusic }: { onOpenMusic: () => void }) {
  const mp = useMusicPlayer();
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<Mode>('bar');
  const [pos, setPos] = useState<Pos>({ x: 12, y: 12 });
  const [dragging, setDragging] = useState(false);

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const posRef = useRef<Pos>(pos);
  const modeRef = useRef<Mode>(mode);
  useEffect(() => { modeRef.current = mode; }, [mode]);
  const dragRef = useRef<{ id: number; dx: number; dy: number; sx: number; sy: number; moved: boolean } | null>(null);
  const suppressClickRef = useRef(false);
  // Dot: onthoud of de pointerdown op de play-knop begon. Na pointer-capture
  // kan de browser de (synthetic) click op het 88px-veld richten i.p.v. de
  // knop — dan leest dit vlaggetje af of de tap play/pauze was of het bolletje.
  const tapWasButtonRef = useRef(false);

  const savePos = (p: Pos) => {
    try { localStorage.setItem(POS_KEY, JSON.stringify(p)); } catch { /* ignore */ }
  };

  // Initiale positie + stand laden (localStorage) of fatsoenlijke defaults:
  // mobiel → slanke balk rechtsonder (niet over de content), desktop →
  // volledige player rechtsboven.
  useEffect(() => {
    let m: Mode | null = null;
    let p: Pos | null = null;
    try {
      const rawM = localStorage.getItem(MODE_KEY);
      if (rawM === 'full' || rawM === 'bar' || rawM === 'dot') m = rawM;
      const rawP = localStorage.getItem(POS_KEY);
      if (rawP) {
        const q = JSON.parse(rawP);
        if (typeof q?.x === 'number' && typeof q?.y === 'number') p = q;
      }
    } catch { /* ignore */ }

    const mobile = isMobileWidth();
    const md: Mode = m ?? (mobile ? 'bar' : 'full');
    const w = md === 'dot' ? DOT : Math.min(mobile ? 272 : 300, window.innerWidth - 16);
    const h = md === 'dot' ? DOT : md === 'bar' ? 46 : 104;
    const dp = clampPos(
      p?.x ?? (mobile ? window.innerWidth - w - 12 : window.innerWidth - w - 16),
      p?.y ?? (mobile ? window.innerHeight - 60 - h - 12 : 16),
      w, h,
    );
    posRef.current = dp;
    setPos(dp);
    setMode(md);
    setReady(true);
  }, []);

  // Stand wisselen (dot ↔ bar ↔ full) en daarna in beeld houden.
  const applyMode = (m: Mode) => {
    setMode(m);
    try { localStorage.setItem(MODE_KEY, m); } catch { /* ignore */ }
    requestAnimationFrame(() => {
      const el = wrapRef.current;
      if (!el) return;
      const c = clampPos(posRef.current.x, posRef.current.y, el.offsetWidth, el.offsetHeight, m === 'dot');
      posRef.current = c;
      setPos(c);
      savePos(c);
    });
  };

  // Na een drag stuurt de browser (via pointer-capture) een click terug
  // op het drag-surface zelf — die mag géén actie uitvoeren (geen
  // per-ongeluk play/mode-wissel). Alleen de dot heeft een onClick op
  // het surface; die checkt de flag. Na 500 ms roost de flag af, dus
  // de volgende échte klik is weer gewoon.
  useEffect(() => {
    const onResize = () => {
      if (dragRef.current) return;
      const el = wrapRef.current;
      if (!el) return;
      const c = clampPos(posRef.current.x, posRef.current.y, el.offsetWidth, el.offsetHeight, modeRef.current === 'dot');
      posRef.current = c;
      setPos(c);
      savePos(c);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // ============ Verslepen (1:1, pagina blijft stilstaan) ============
  // touch-action: none op de handle zorgt ervoor dat de browser de touch
  // NIET overneemt voor scrollen/pull-to-refresh — wij krijgen alle moves.
  const onDragDown = (e: React.PointerEvent) => {
    // Dot: het HELE 88px-veld is vattebaar — ook over de play-knop heen. De
    // play-knop laat pointer events doorgaan: een tap (zonder beweging) =
    // play/pauze (zie tapWasButtonRef in onClick), een beweging = de dot
    // meeslepen. Bar/full: knoppen breken de drag af (afgezonderde functies,
    // en de kop is daar al breed genoeg om te vatten).
    if (mode !== 'dot' && (e.target as HTMLElement).closest('button')) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    tapWasButtonRef.current = mode === 'dot' && !!(e.target as HTMLElement).closest('button');
    dragRef.current = {
      id: e.pointerId,
      dx: e.clientX - r.left,
      dy: e.clientY - r.top,
      sx: e.clientX,
      sy: e.clientY,
      moved: false,
    };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const onDragMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d || d.id !== e.pointerId) return;
    const el = wrapRef.current;
    if (!el) return;
    if (!d.moved) {
      if (Math.hypot(e.clientX - d.sx, e.clientY - d.sy) <= 4) return;
      d.moved = true;
      setDragging(true);
    }
    const c = clampPos(e.clientX - d.dx, e.clientY - d.dy, el.offsetWidth, el.offsetHeight, mode === 'dot');
    posRef.current = c;
    setPos(c);
  };

  const onDragEnd = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d || d.id !== e.pointerId) return;
    dragRef.current = null;
    if (d.moved) {
      suppressClickRef.current = true;
      window.setTimeout(() => { suppressClickRef.current = false; }, 500);
      setDragging(false);
      savePos(posRef.current);
    }
  };

  const dragProps = {
    onPointerDown: onDragDown,
    onPointerMove: onDragMove,
    onPointerUp: onDragEnd,
    onPointerCancel: onDragEnd,
  };

  // Toon het widget pas als er muziek is (autostart of handmatig).
  if (!ready || !mp.album || !mp.currentTrack) return null;

  const pct = mp.duration > 0 ? (mp.current / mp.duration) * 100 : 0;
  const gradient = `linear-gradient(135deg, ${mp.album.accent}f5, ${mp.album.accent}d9)`;
  const cardTransition = dragging ? 'none' : 'box-shadow .2s ease';

  // ---- Dot: klein rond bolletje ----
  // De ZICHTBARE dot is 56px, maar de vattsurface voor verslepen is een groter
  // onzichtbaar 88px-veld eromheen. Een echte vinger (40-50px breed) dekt
  // anders vrijwel alleen de smalle ~16px-ring om de centrale play-knop heen —
  // onmogelijk om betrouwbaar te vatten. Met de 88px-hitzone is het hele
  // bolletje (plus onzichtbare marge) te vatten; alleen de kleine centrale
  // play-knop is uitzondering (tap = play/pauze).
  if (mode === 'dot') {
    return (
      <div ref={wrapRef} className="fixed z-[70] select-none" style={{ left: pos.x, top: pos.y }}>
        <div
          {...dragProps}
          className="relative w-[88px] h-[88px] flex items-center justify-center cursor-grab active:cursor-grabbing"
          style={{ touchAction: 'none' }}
          onClick={e => {
            // 1) Post-drag click onderdrukken (pointer-capture stuurt een
            //    synthetic click terug na een versleep). Reset de button-flag.
            if (suppressClickRef.current) {
              suppressClickRef.current = false;
              tapWasButtonRef.current = false;
              e.preventDefault();
              e.stopPropagation();
              return;
            }
            // 2) Tap op de play-knop → play/pauze. (Pointer-capture stuurt de
            //    click naar dit veld i.p.v. de knop; tapWasButtonRef onthoudt
            //    dat de pointerdown op de knop begon.)
            if (tapWasButtonRef.current) {
              tapWasButtonRef.current = false;
              mp.togglePlay();
              return;
            }
            // 3) Tap op ring/marge → bar uitklappen.
            applyMode('bar');
          }}
          role="button"
          aria-label="Muziekspeler openen"
        >
          <div
            className="relative w-14 h-14 rounded-full overflow-hidden border border-white/40 shadow-2xl shadow-black/50 cursor-grab active:cursor-grabbing active:scale-95 transition-transform duration-150 hover:ring-2 hover:ring-white/25"
            style={{ background: gradient }}
          >
            <img
              src={mp.album.cover}
              alt=""
              draggable={false}
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            />
            <button
              onPointerDown={() => {/* laat de pointer events doorbubbelen naar het 88px-veld:
                tap (geen beweging) = play/pauze, vinger bewegen = dot meeslepen.
                touch-action:none op het veld voorkomt dat de browser scrollt. */}}
              onClick={(e) => { e.stopPropagation(); mp.togglePlay(); }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/55 backdrop-blur-sm text-white flex items-center justify-center"
              style={{ touchAction: 'none' }}
              aria-label={mp.playing ? 'Pauzeer' : 'Speel af'}
            >
              {mp.playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isBar = mode === 'bar';
  return (
    <div ref={wrapRef} className="fixed z-[70] select-none" style={{ left: pos.x, top: pos.y }}>
      <div
        className={`overflow-hidden rounded-xl border border-white/15 shadow-2xl shadow-black/40 backdrop-blur-xl max-w-full ${
          isBar ? 'w-[min(272px,calc(100vw-16px))]' : 'w-[min(300px,calc(100vw-16px))]'
        }`}
        style={{ background: gradient, transition: cardTransition }}
        role="region"
        aria-label="Muziekspeler"
      >
        {/* Kop / drag-handle — hier sleep je (al behalve de knoppen) */}
        <div
          {...dragProps}
          className="flex items-center gap-2 px-2.5 py-2 cursor-grab active:cursor-grabbing"
          style={{ touchAction: 'none' }}
        >
          <span className="text-white/70 shrink-0 pointer-events-none"><GripIcon /></span>
          <img
            src={mp.album.cover}
            alt=""
            draggable={false}
            className="w-7 h-7 rounded-md object-cover shadow shrink-0 pointer-events-none"
          />
          <div className="flex-1 min-w-0 pointer-events-none">
            <div className="text-xs font-semibold text-white truncate leading-tight">
              {mp.currentTrack.title}
            </div>
            <div className="text-[10px] text-white/60 truncate leading-tight">
              {mp.album.name} · Robas
            </div>
          </div>
          {isBar ? (
            <>
              <button
                onClick={mp.togglePlay}
                className="w-8 h-8 rounded-full bg-white text-[#1c1915] flex items-center justify-center shadow hover:scale-105 active:scale-95 transition-transform shrink-0"
                aria-label={mp.playing ? 'Pauzeer' : 'Speel af'}
              >
                {mp.playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
              </button>
              <button
                onClick={() => applyMode('full')}
                className="p-1.5 rounded-md text-white/70 hover:text-white hover:bg-white/15 transition-colors shrink-0"
                aria-label="Speler uitvouwen"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                </svg>
              </button>
              <button
                onClick={() => applyMode('dot')}
                className="p-1.5 rounded-md text-white/70 hover:text-white hover:bg-white/15 transition-colors shrink-0"
                aria-label="Speler naar bolletje verkleinen"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => applyMode('bar')}
                className="p-1.5 rounded-md text-white/70 hover:text-white hover:bg-white/15 transition-colors shrink-0"
                aria-label="Speler krimpen"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <button
                onClick={() => applyMode('dot')}
                className="p-1.5 rounded-md text-white/70 hover:text-white hover:bg-white/15 transition-colors shrink-0"
                aria-label="Speler naar bolletje verkleinen"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>

        {isBar ? (
          /* Bar: slank — alleen een voortgangslintje onderin */
          <div className="relative h-1 bg-white/15">
            <div
              className="absolute inset-y-0 left-0 bg-white/70"
              style={{ width: `${pct}%` }}
            />
          </div>
        ) : (
          /* Full: seek + transport + volume + naar Club Muziek */
          <div className="px-3 pb-3">
            <div
              className="relative h-1 bg-white/20 rounded-full cursor-pointer"
              onClick={e => {
                const rect = e.currentTarget.getBoundingClientRect();
                mp.seek(((e.clientX - rect.left) / rect.width) * mp.duration);
              }}
            >
              <div
                className="absolute inset-y-0 left-0 bg-white/70 rounded-full"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[10px] tabular-nums text-white/60">
                {formatTime(mp.current)} / {formatTime(mp.duration)}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => mp.skip(-1)}
                  className="p-1.5 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Vorige"
                >
                  <SkipBack className="w-4 h-4" />
                </button>
                <button
                  onClick={mp.togglePlay}
                  className="w-9 h-9 rounded-full bg-white text-[#1c1915] flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform"
                  aria-label={mp.playing ? 'Pauzeer' : 'Speel af'}
                >
                  {mp.playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>
                <button
                  onClick={() => mp.skip(1)}
                  className="p-1.5 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Volgende"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-0.5">
                <button
                  onClick={mp.toggleMute}
                  className="p-1.5 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label={mp.muted ? 'Geluid aan' : 'Dempen'}
                >
                  {mp.muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={onOpenMusic}
                  className="p-1.5 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Naar Club Muziek"
                >
                  <ListMusic className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}