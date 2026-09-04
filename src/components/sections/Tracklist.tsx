"use client";

import { artist } from "@/data/artist";
import { songsOfAlbum } from "@/data/songs";
import type { Album } from "@/data/types";
import { usePlayer } from "@/components/player/PlayerProvider";
import { Waveform } from "@/components/player/Waveform";
import { cx } from "@/lib/utils";

/**
 * TRACKLIST
 * ---------------------------------------------------------------------------
 * Shared by the in-page album environment and the /music/[album] route so a
 * record behaves identically however you reach it.
 *
 * The track number flips to a play glyph on hover/focus, the title shifts, and
 * a live waveform appears on the track that is actually playing. A track with
 * no audio file still plays — on the placeholder transport — and says so.
 */
export function Tracklist({ album, animated = false }: { album: Album; animated?: boolean }) {
  const player = usePlayer();
  const tracks = songsOfAlbum(album.id);

    if (tracks.length === 0) return null;

  return (
    <ol className="border-t border-bone/10">
      {tracks.map((song) => {
        const isCurrent = player.song?.id === song.id;
        const playing = isCurrent && player.isPlaying;
        return (
          <li key={song.id} {...(animated ? { "data-track": true, className: "opacity-0" } : {})}>
            <button
              onClick={() => player.playSong(song.id, album.songIds)}
              data-cursor={playing ? "PAUSE" : "PLAY"}
              aria-label={`Play ${song.title}`}
              className="group grid w-full grid-cols-[2.6rem_1fr_auto] items-center gap-4 border-b border-bone/10 py-4 text-left transition-colors hover:bg-bone/[0.03]"
            >
              <span className="relative block h-4 overflow-hidden font-mono text-[0.72rem] tracking-[0.2em] text-dust">
                <span className="block transition-transform duration-500 group-hover:-translate-y-full group-focus-visible:-translate-y-full">
                  {String(song.trackNumber).padStart(2, "0")}
                </span>
                <span className="absolute inset-0 block translate-y-full text-oxide transition-transform duration-500 group-hover:translate-y-0 group-focus-visible:translate-y-0">
                  ▶
                </span>
              </span>

              <span className="min-w-0">
                <span
                  className={cx(
                    "block truncate text-[1.05rem] transition-transform duration-500 group-hover:translate-x-2 motion-reduce:group-hover:translate-x-0",
                    isCurrent ? "text-oxide" : "text-bone",
                  )}
                >
                  {song.title}
                </span>
                <span className="t-meta mt-1 block truncate">
                  {song.artistCredit ?? artist.name}
                  {song.lyrics && (
                    <>
                      <span className="mx-2 text-dust">/</span>
                      <span className="text-oxide/80 font-mono text-[0.62rem]">LYRICS</span>
                    </>
                  )}
                </span>
              </span>

              <span className="flex items-center gap-4">
                <span
                  className={cx(
                    "hidden w-24 transition-opacity duration-500 sm:block",
                    playing ? "opacity-100" : "opacity-0",
                  )}
                >
                  <Waveform bars={22} height={16} showProgress={false} />
                </span>
                <span className="font-mono text-[0.72rem] tracking-[0.16em] text-ash tabular-nums">
                  {song.duration}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
