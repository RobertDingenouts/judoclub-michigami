'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1,
  Volume2, VolumeX, ListMusic, Music2, ChevronLeft
} from 'lucide-react';
import { MUSIC_ALBUMS, type MusicAlbum, type MusicTrack } from '@/data/club-music';

// ============ Helpers ============

function formatTime(sec: number): string {
  if (!isFinite(sec) || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function totalDuration(album: MusicAlbum): string {
  const total = album.tracks.reduce((a, t) => a + t.duration, 0);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  return h > 0 ? `${h} uur ${m} min` : `${m} min`;
}

// Build a flat playlist order: current album's tracks (Spotify: album = context)
function buildQueue(album: MusicAlbum, startIndex: number, shuffle: boolean): MusicTrack[] {
  const tracks = [...album.tracks];
  if (shuffle) {
    // Put the chosen track first, shuffle the rest
    const first = tracks.splice(startIndex, 1)[0];
    for (let i = tracks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tracks[i], tracks[j]] = [tracks[j], tracks[i]];
    }
    return [first, ...tracks];
  }
  return tracks;
}

// ============ Album Cover ============

function AlbumCover({ album, size = 'md' }: { album: MusicAlbum; size?: 'sm' | 'md' | 'lg' }) {
  const cls = size === 'lg' ? 'w-40 h-40 sm:w-52 sm:h-52 rounded-2xl'
    : size === 'sm' ? 'w-12 h-12 rounded-lg'
    : 'w-20 h-20 rounded-xl sm:w-24 sm:h-24';
  return (
    <div className={`relative ${cls} overflow-hidden shadow-lg shadow-black/20 shrink-0`}>
      <img
        src={album.cover}
        alt={album.name}
        className="w-full h-full object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${album.accent}22, transparent 60%)` }} />
    </div>
  );
}

// ============ Main Section ============

export function MusicSection() {
  const [selectedAlbum, setSelectedAlbum] = useState<MusicAlbum | null>(null);

  // ---- Playback state (shared with the floating bar via props) ----
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [album, setAlbum] = useState<MusicAlbum | null>(null);
  const [trackIndex, setTrackIndex] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [muted, setMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<'off' | 'all' | 'one'>('off');
  const [queue, setQueue] = useState<MusicTrack[]>([]);
  // Index inside the queue (queue is the playback context)
  const [queuePos, setQueuePos] = useState(0);

  const queueRef = useRef(queue);
  const queuePosRef = useRef(queuePos);
  const repeatRef = useRef(repeat);
  const shuffleRef = useRef(shuffle);
  const playingRef = useRef(playing);
  queueRef.current = queue;
  queuePosRef.current = queuePos;
  repeatRef.current = repeat;
  shuffleRef.current = shuffle;
  playingRef.current = playing;

  const currentTrack = queue[queuePos] ?? null;
  const [videoTrack, setVideoTrack] = useState<MusicTrack | null>(null);

  // ---- Audio element lifecycle ----
  useEffect(() => {
    const audio = new Audio();
    audio.volume = volume;
    audioRef.current = audio;

    const onTime = () => setCurrent(audio.currentTime);
    const onMeta = () => setDuration(audio.duration || 0);
    const onEnd = () => handleTrackEnd();
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onMeta);
    audio.addEventListener('ended', onEnd);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onMeta);
      audio.removeEventListener('ended', onEnd);
      audioRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadTrack = useCallback((src: string, autoplay: boolean) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = src;
    setCurrent(0);
    setDuration(0);
    if (autoplay) {
      audio.play().catch(() => setPlaying(false));
    }
  }, []);

  const handleTrackEnd = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (repeatRef.current === 'one') {
      audio.currentTime = 0;
      audio.play().catch(() => {});
      return;
    }

    let next = queuePosRef.current + 1;
    if (next >= queueRef.current.length) {
      if (repeatRef.current === 'all') {
        next = 0;
      } else {
        // End of playlist — stop
        setPlaying(false);
        return;
      }
    }
    setQueuePos(next);
    const t = queueRef.current[next];
    if (t) loadTrack(t.src, true);
  }, [loadTrack]);

  // Keep <audio> in sync when queuePos / album changes
  useEffect(() => {
    const t = queue[queuePos];
    if (t && audioRef.current && audioRef.current.src !== window.location.origin + t.src) {
      loadTrack(t.src, playingRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queue, queuePos]);

  // ---- Start playing an album from a track index ----
  const playFrom = useCallback((alb: MusicAlbum, index: number, autoplay = true) => {
    setAlbum(alb);
    setTrackIndex(index);
    const q = buildQueue(alb, index, shuffleRef.current);
    setQueue(q);
    setQueuePos(0);
    const t = q[0];
    if (t) loadTrack(t.src, autoplay);
    setPlaying(autoplay);
  }, [loadTrack]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().catch(() => {});
      setPlaying(true);
    }
  }, [playing, currentTrack]);

  const skip = useCallback((dir: 1 | -1) => {
    if (!album) return;
    let next = queuePos + dir;
    if (next < 0) next = queue.length - 1;
    if (next >= queue.length) next = 0;
    setQueuePos(next);
    const t = queue[next];
    if (t) loadTrack(t.src, true);
    setPlaying(true);
  }, [album, queue, queuePos, loadTrack]);

  const seek = useCallback((v: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = v;
    setCurrent(v);
  }, []);

  const changeVolume = useCallback((v: number) => {
    const audio = audioRef.current;
    setVolume(v);
    setMuted(v === 0);
    if (audio) audio.volume = v;
  }, []);

  // Sync volume on the audio element
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = muted ? 0 : volume;
  }, [volume, muted]);

  // ---- Re-shuffle current position when toggled ----
  const toggleShuffle = useCallback(() => {
    const next = !shuffle;
    setShuffle(next);
    if (album && currentTrack) {
      const idx = album.tracks.findIndex(t => t.title === currentTrack.title);
      const q = buildQueue(album, idx, next);
      setQueue(q);
      setQueuePos(0);
      const t = q[0];
      if (t) loadTrack(t.src, true);
    }
  }, [shuffle, album, currentTrack, loadTrack]);

  const cycleRepeat = useCallback(() => {
    setRepeat(r => (r === 'off' ? 'all' : r === 'all' ? 'one' : 'off'));
  }, []);

  // ============ Render ============

  return (
    <div className="space-y-8">
      {/* Header */}
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1c1915] flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-[#a90000] text-white shadow-lg shadow-[#a90000]/25">
            <Music2 className="w-6 h-6" />
          </span>
          Club Muziek
        </h1>
        <p className="mt-2 text-sm text-[#2a2a2a]/60">
          Speciaal voor Judoclub Michigami gemaakt door Robas — {MUSIC_ALBUMS.length} albums,{' '}
          {MUSIC_ALBUMS.reduce((a, al) => a + al.tracks.length, 0)} nummers.
        </p>
      </header>

      {/* Now playing hint when no album selected */}
      {!selectedAlbum && album && (
        <div className="flex items-center gap-4 rounded-2xl bg-white/70 backdrop-blur border border-[#2a2a2a]/10 p-4 shadow-sm">
          <AlbumCover album={album} size="sm" />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#a90000]">Speelt nu</div>
            <div className="font-semibold text-[#1c1915] truncate">{currentTrack?.title}</div>
            <div className="text-sm text-[#2a2a2a]/60 truncate">{album.name} — {album.artist}</div>
          </div>
          <button
            onClick={togglePlay}
            className="w-11 h-11 rounded-full bg-[#a90000] text-white flex items-center justify-center shadow-lg shadow-[#a90000]/30 hover:scale-105 transition-transform shrink-0"
            aria-label={playing ? 'Pauzeer' : 'Speel af'}
          >
            {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>
        </div>
      )}

      {/* Album grid */}
      <section>
        <h2 className="text-lg font-bold text-[#1c1915] mb-3 flex items-center gap-2">
          <ListMusic className="w-4 h-4 text-[#a90000]" /> Albums
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MUSIC_ALBUMS.map(albumItem => (
            <div
              key={albumItem.id}
              className={`group rounded-2xl bg-white/80 backdrop-blur border p-4 transition-all cursor-pointer hover:shadow-xl hover:shadow-black/10 hover:-translate-y-0.5 ${
                selectedAlbum?.id === albumItem.id ? 'border-[#a90000]/50 ring-2 ring-[#a90000]/20' : 'border-[#2a2a2a]/10'
              }`}
              onClick={() => setSelectedAlbum(albumItem)}
            >
              <div className="flex items-start gap-4">
                <AlbumCover album={albumItem} />
                <div className="flex-1 min-w-0 pt-1">
                  <h3 className="font-bold text-[#1c1915] leading-tight">{albumItem.name}</h3>
                  <p className="text-sm text-[#2a2a2a]/60 mt-0.5">{albumItem.artist}</p>
                  <p className="text-xs text-[#2a2a2a]/45 mt-1">
                    {albumItem.tracks.length} nummers · {totalDuration(albumItem)}
                  </p>
                </div>
              </div>
              <p className="text-sm text-[#2a2a2a]/70 mt-3 leading-relaxed line-clamp-2">{albumItem.description}</p>
              <div className="mt-3 flex items-center justify-between">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    playFrom(albumItem, 0);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#a90000] text-white text-sm font-semibold shadow-lg shadow-[#a90000]/25 hover:bg-[#8c0000] active:scale-95 transition-all"
                >
                  <Play className="w-4 h-4" /> Afspelen
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const shuffled = Math.floor(Math.random() * albumItem.tracks.length);
                    playFrom(albumItem, shuffled);
                  }}
                  className="p-2 rounded-full text-[#2a2a2a]/50 hover:text-[#a90000] hover:bg-[#a90000]/10 transition-colors"
                  aria-label="Willekeurig afspelen"
                >
                  <Shuffle className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Track list for selected album */}
      {selectedAlbum && (
        <section className="rounded-2xl bg-white/80 backdrop-blur border border-[#2a2a2a]/10 overflow-hidden shadow-sm">
          {/* Album header */}
          <div className="relative p-5 sm:p-6 flex items-center gap-4 sm:gap-5"
               style={{ background: `linear-gradient(135deg, ${selectedAlbum.accent}26, transparent)` }}>
            <button
              onClick={() => setSelectedAlbum(null)}
              className="hidden sm:inline-flex items-center gap-1 text-sm text-[#2a2a2a]/60 hover:text-[#a90000] transition-colors -ml-1"
            >
              <ChevronLeft className="w-4 h-4" /> Alle albums
            </button>
            <AlbumCover album={selectedAlbum} size="lg" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: selectedAlbum.accent }}>
                Album
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#1c1915] leading-tight">{selectedAlbum.name}</h2>
              <p className="text-sm text-[#2a2a2a]/60 mt-1">
                {selectedAlbum.artist} · {selectedAlbum.tracks.length} nummers · {totalDuration(selectedAlbum)}
              </p>
              <button
                onClick={() => playFrom(selectedAlbum, 0)}
                className="mt-3 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#a90000] text-white text-sm font-semibold shadow-lg shadow-[#a90000]/25 hover:bg-[#8c0000] active:scale-95 transition-all"
              >
                <Play className="w-4 h-4" /> Afspelen
              </button>
            </div>
          </div>

          {/* Tracks */}
          <div className="divide-y divide-[#2a2a2a]/5">
            {selectedAlbum.tracks.map((t, i) => {
              const isCurrent = album?.id === selectedAlbum.id && currentTrack?.title === t.title;
              return (
                <div
                  key={t.title}
                  className={`flex items-center gap-3 px-4 sm:px-6 py-3 cursor-pointer transition-colors group ${
                    isCurrent ? 'bg-[#a90000]/8' : 'hover:bg-black/[0.03]'
                  }`}
                  onClick={() => {
                    if (isCurrent) {
                      togglePlay();
                    } else {
                      playFrom(selectedAlbum, i);
                    }
                  }}
                >
                  <div className="w-7 text-right text-sm tabular-nums text-[#2a2a2a]/50">
                    {isCurrent && playing ? (
                      <span className="inline-flex items-center gap-0.5" style={{ color: selectedAlbum.accent }}>
                        {/* animated equalizer */}
                        <span className="flex items-end gap-[2px] h-3.5">
                          <span className="w-[3px] bg-current animate-[eq1_0.8s_ease-in-out_infinite]" style={{ height: '60%' }} />
                          <span className="w-[3px] bg-current animate-[eq2_0.7s_ease-in-out_infinite]" style={{ height: '100%' }} />
                          <span className="w-[3px] bg-current animate-[eq3_0.9s_ease-in-out_infinite]" style={{ height: '40%' }} />
                        </span>
                      </span>
                    ) : (
                      i + 1
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium truncate ${isCurrent ? 'text-[#a90000]' : 'text-[#1c1915]'}`}>
                      {t.title}
                    </div>
                  </div>
                  <span className="text-sm tabular-nums text-[#2a2a2a]/45">{formatTime(t.duration)}</span>
                  {t.youtubeId && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setVideoTrack(t);
                      }}
                      className="p-2 rounded-full text-[#a90000]/60 hover:text-[#a90000] hover:bg-[#a90000]/10 transition-colors"
                      aria-label="Video bekijken op YouTube"
                      title="🎬 Video bekijken op YouTube"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81zM9.55 15.57V8.43L15.82 12l-6.27 3.57z" />
                      </svg>
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(t.src, '_blank');
                    }}
                    className="hidden sm:inline-flex p-2 rounded-full text-[#2a2a2a]/35 hover:text-[#a90000] hover:bg-[#a90000]/10 transition-colors"
                    aria-label="Download"
                    title="Download"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 4v12m0 0l-4-4m4 4l4-4" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playFrom(selectedAlbum, i);
                    }}
                    className="p-2 rounded-full text-[#2a2a2a]/35 hover:text-[#a90000] hover:bg-[#a90000]/10 transition-colors group-hover:opacity-100 opacity-0"
                    aria-label="Speel"
                  >
                    <Play className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* YouTube video modal */}
      {videoTrack && album && (
        <div
          className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setVideoTrack(null)}
        >
          <div
            className="w-full max-w-3xl rounded-2xl overflow-hidden bg-[#1a1a1a] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3">
              <div className="min-w-0">
                <div className="text-xs font-semibold uppercase tracking-wider text-[#d4a843]">Musicvideo</div>
                <div className="text-sm font-semibold text-white truncate">{videoTrack.title} — {album.name}</div>
              </div>
              <button
                onClick={() => setVideoTrack(null)}
                className="p-2 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors shrink-0"
                aria-label="Sluiten"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
              <iframe
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/${videoTrack.youtubeId}?autoplay=1&rel=0`}
                title={videoTrack.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      {/* Equalizer keyframes */}
      <style>{`
        @keyframes eq1 { 0%,100% { height: 40%; } 50% { height: 100%; } }
        @keyframes eq2 { 0%,100% { height: 90%; } 50% { height: 35%; } }
        @keyframes eq3 { 0%,100% { height: 50%; } 50% { height: 95%; } }
      `}</style>

      {/* Floating player bar */}
      <MusicPlayerBar
        album={album}
        track={currentTrack}
        playing={playing}
        current={current}
        duration={duration}
        volume={volume}
        muted={muted}
        shuffle={shuffle}
        repeat={repeat}
        onToggle={togglePlay}
        onPrev={() => skip(-1)}
        onNext={() => skip(1)}
        onSeek={seek}
        onVolume={changeVolume}
        onToggleMute={() => setMuted(m => !m)}
        onToggleShuffle={toggleShuffle}
        onCycleRepeat={cycleRepeat}
        onClose={() => {
          audioRef.current?.pause();
          setPlaying(false);
        }}
      />
    </div>
  );
}

// ============ Floating Player Bar ============

function MusicPlayerBar({
  album, track, playing, current, duration, volume, muted, shuffle, repeat,
  onToggle, onPrev, onNext, onSeek, onVolume, onToggleMute, onToggleShuffle, onCycleRepeat, onClose,
}: {
  album: MusicAlbum | null;
  track: MusicTrack | null;
  playing: boolean;
  current: number;
  duration: number;
  volume: number;
  muted: boolean;
  shuffle: boolean;
  repeat: 'off' | 'all' | 'one';
  onToggle: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSeek: (v: number) => void;
  onVolume: (v: number) => void;
  onToggleMute: () => void;
  onToggleShuffle: () => void;
  onCycleRepeat: () => void;
  onClose: () => void;
}) {
  if (!album || !track) return null;

  const pct = duration > 0 ? (current / duration) * 100 : 0;

  return (
    <div className="fixed left-0 right-0 bottom-24 md:bottom-6 z-50 px-2 sm:px-4 md:left-72 md:right-4">
      <div
        className="mx-auto max-w-3xl rounded-2xl border shadow-2xl shadow-black/25 backdrop-blur-xl overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${album.accent}f2, ${album.accent}cc)` }}
      >
        {/* Seek bar */}
        <div className="relative h-1.5 bg-white/20 cursor-pointer group"
             onClick={(e) => {
               const rect = e.currentTarget.getBoundingClientRect();
               const frac = (e.clientX - rect.left) / rect.width;
               onSeek(frac * duration);
             }}>
          <div className="absolute inset-y-0 left-0 bg-white/70 transition-[width] duration-100" style={{ width: `${pct}%` }} />
          <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow"
               style={{ left: `calc(${pct}% - 6px)` }} />
        </div>

        <div className="flex items-center gap-3 px-3 sm:px-4 py-2.5">
          {/* Track info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <img src={album.cover} alt="" className="w-11 h-11 rounded-lg object-cover shadow" />
            <div className="min-w-0">
              <div className="text-sm font-semibold text-white truncate">{track.title}</div>
              <div className="text-xs text-white/60 truncate">{album.name} · Robas</div>
            </div>
          </div>

          {/* Transport controls */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button onClick={onToggleShuffle}
                    className={`p-2 rounded-full transition-colors ${shuffle ? 'text-white bg-white/20' : 'text-white/50 hover:text-white/80'}`}
                    aria-label="Shuffle">
              <Shuffle className="w-4 h-4" />
            </button>
            <button onClick={onPrev} className="p-2 text-white/80 hover:text-white" aria-label="Vorige">
              <SkipBack className="w-5 h-5" />
            </button>
            <button onClick={onToggle}
                    className="w-11 h-11 rounded-full bg-white text-[#1c1915] flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform"
                    aria-label={playing ? 'Pauzeer' : 'Speel af'}>
              {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>
            <button onClick={onNext} className="p-2 text-white/80 hover:text-white" aria-label="Volgende">
              <SkipForward className="w-5 h-5" />
            </button>
            <button onClick={onCycleRepeat}
                    className={`p-2 rounded-full transition-colors ${repeat !== 'off' ? 'text-white bg-white/20' : 'text-white/50 hover:text-white/80'}`}
                    aria-label="Repeat">
              {repeat === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
            </button>
          </div>

          {/* Volume (desktop) */}
          <div className="hidden md:flex items-center gap-2 w-32">
            <button onClick={onToggleMute} className="text-white/70 hover:text-white" aria-label="Dempen">
              {muted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range" min={0} max={1} step={0.01}
              value={muted ? 0 : volume}
              onChange={(e) => onVolume(parseFloat(e.target.value))}
              className="w-full h-1 accent-white cursor-pointer"
              aria-label="Volume"
            />
          </div>

          {/* Close */}
          <button onClick={onClose} className="hidden sm:flex p-2 text-white/40 hover:text-white" aria-label="Speler sluiten">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}