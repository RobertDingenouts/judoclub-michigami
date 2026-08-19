'use client';

/**
 * MiniPlayer — klein, versleepbaar mp3-spelertje dat overal op de site
 * meelopet. De muziek blijft door bij sectiewissel (engine zit in
 * MusicPlayerContext, nooit onmount).
 *
 * Versleepbaar: sleep via de grip of de kop. Positie wordt onthouden
 * (localStorage) zodat het terugkomt waar je het liet liggen.
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, ListMusic,
} from 'lucide-react';
import { useMusicPlayer } from '@/context/MusicPlayerContext';

const POS_KEY = 'michigami-miniplayer-pos';
const COLLAPSED_KEY = 'michigami-miniplayer-collapsed';

function formatTime(sec: number): string {
  if (!isFinite(sec) || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

interface Pos { x: number; y: number; }

function clampPos(x: number, y: number, w: number, h: number): Pos {
  const maxX = Math.max(4, window.innerWidth - w - 4);
  const maxY = Math.max(4, window.innerHeight - h - 56); // 56 = bottom nav buffer
  return {
    x: Math.min(Math.max(4, x), maxX),
    y: Math.min(Math.max(4, y), maxY),
  };
}

export function MiniPlayer({ onOpenMusic }: { onOpenMusic: () => void }) {
  const mp = useMusicPlayer();
  const [pos, setPos] = useState<Pos>({ x: 16, y: 16 });
  const [collapsed, setCollapsed] = useState(false);
  const [dragging, setDragging] = useState(false);
  const dragOffset = useRef({ dx: 0, dy: 0 });
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const W = 300;
  const H = collapsed ? 52 : 92;

  // Initiale positie laden (localStorage) + op window-resize in beeld houden.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(POS_KEY);
      if (raw) {
        const p = JSON.parse(raw) as Pos;
        if (typeof p.x === 'number' && typeof p.y === 'number') setPos(p);
      }
      setCollapsed(localStorage.getItem(COLLAPSED_KEY) === '1');
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (dragging) return;
    const onResize = () => {
      setPos(p => clampPos(p.x, p.y, W, H));
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [dragging, H]);

  // Persen/onthouden van positie.
  useEffect(() => {
    if (dragging) return;
    try {
      localStorage.setItem(POS_KEY, JSON.stringify(pos));
    } catch { /* ignore */ }
  }, [pos, dragging]);

  // Verslepen via pointer events (muis + touch).
  const onDragStart = (e: React.PointerEvent) => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    dragOffset.current = { dx: e.clientX - rect.left, dy: e.clientY - rect.top };
    setDragging(true);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const onDragMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    const x = e.clientX - dragOffset.current.dx;
    const y = e.clientY - dragOffset.current.dy;
    setPos(clampPos(x, y, W, H));
  };

  const onDragEnd = () => setDragging(false);

  const pct = mp.duration > 0 ? (mp.current / mp.duration) * 100 : 0;

  // Toon het widget pas als er muziek is (autostart of handmatig).
  if (!mp.album || !mp.currentTrack) return null;

  return (
    <div
      ref={wrapRef}
      className="fixed z-[70] w-[300px] max-w-[calc(100vw-8px)] select-none"
      style={{ left: pos.x, top: pos.y, touchAction: dragging ? 'none' : 'auto' }}
      onPointerMove={onDragMove}
      onPointerUp={onDragEnd}
      onPointerCancel={onDragEnd}
      role="region"
      aria-label="Muziekspeler"
    >
      <div
        className="rounded-xl border border-white/15 shadow-2xl shadow-black/40 backdrop-blur-xl overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${mp.album.accent}f5, ${mp.album.accent}d9)`,
          transition: dragging ? 'none' : 'width .2s ease',
        }}
      >
        {/* Kop / drag-grip — hier sleep je het speler-icoon mee */}
        <div
          className="flex items-center gap-2 px-3 py-2 cursor-grab active:cursor-grabbing"
          onPointerDown={onDragStart}
        >
          <span className="text-white/70 shrink-0" aria-hidden>
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="5" cy="6" r="1.6" /><circle cx="12" cy="6" r="1.6" /><circle cx="19" cy="6" r="1.6" />
              <circle cx="5" cy="12" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="19" cy="12" r="1.6" />
              <circle cx="5" cy="18" r="1.6" /><circle cx="12" cy="18" r="1.6" /><circle cx="19" cy="18" r="1.6" />
            </svg>
          </span>
          <img
            src={mp.album.cover}
            alt=""
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
          {/* Krimp/uitvouw */}
          <button
            onClick={() => {
              const next = !collapsed;
              setCollapsed(next);
              try { localStorage.setItem(COLLAPSED_KEY, next ? '1' : '0'); } catch { /* ignore */ }
            }}
            className="p-1.5 rounded-md text-white/70 hover:text-white hover:bg-white/15 transition-colors shrink-0"
            aria-label={collapsed ? 'Speler uitvouwen' : 'Speler krimpen'}
          >
            {collapsed ? (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </button>
        </div>

        {/* Uitgevouwen: voortgang + transport */}
        {!collapsed && (
          <div className="px-3 pb-3">
            {/* Seek-bar */}
            <div
              className="relative h-1 bg-white/20 rounded-full cursor-pointer group"
              onClick={e => {
                const rect = e.currentTarget.getBoundingClientRect();
                const frac = (e.clientX - rect.left) / rect.width;
                mp.seek(frac * mp.duration);
              }}
            >
              <div
                className="absolute inset-y-0 left-0 bg-white/70 rounded-full transition-[width] duration-100"
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