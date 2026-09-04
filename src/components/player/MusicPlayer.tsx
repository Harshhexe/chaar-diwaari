"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { artist } from "@/data/artist";
import { playhead } from "@/lib/playerSignals";
import { formatTime } from "@/lib/utils";
import { SafeImage } from "@/components/media/SafeImage";
import { usePlayer } from "./PlayerProvider";
import { Waveform } from "./Waveform";

const IconPlay = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden>
    <path d="M5 3.5v17l15-8.5-15-8.5z" />
  </svg>
);
const IconPause = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden>
    <path d="M5.5 3.5h4.5v17H5.5zM14 3.5h4.5v17H14z" />
  </svg>
);
const IconStep = ({ dir }: { dir: 1 | -1 }) => (
  <svg
    viewBox="0 0 24 24"
    width="13"
    height="13"
    fill="currentColor"
    aria-hidden
    style={{ transform: dir === -1 ? "scaleX(-1)" : undefined }}
  >
    <path d="M4 4l12 8-12 8V4zM18 4h2.5v16H18z" />
  </svg>
);

/**
 * PERSISTENT PLAYER
 * ---------------------------------------------------------------------------
 * Hidden until the first playback gesture, then it stays for the session — the
 * bar is rendered above the router, so moving between sections or routes never
 * interrupts the music.
 *
 * The progress bar and timecode are written directly to the DOM from a RAF
 * loop reading `playhead`; the component itself only re-renders when the track,
 * play state or volume actually change.
 */
export function MusicPlayer() {
  const p = usePlayer();
  const fillRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLSpanElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLElement>(null);
  const [scrubbing, setScrubbing] = useState(false);

  useEffect(() => {
    if (!p.started) return;
    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const d = playhead.duration || 1;
      const ratio = Math.min(1, playhead.current / d);
      if (fillRef.current) fillRef.current.style.transform = `scaleX(${ratio})`;
      if (timeRef.current) timeRef.current.textContent = formatTime(playhead.current);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [p.started]);

  /**
   * Reserve real space at the foot of the document so the bar never covers the
   * last frame of the experience. Measured, not guessed — the bar's height
   * changes with viewport width as controls drop out.
   */
  useEffect(() => {
    const root = document.documentElement;
    if (!p.started) {
      root.style.setProperty("--player-h", "0px");
      return;
    }
    const el = barRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      root.style.setProperty("--player-h", `${Math.round(entry.contentRect.height)}px`);
    });
    ro.observe(el);
    return () => {
      ro.disconnect();
      root.style.setProperty("--player-h", "0px");
    };
  }, [p.started]);

  const seekFromEvent = (clientX: number) => {
    const rail = railRef.current;
    if (!rail) return;
    const r = rail.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    p.seek(ratio * (playhead.duration || 0));
  };

  const song = p.song;

  return (
    <AnimatePresence>
      {p.started && song && (
        <motion.aside
          key="player"
          initial={{ y: "110%" }}
          animate={{ y: 0 }}
          exit={{ y: "110%" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          aria-label="Music player"
          className="fixed inset-x-0 bottom-0 z-[107] border-t border-bone/12 bg-void/80 backdrop-blur-xl"
          ref={barRef}
        >
          {/* Scrub rail — full width, 3px hit area grown to 14px for pointers. */}
          <div
            ref={railRef}
            role="slider"
            tabIndex={0}
            aria-label="Seek"
            aria-valuemin={0}
            aria-valuemax={Math.round(playhead.duration || 0)}
            aria-valuenow={Math.round(playhead.current)}
            aria-valuetext={`${formatTime(playhead.current)} of ${formatTime(playhead.duration)}`}
            data-cursor="DRAG"
            className="group relative -mt-[7px] h-[14px] w-full cursor-pointer"
            onPointerDown={(e) => {
              setScrubbing(true);
              e.currentTarget.setPointerCapture(e.pointerId);
              seekFromEvent(e.clientX);
            }}
            onPointerMove={(e) => scrubbing && seekFromEvent(e.clientX)}
            onPointerUp={() => setScrubbing(false)}
            onPointerCancel={() => setScrubbing(false)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") p.seek(playhead.current + 5);
              if (e.key === "ArrowLeft") p.seek(playhead.current - 5);
            }}
          >
            <div className="absolute inset-x-0 top-[6px] h-px bg-bone/15 transition-all group-hover:top-[5px] group-hover:h-[3px]">
              <div
                ref={fillRef}
                className="h-full w-full origin-left bg-oxide"
                style={{ transform: "scaleX(0)" }}
              />
            </div>
          </div>

          <div className="edge-x flex items-center gap-4 py-3 sm:gap-6 sm:py-4">
            {/* Artwork */}
            <div className="relative hidden h-12 w-12 shrink-0 overflow-hidden sm:block">
              <SafeImage
                image={p.album?.artwork ?? { src: null, seed: song.id, alt: "" }}
                kind="artwork"
                intensity={0.6}
                sizes="48px"
              />
            </div>

            {/* Transport */}
            <div className="flex shrink-0 items-center gap-1">
              <button
                onClick={p.prev}
                aria-label="Previous track"
                className="tap-safe grid place-items-center px-2 text-ash transition-colors hover:text-bone"
              >
                <IconStep dir={-1} />
              </button>
              <button
                onClick={p.toggle}
                aria-label={p.isPlaying ? "Pause" : "Play"}
                data-cursor={p.isPlaying ? "PAUSE" : "PLAY"}
                className="tap-safe grid h-11 w-11 place-items-center rounded-full bg-bone text-void transition-transform hover:scale-105 active:scale-95"
              >
                {p.isPlaying ? <IconPause /> : <IconPlay />}
              </button>
              <button
                onClick={p.next}
                aria-label="Next track"
                className="tap-safe grid place-items-center px-2 text-ash transition-colors hover:text-bone"
              >
                <IconStep dir={1} />
              </button>
            </div>

            {/* Now playing */}
            <div className="min-w-0 flex-1">
              <p className="truncate font-mono text-[0.72rem] uppercase tracking-[0.16em] text-bone">
                {song.title}
              </p>
              <p className="t-meta mt-1 truncate">
                {artist.name}
                <span className="mx-2 text-dust">/</span>
                {p.album?.title ?? "——"}
                {song.appleUrl && (
                  <>
                    <span className="mx-2 text-dust">/</span>
                    <a
                      href={song.appleUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-cursor="OPEN"
                      className="text-bone/75 hover:text-oxide underline-offset-4 hover:underline transition-colors"
                    >
                      STREAM ↗
                    </a>
                  </>
                )}
              </p>
            </div>

            {/* Live waveform — only meaningful while something is running. */}
            <div className="hidden w-40 shrink-0 lg:block xl:w-56">
              <Waveform bars={48} height={22} />
            </div>

            {/* Time */}
            <div className="hidden shrink-0 font-mono text-[0.68rem] tracking-[0.14em] text-ash sm:block">
              <span ref={timeRef}>0:00</span>
              <span className="mx-1 text-dust">/</span>
              <span>{formatTime(playhead.duration || p.duration)}</span>
            </div>

            {/* Volume */}
            <div className="hidden shrink-0 items-center gap-2 md:flex">
              <button
                onClick={p.toggleMute}
                aria-label={p.muted ? "Unmute" : "Mute"}
                className="t-label tap-safe px-1 text-ash transition-colors hover:text-bone"
              >
                {p.muted ? "MUTED" : "VOL"}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={p.muted ? 0 : p.volume}
                onChange={(e) => p.setVolume(parseFloat(e.target.value))}
                aria-label="Volume"
                className="cd-range h-1 w-20"
              />
            </div>

            {/* Lyrics */}
            {song.lyrics && song.lyrics.length > 0 && (
              <button
                onClick={() => p.setLyricsOpen(!p.lyricsOpen)}
                aria-pressed={p.lyricsOpen}
                className="t-label tap-safe shrink-0 px-2 text-ash transition-colors hover:text-bone"
              >
                LYRICS
              </button>
            )}

            <button
              onClick={p.close}
              aria-label="Stop playback and hide player"
              data-cursor="CLOSE"
              className="t-label tap-safe shrink-0 px-3 text-dust transition-colors hover:text-oxide"
            >
              ✕
            </button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
