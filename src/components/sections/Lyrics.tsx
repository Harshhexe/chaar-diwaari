"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { artist } from "@/data/artist";
import { albumById } from "@/data/albums";
import { songsWithLyrics } from "@/data/songs";
import type { Song } from "@/data/types";
import { playhead } from "@/lib/playerSignals";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { PinnedSection } from "@/components/motion/PinnedSection";
import { usePlayer } from "@/components/player/PlayerProvider";
import { cx } from "@/lib/utils";

interface Props {
  song: Song;
}

/**
 * LYRICS
 * ---------------------------------------------------------------------------
 * A pinned reading room. Scroll moves the playhead through the words: the
 * current line is fully lit, its neighbours dim, everything else falls back
 * into blur. Nothing scrolls in the conventional sense — the text is pulled
 * past a fixed reading line.
 *
 * If the same track is actually playing, the section defers to the audio and
 * follows real timestamps instead of scroll position. Reading and listening
 * never fight each other.
 *
 * Renders nothing at all when a song has no lyrics.
 */
export function Lyrics({ song }: Props) {
  const [currentSong, setCurrentSong] = useState<Song>(song);
  const [index, setIndex] = useState(0);
  const listRef = useRef<HTMLOListElement>(null);
  const player = usePlayer();
  const reduced = usePrefersReducedMotion();

  // If user plays a song with lyrics from the player, auto-switch to it
  useEffect(() => {
    if (player.song?.lyrics && player.song.lyrics.length > 0) {
      setCurrentSong(player.song);
    }
  }, [player.song]);

  const allLyricSongs = useMemo(() => {
    const list = songsWithLyrics();
    return list.length > 0 ? list : [song];
  }, [song]);

  const lines = useMemo(() => currentSong.lyrics ?? [], [currentSong.lyrics]);
  const followingAudio = player.song?.id === currentSong.id && player.isPlaying;

  const onProgress = useCallback(
    (p: number) => {
      if (followingAudio || lines.length === 0) return;
      setIndex(Math.min(lines.length - 1, Math.round(p * (lines.length - 1))));
    },
    [followingAudio, lines.length],
  );

  /* Timestamp sync while the track plays. */
  useEffect(() => {
    if (!followingAudio || lines.length === 0) return;
    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const t = playhead.current;
      let i = 0;
      for (let k = 0; k < lines.length; k++) {
        if ((lines[k].t ?? k * 6) <= t) i = k;
        else break;
      }
      setIndex((prev) => (prev === i ? prev : i));
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [followingAudio, lines]);

  if (lines.length === 0) return null;

  const album = albumById(currentSong.albumId);

  return (
    <PinnedSection
      id="lyrics"
      length={Math.max(2, lines.length * 0.28)}
      onProgress={onProgress}
    >
      <div className="relative flex h-svh items-center overflow-hidden edge-x">
        {/* Subtle background glow */}
        <div className="pointer-events-none absolute -left-20 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-oxide/5 blur-[120px]" />

        <div className="relative z-10 grid w-full gap-10 lg:grid-cols-[minmax(0,24rem)_1fr] lg:gap-20">
          {/* --- identity ------------------------------------------------ */}
          <div className="self-center">
            <div className="flex items-center gap-3">
              <span className="t-label text-oxide">01.1 — LYRICS</span>
              <span className="h-px w-6 bg-oxide/40" />
              <span className="t-label text-dust">OFFICIAL WORDS</span>
            </div>

            {/* Song Switcher Tabs */}
            {allLyricSongs.length > 1 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {allLyricSongs.map((s) => {
                  const isSelected = s.id === currentSong.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => {
                        setCurrentSong(s);
                        setIndex(0);
                      }}
                      data-cursor="VIEW"
                      className={cx(
                        "tap-safe font-mono text-[0.62rem] uppercase tracking-[0.16em] px-3 py-1.5 transition-all border",
                        isSelected
                          ? "border-oxide bg-oxide/15 text-bone shadow-[0_0_12px_rgba(215,48,15,0.35)]"
                          : "border-bone/15 text-dust hover:border-bone/35 hover:text-bone"
                      )}
                    >
                      {s.title}
                    </button>
                  );
                })}
              </div>
            )}

            <h3 className="t-display mt-5 text-[clamp(2.4rem,5.5vw,4.2rem)] leading-[0.84] text-bone glitch-hover">
              {currentSong.title}
            </h3>
            <p className="t-meta mt-3 text-bone/80">{currentSong.artistCredit ?? artist.name}</p>
            <p className="t-meta mt-1 text-dust">{album?.title ?? "——"} · {currentSong.duration}</p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                onClick={() => player.playSong(currentSong.id)}
                data-cursor="PLAY"
                className="t-label tap-safe border border-bone/25 px-4 py-3 text-bone transition-all hover:border-oxide hover:bg-oxide hover:text-void shadow-sm"
              >
                {followingAudio ? "PAUSE / PLAYING" : "PLAY TRACK"}
              </button>
              <span className="t-meta text-dust font-mono text-[0.68rem] tracking-wider">
                {followingAudio ? "● SYNCED TO AUDIO" : "↓ SCROLL OR SELECT LINE"}
              </span>
            </div>
          </div>

          {/* --- the words ----------------------------------------------- */}
          <div className="relative h-[64svh] overflow-hidden rounded-xl border border-bone/10 bg-void/60 p-6 backdrop-blur-md lg:h-[74svh] lg:p-10">
            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-24 bg-gradient-to-b from-void via-void/90 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-24 bg-gradient-to-t from-void via-void/90 to-transparent" />

            <ol
              ref={listRef}
              className="absolute inset-x-6 top-1/2 will-change-transform lg:inset-x-10"
              style={{
                transform: `translateY(calc(-50% - ${index * 3.8}rem))`,
                transition: reduced ? "none" : "transform 0.6s cubic-bezier(.16,1,.3,1)",
              }}
            >
              {lines.map((line, i) => {
                const d = Math.abs(i - index);
                const isCurrent = i === index;
                return (
                  <li
                    key={i}
                    aria-current={isCurrent ? "true" : undefined}
                    onClick={() => {
                      setIndex(i);
                      if (followingAudio && typeof line.t === "number") {
                        player.seek(line.t);
                      }
                    }}
                    data-cursor="VIEW"
                    className={cx(
                      "flex h-[3.8rem] cursor-pointer items-center text-[clamp(1.2rem,3vw,2.3rem)] tracking-tight transition-all duration-400 select-none",
                      isCurrent
                        ? "text-white font-bold"
                        : "text-bone/85 hover:text-white"
                    )}
                    style={{
                      opacity: d === 0 ? 1 : d === 1 ? 0.82 : d === 2 ? 0.60 : 0.38,
                      transform: `translateX(${d === 0 ? 12 : 0}px)`,
                      textShadow: isCurrent
                        ? "0 0 16px rgba(237,232,224,0.65), 0 0 32px rgba(215,48,15,0.4)"
                        : "none",
                    }}
                  >
                    <span
                      className={cx(
                        "mr-5 select-none font-mono text-[0.68rem] tracking-widest transition-colors",
                        isCurrent ? "text-oxide font-bold" : "text-dust"
                      )}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className={isCurrent ? "border-b border-oxide/40 pb-0.5" : ""}>
                      {line.text}
                    </span>
                  </li>
                );
              })}
            </ol>

            {/* Reading line — a hairline that marks where the eye should sit */}
            <div className="pointer-events-none absolute left-0 top-1/2 flex items-center -translate-y-1/2">
              <div className="h-[2px] w-12 bg-oxide shadow-[0_0_12px_var(--color-oxide)]" />
              <div className="h-2 w-2 rotate-45 bg-oxide shadow-[0_0_8px_var(--color-oxide)] -ml-1" />
            </div>
          </div>
        </div>
      </div>
    </PinnedSection>
  );
}
