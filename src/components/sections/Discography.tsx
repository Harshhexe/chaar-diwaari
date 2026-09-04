"use client";

import { useCallback, useRef, useState } from "react";
import { albums } from "@/data/albums";
import { songsOfAlbum } from "@/data/songs";
import type { Album } from "@/data/types";
import { useIsDesktop, usePrefersReducedMotion } from "@/lib/hooks";
import { gsap } from "@/lib/gsap";
import { HorizontalScroll } from "@/components/motion/HorizontalScroll";
import { SafeImage } from "@/components/media/SafeImage";
import dynamic from "next/dynamic";

// The album environment only exists once a record is opened. Keeping it out of
// the initial bundle costs nothing — it is always behind a click.
const AlbumExperience = dynamic(
  () => import("./AlbumExperience").then((m) => m.AlbumExperience),
  { ssr: false },
);
import { cx } from "@/lib/utils";

/** Vertical offsets, in vh — the gallery must never read as a straight row. */
const OFFSETS = [0, 13, 5, 19, 9, 22, 2, 15];

/**
 * DISCOGRAPHY
 * ---------------------------------------------------------------------------
 * Not a grid. A pinned lateral gallery driven by vertical scroll, with the
 * records hung at different heights so the eye travels rather than scans.
 *
 * Hovering a record tilts it toward the pointer, lifts its title, and bleeds
 * the record's own tone into the section background — the environment adapts to
 * whatever you are looking at. Clicking hands off to the album environment.
 *
 * On touch the same markup becomes a snap-scrolling rail. No hijack, no tilt.
 */
export function Discography() {
  const [open, setOpen] = useState<{ album: Album; rect: DOMRect | null } | null>(null);
  const [tone, setTone] = useState<string | null>(null);
  const desktop = useIsDesktop();
  const reduced = usePrefersReducedMotion();
  const interactive = desktop && !reduced;

  const openAlbum = useCallback((album: Album, el: HTMLElement | null) => {
    setOpen({ album, rect: el?.getBoundingClientRect() ?? null });
  }, []);

  return (
    <div id="music" data-section className="relative">
      {/* Tone plate — the section quietly takes on the colour of the record
          under the pointer, then falls back to black. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-opacity duration-700"
        style={{
          opacity: tone ? 1 : 0,
          backgroundImage: tone
            ? `radial-gradient(70% 50% at 50% 45%, ${tone}66, transparent 72%)`
            : undefined,
        }}
      />

      <HorizontalScroll
        className="relative"
        trackClassName="h-svh items-center gap-[8vw] px-[var(--edge)] lg:gap-[6vw]"
        // 1:1. The rail must never cover more ground than the scroll that
        // drives it — that is what makes a lateral section feel broken.
        drag={1}
      >
        {albums.map((album, i) => (
          <AlbumCard
            key={album.id}
            album={album}
            offset={OFFSETS[i % OFFSETS.length]}
            index={i}
            interactive={interactive}
            onOpen={openAlbum}
            onHover={(t) => setTone(t)}
          />
        ))}

        {/* Terminal panel — the sequence resolves rather than just stopping. */}
        <div className="flex h-full shrink-0 snap-center items-center pr-[var(--edge)]">
          <div className="w-[70vw] max-w-[420px] sm:w-[34vw]">
            <p className="t-label text-oxide">END OF DISCOGRAPHY</p>
            <p className="t-editorial mt-4 text-[clamp(1.4rem,3vw,2.6rem)] leading-tight text-paper/85">
              Every release under the name, 2021 to now.
            </p>
            <p className="t-meta mt-6">
              SOURCE: APPLE MUSIC CATALOGUE, 04.09.2026
            </p>
          </div>
        </div>
      </HorizontalScroll>

      {open && (
        <AlbumExperience
          album={open.album}
          origin={open.rect}
          onClose={() => setOpen(null)}
        />
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function AlbumCard({
  album,
  offset,
  index,
  interactive,
  onOpen,
  onHover,
}: {
  album: Album;
  offset: number;
  index: number;
  interactive: boolean;
  onOpen: (album: Album, el: HTMLElement | null) => void;
  onHover: (tone: string | null) => void;
}) {
  const artRef = useRef<HTMLDivElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);
  const trackCount = songsOfAlbum(album.id).length;

  const tilt = (e: React.PointerEvent) => {
    if (!interactive || !artRef.current) return;
    const r = artRef.current.getBoundingClientRect();
    const x = (e.clientX - (r.left + r.width / 2)) / r.width;
    const y = (e.clientY - (r.top + r.height / 2)) / r.height;
    gsap.to(artRef.current, {
      rotateY: x * 9,
      rotateX: -y * 9,
      x: x * 14,
      y: y * 10,
      duration: 0.8,
      ease: "power3.out",
      transformPerspective: 900,
    });
  };

  const enter = () => {
    onHover(album.tone);
    if (!interactive) return;
    gsap.to(artRef.current, { scale: 1.03, duration: 0.7, ease: "power3.out" });
    gsap.to(metaRef.current, { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" });
  };

  const leave = () => {
    onHover(null);
    if (!interactive) return;
    gsap.to(artRef.current, {
      rotateX: 0,
      rotateY: 0,
      x: 0,
      y: 0,
      scale: 1,
      duration: 1,
      ease: "elastic.out(1, 0.5)",
    });
    gsap.to(metaRef.current, { y: 10, opacity: 0, duration: 0.4 });
  };

  return (
    <article
      className="relative flex h-full shrink-0 snap-center items-center"
      style={{ transform: `translateY(${offset * 0.4}vh)` }}
    >
      <button
        onClick={() => onOpen(album, artRef.current)}
        onPointerMove={tilt}
        onPointerEnter={enter}
        onPointerLeave={leave}
        onFocus={enter}
        onBlur={leave}
        data-cursor="OPEN"
        aria-label={`Open ${album.title}, ${album.format}, ${album.year}`}
        className="group block w-[74vw] text-left sm:w-[46vw] lg:w-[30vw] xl:w-[26vw]"
      >
        <div className="relative">
          <span className="t-label absolute -top-8 left-0 text-dust">
            {String(index + 1).padStart(2, "0")}
          </span>

          <div
            ref={artRef}
            className="relative aspect-square w-full overflow-hidden will-change-transform"
          >
            <SafeImage
              image={album.artwork}
              kind="artwork"
              label={`ADD ARTWORK → /albums/${album.slug}`}
              sizes="(max-width: 640px) 74vw, (max-width: 1024px) 46vw, 32vw"
            />
            {/* Title over the artwork, revealed on approach. */}
            <div
              ref={metaRef}
              className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-[10px] bg-gradient-to-t from-void/90 to-transparent p-5 opacity-0"
            >
              <p className="t-label text-bone">OPEN RECORD</p>
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-start justify-between gap-6">
          <div className="min-w-0">
            <h3
              className={cx(
                "t-display text-[clamp(1.5rem,3.4vw,2.6rem)] leading-none text-bone",
                "transition-transform duration-500 group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0",
              )}
            >
              {album.title}
            </h3>
            {album.subtitle && <p className="t-meta mt-2 truncate">{album.subtitle}</p>}
          </div>
          <div className="shrink-0 text-right">
            <p className="t-meta">{album.year}</p>
            <p className="t-meta mt-1 text-dust">{album.format}</p>
            <p className="t-meta mt-1 text-dust">
              {String(trackCount).padStart(2, "0")} TRK
            </p>
          </div>
        </div>
      </button>
    </article>
  );
}
