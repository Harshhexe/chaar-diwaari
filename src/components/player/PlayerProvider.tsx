"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { albumById } from "@/data/albums";
import { songById, songs } from "@/data/songs";
import type { Album, Song } from "@/data/types";
import { level, playhead, syntheticLevel } from "@/lib/playerSignals";
import { parseDuration } from "@/lib/utils";

interface PlayerState {
  song: Song | null;
  album: Album | undefined;
  isPlaying: boolean;
  /** False when the loaded track has no audio file yet. */
  hasAudio: boolean;
  /** True once the user has started playback at least once. Reveals the bar. */
  started: boolean;
  duration: number;
  volume: number;
  muted: boolean;
  lyricsOpen: boolean;
  queue: string[];
}

interface PlayerApi extends PlayerState {
  playSong: (id: string, queue?: string[]) => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  seek: (seconds: number) => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  setLyricsOpen: (v: boolean) => void;
  close: () => void;
}

const PlayerContext = createContext<PlayerApi | null>(null);

export function usePlayer(): PlayerApi {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used inside <PlayerProvider>");
  return ctx;
}

/**
 * PERSISTENT PLAYBACK
 * ---------------------------------------------------------------------------
 * Lives above the router, so music never stops when the user moves between
 * sections or routes.
 *
 * Two transports behind one API:
 *  1. REAL — an <audio> element plus a Web Audio analyser feeding `level`.
 *  2. PLACEHOLDER — when a track has no audio file, a RAF clock advances the
 *     playhead over the track's listed duration and `level` is filled with a
 *     deterministic envelope. Progress, lyric sync and the reactive visuals all
 *     behave exactly as they will with real audio, and the UI says plainly
 *     that no file is loaded. Nothing silently pretends to be playing music.
 */
export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const bufRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const rafRef = useRef(0);
  const lastTickRef = useRef(0);
  /** Latest `next` for the transport loop and the audio "ended" handler. */
  const nextRef = useRef<() => void>(() => {});

  const [state, setState] = useState<PlayerState>({
    song: null,
    album: undefined,
    isPlaying: false,
    hasAudio: false,
    started: false,
    duration: 0,
    volume: 0.8,
    muted: false,
    lyricsOpen: false,
    queue: [],
  });

  /* ---------------------------------------------------------------- audio */

  const ensureAudio = useCallback(() => {
    if (audioRef.current) return audioRef.current;
    const el = new Audio();
    el.preload = "metadata";
    el.crossOrigin = "anonymous";
    audioRef.current = el;
    return el;
  }, []);

  /** Analyser is created lazily on first real playback (needs a user gesture). */
  const ensureAnalyser = useCallback((el: HTMLAudioElement) => {
    if (ctxRef.current) return;
    try {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ac = new AC();
      const source = ac.createMediaElementSource(el);
      const analyser = ac.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.82;
      source.connect(analyser);
      analyser.connect(ac.destination);
      ctxRef.current = ac;
      analyserRef.current = analyser;
      bufRef.current = new Uint8Array(new ArrayBuffer(analyser.fftSize));
    } catch {
      // Analyser unavailable (older Safari, blocked context). Playback still
      // works; reactive visuals fall back to the synthetic envelope.
      analyserRef.current = null;
    }
  }, []);

  /* ------------------------------------------------------------ transport */

  useEffect(() => {
    const tick = (now: number) => {
      rafRef.current = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - (lastTickRef.current || now)) / 1000);
      lastTickRef.current = now;

      const el = audioRef.current;
      const real = state.hasAudio && el && el.src;

      if (real) {
        playhead.current = el.currentTime;
        playhead.duration = Number.isFinite(el.duration) ? el.duration : state.duration;
      } else if (state.isPlaying) {
        playhead.current = Math.min(playhead.duration, playhead.current + dt);
        if (playhead.duration > 0 && playhead.current >= playhead.duration) {
          // Placeholder track finished — advance exactly like real audio would.
          queueMicrotask(() => nextRef.current());
        }
      }

      const analyser = analyserRef.current;
      const buf = bufRef.current;
      if (real && state.isPlaying && analyser && buf) {
        analyser.getByteTimeDomainData(buf);
        let sum = 0;
        for (let i = 0; i < buf.length; i++) {
          const v = (buf[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / buf.length);
        level.current += (Math.min(1, rms * 2.6) - level.current) * 0.2;
        level.bass += (Math.min(1, rms * 3.2) - level.bass) * 0.12;
        level.isSynthetic = false;
      } else if (state.isPlaying) {
        const s = syntheticLevel(playhead.current);
        level.current += (s.rms - level.current) * 0.14;
        level.bass += (s.bass - level.bass) * 0.1;
        level.isSynthetic = true;
      } else {
        level.current += (0 - level.current) * 0.06;
        level.bass += (0 - level.bass) * 0.06;
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [state.isPlaying, state.hasAudio, state.duration]);

  /* -------------------------------------------------------------- actions */

  const playSong = useCallback(
    (id: string, queue?: string[]) => {
      const song = songById(id);
      if (!song) return;

      const album = albumById(song.albumId);
      // A one-track release would otherwise trap next/prev on itself, so a
      // single flows into the rest of the catalogue instead of looping.
      const nextQueue =
        queue && queue.length > 1
          ? queue
          : album && album.songIds.length > 1
            ? album.songIds
            : songs.map((s) => s.id);

      const hasAudio = Boolean(song.audio);
      const listed = parseDuration(song.duration);

      playhead.current = 0;
      playhead.duration = listed;

      if (hasAudio) {
        const el = ensureAudio();
        el.src = song.audio as string;
        el.volume = state.muted ? 0 : state.volume;
        ensureAnalyser(el);
        void ctxRef.current?.resume();
        el.play().catch(() => {
          setState((s) => ({ ...s, isPlaying: false }));
        });
      } else {
        audioRef.current?.pause();
      }

      setState((s) => ({
        ...s,
        song,
        album,
        queue: nextQueue,
        hasAudio,
        isPlaying: true,
        started: true,
        duration: listed,
        lyricsOpen: s.lyricsOpen && Boolean(song.lyrics),
      }));
    },
    [ensureAudio, ensureAnalyser, state.muted, state.volume],
  );

  const toggle = useCallback(() => {
    setState((s) => {
      if (!s.song) return s;
      const nextPlaying = !s.isPlaying;
      const el = audioRef.current;
      if (s.hasAudio && el) {
        if (nextPlaying) {
          void ctxRef.current?.resume();
          el.play().catch(() => {});
        } else {
          el.pause();
        }
      }
      return { ...s, isPlaying: nextPlaying };
    });
  }, []);

  const step = useCallback(
    (dir: 1 | -1) => {
      setState((s) => {
        if (!s.song || !s.queue.length) return s;
        const i = s.queue.indexOf(s.song.id);
        const nextId = s.queue[(i + dir + s.queue.length) % s.queue.length];
        queueMicrotask(() => playSong(nextId, s.queue));
        return s;
      });
    },
    [playSong],
  );

  const next = useCallback(() => step(1), [step]);
  const prev = useCallback(() => step(-1), [step]);

  // `step` closes over `playSong`, so `next` changes identity; the loops above
  // read it through a ref that is refreshed after every render.
  useEffect(() => {
    nextRef.current = next;
  });

  const seek = useCallback((seconds: number) => {
    const clamped = Math.max(0, Math.min(playhead.duration || 0, seconds));
    playhead.current = clamped;
    const el = audioRef.current;
    if (el && el.src) el.currentTime = clamped;
  }, []);

  const setVolume = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(1, v));
    setState((s) => {
      if (audioRef.current) audioRef.current.volume = s.muted ? 0 : clamped;
      return { ...s, volume: clamped };
    });
  }, []);

  const toggleMute = useCallback(() => {
    setState((s) => {
      const muted = !s.muted;
      if (audioRef.current) audioRef.current.volume = muted ? 0 : s.volume;
      return { ...s, muted };
    });
  }, []);

  const setLyricsOpen = useCallback(
    (v: boolean) => setState((s) => ({ ...s, lyricsOpen: v })),
    [],
  );

  const close = useCallback(() => {
    audioRef.current?.pause();
    playhead.current = 0;
    setState((s) => ({ ...s, started: false, isPlaying: false, lyricsOpen: false }));
  }, []);

  /* Real audio ending advances the queue. */
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onEnd = () => nextRef.current();
    const onMeta = () => {
      if (Number.isFinite(el.duration)) {
        playhead.duration = el.duration;
        setState((s) => ({ ...s, duration: el.duration }));
      }
    };
    el.addEventListener("ended", onEnd);
    el.addEventListener("loadedmetadata", onMeta);
    return () => {
      el.removeEventListener("ended", onEnd);
      el.removeEventListener("loadedmetadata", onMeta);
    };
  }, [state.song?.id]);

  /* Keyboard transport. Space is ignored while typing or on a focused control. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT|BUTTON|A)$/.test(t.tagName)))
        return;
      if (!state.song) return;
      if (e.code === "Space") {
        e.preventDefault();
        toggle();
      } else if (e.code === "ArrowRight" && e.shiftKey) next();
      else if (e.code === "ArrowLeft" && e.shiftKey) prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.song, toggle, next, prev]);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      void ctxRef.current?.close();
    };
  }, []);

  const api = useMemo<PlayerApi>(
    () => ({
      ...state,
      playSong,
      toggle,
      next,
      prev,
      seek,
      setVolume,
      toggleMute,
      setLyricsOpen,
      close,
    }),
    [state, playSong, toggle, next, prev, seek, setVolume, toggleMute, setLyricsOpen, close],
  );

  return <PlayerContext.Provider value={api}>{children}</PlayerContext.Provider>;
}
