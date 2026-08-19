'use client';

/**
 * MusicPlayerContext — de enige afspeel-engine van de site.
 *
 * Staat op het hoogste niveau (in ClientPage) zodat het <audio>-element
 * NOOIT onmount, hoe vaak de gebruiker ook van sectie wisselt. Alle
 * secties (Club Muziek, MiniPlayer) lezen uit deze context.
 *
 * Autostart: bij het openen van de site begint het clubalbum automatisch
 * te spelen. Blokkeren browsers dat (zonder gebruiker-actie), dan start
 * de muziek bij de eerste interactie (klik/tik/toets).
 */

import React, {
  createContext, useContext, useState, useEffect, useRef, useCallback,
} from 'react';
import { MUSIC_ALBUMS, type MusicAlbum, type MusicTrack } from '@/data/club-music';

// Build de afspelreeks (Spotify-stijl: album = context).
function buildQueue(album: MusicAlbum, startIndex: number, shuffle: boolean): MusicTrack[] {
  const tracks = [...album.tracks];
  if (shuffle) {
    const first = tracks.splice(startIndex, 1)[0];
    for (let i = tracks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tracks[i], tracks[j]] = [tracks[j], tracks[i]];
    }
    return [first, ...tracks];
  }
  return tracks;
}

export type RepeatMode = 'off' | 'all' | 'one';

interface MusicPlayerState {
  album: MusicAlbum | null;
  currentTrack: MusicTrack | null;
  playing: boolean;
  /** Autoplay was geblokkeerd; wacht op de eerste interactie. */
  autoplayPending: boolean;
  current: number;
  duration: number;
  volume: number;
  muted: boolean;
  shuffle: boolean;
  repeat: RepeatMode;
  playFrom: (alb: MusicAlbum, index: number, autoplay?: boolean) => void;
  togglePlay: () => void;
  skip: (dir: 1 | -1) => void;
  seek: (v: number) => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
}

const MusicCtx = createContext<MusicPlayerState | null>(null);

export function useMusicPlayer(): MusicPlayerState {
  const ctx = useContext(MusicCtx);
  if (!ctx) throw new Error('useMusicPlayer moet binnen <MusicPlayerProvider> gebruikt worden');
  return ctx;
}

// Album dat automatisch begint bij het openen van de site.
const AUTOSTART_ALBUM_ID = 'judoclub-michigami';
const DEFAULT_VOLUME = 0.85;

export function MusicPlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [album, setAlbum] = useState<MusicAlbum | null>(null);
  const [queue, setQueue] = useState<MusicTrack[]>([]);
  const [queuePos, setQueuePos] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [autoplayPending, setAutoplayPending] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(DEFAULT_VOLUME);
  const [muted, setMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<RepeatMode>('off');

  const queueRef = useRef(queue);
  const queuePosRef = useRef(queuePos);
  const repeatRef = useRef(repeat);
  const playingRef = useRef(playing);
  const shuffleRef = useRef(shuffle);
  queueRef.current = queue;
  queuePosRef.current = queuePos;
  repeatRef.current = repeat;
  playingRef.current = playing;
  shuffleRef.current = shuffle;

  const currentTrack = queue[queuePos] ?? null;

  const loadTrack = useCallback((src: string, autoplay: boolean) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = src;
    setCurrent(0);
    setDuration(0);
    if (autoplay) {
      audio.play().catch(() => {
        setPlaying(false);
        // Brouser blokkeerde geluid zonder interactie — wacht op een gebaar.
        setAutoplayPending(true);
      });
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
        setPlaying(false);
        return;
      }
    }
    setQueuePos(next);
    const t = queueRef.current[next];
    if (t) loadTrack(t.src, true);
  }, [loadTrack]);

  // ---- Audio-element lifecycle + autostart ----
  useEffect(() => {
    const audio = new Audio();
    audio.volume = DEFAULT_VOLUME;
    audioRef.current = audio;

    const onTime = () => setCurrent(audio.currentTime);
    const onMeta = () => setDuration(audio.duration || 0);
    const onEnd = () => handleTrackEnd();
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onMeta);
    audio.addEventListener('ended', onEnd);

    // Autostart: clubalbum bij het openen van de site.
    const startAlbum = MUSIC_ALBUMS.find(a => a.id === AUTOSTART_ALBUM_ID) ?? MUSIC_ALBUMS[0];
    setAlbum(startAlbum);
    setQueue(startAlbum.tracks);
    setQueuePos(0);
    if (startAlbum.tracks.length > 0) {
      audio.src = window.location.origin + startAlbum.tracks[0].src;
      audio
        .play()
        .then(() => {
          setPlaying(true);
          setAutoplayPending(false);
        })
        .catch(() => {
          setPlaying(false);
          setAutoplayPending(true);
        });
    }

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onMeta);
      audio.removeEventListener('ended', onEnd);
      audioRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Als autoplay geblokkeerd was: start bij de eerste interactie.
  useEffect(() => {
    if (!autoplayPending) return;
    const tryStart = () => {
      const audio = audioRef.current;
      if (!audio) return;
      audio
        .play()
        .then(() => {
          setPlaying(true);
          setAutoplayPending(false);
        })
        .catch(() => {});
    };
    window.addEventListener('pointerdown', tryStart, { once: true });
    window.addEventListener('keydown', tryStart, { once: true });
    return () => {
      window.removeEventListener('pointerdown', tryStart);
      window.removeEventListener('keydown', tryStart);
    };
  }, [autoplayPending]);

  // Houd <audio> in sync als de queue/positie verandert.
  useEffect(() => {
    const t = queue[queuePos];
    if (t && audioRef.current && audioRef.current.src !== window.location.origin + t.src) {
      loadTrack(t.src, playingRef.current);
    }
  }, [queue, queuePos, loadTrack]);

  // Volume/demping op het element.
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = muted ? 0 : volume;
  }, [volume, muted]);

  const playFrom = useCallback((alb: MusicAlbum, index: number, autoplay = true) => {
    setAlbum(alb);
    const q = buildQueue(alb, index, shuffleRef.current);
    setQueue(q);
    setQueuePos(0);
    const t = q[0];
    if (t) loadTrack(t.src, autoplay);
    setPlaying(autoplay);
    if (autoplay) setAutoplayPending(false);
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
      setAutoplayPending(false);
    }
  }, [playing, currentTrack]);

  const skip = useCallback((dir: 1 | -1) => {
    if (queueRef.current.length === 0) return;
    let next = queuePosRef.current + dir;
    if (next < 0) next = queueRef.current.length - 1;
    if (next >= queueRef.current.length) next = 0;
    setQueuePos(next);
    const t = queueRef.current[next];
    if (t) loadTrack(t.src, true);
    setPlaying(true);
    setAutoplayPending(false);
  }, [loadTrack]);

  const seek = useCallback((v: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = v;
    setCurrent(v);
  }, []);

  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
    setMuted(v === 0);
  }, []);

  const toggleMute = useCallback(() => setMuted(m => !m), []);

  const toggleShuffle = useCallback(() => {
    const next = !shuffleRef.current;
    setShuffle(next);
    const alb = album;
    const t = currentTrack;
    if (alb && t) {
      const idx = alb.tracks.findIndex(tr => tr.title === t.title);
      const q = buildQueue(alb, idx, next);
      setQueue(q);
      setQueuePos(0);
      const first = q[0];
      if (first) loadTrack(first.src, playingRef.current);
    }
  }, [album, currentTrack, loadTrack]);

  const cycleRepeat = useCallback(() => {
    setRepeat(r => (r === 'off' ? 'all' : r === 'all' ? 'one' : 'off'));
  }, []);

  return (
    <MusicCtx.Provider
      value={{
        album,
        currentTrack,
        playing,
        autoplayPending,
        current,
        duration,
        volume,
        muted,
        shuffle,
        repeat,
        playFrom,
        togglePlay,
        skip,
        seek,
        setVolume,
        toggleMute,
        toggleShuffle,
        cycleRepeat,
      }}
    >
      {children}
    </MusicCtx.Provider>
  );
}