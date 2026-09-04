"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { songsOfAlbum } from "@/data/songs";
import type { Album } from "@/data/types";
import { gsap } from "@/lib/gsap";
import { useEscape, useFocusTrap, usePrefersReducedMotion, useScrollLock } from "@/lib/hooks";
import { SafeImage } from "@/components/media/SafeImage";
import { Tracklist } from "./Tracklist";

interface Props {
  album: Album;
  /** Bounding box of the artwork that was clicked — the transition's origin. */
  origin: DOMRect | null;
  onClose: () => void;
}

/**
 * ALBUM ENVIRONMENT
 * ---------------------------------------------------------------------------
 * Opening a record is a transition, not a navigation. The artwork you clicked
 * is lifted out of the gallery, expanded to fill the frame, held for a beat,
 * then settled into the environment while the tracklist writes itself in.
 *
 * The motion is a manual FLIP: the artwork is a fixed-position element driven
 * from the clicked element's rect, to the viewport, to the measured slot in the
 * final layout. That keeps it exact at every breakpoint and lets the sequence
 * be reversed precisely on close.
 */
export function AlbumExperience({ album, origin, onClose }: Props) {
  const rootRef = useFocusTrap<HTMLDivElement>(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const artRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const [settled, setSettled] = useState(false);
  const reduced = usePrefersReducedMotion();
  const tracks = songsOfAlbum(album.id);

  useScrollLock(true);

  // Ensure scroll container starts at top
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, []);

  const close = useCallback(() => {
    setSettled(false);
    const art = artRef.current;
    if (!art || reduced || !origin) return onClose();
    gsap
      .timeline({ onComplete: onClose })
      .to("[data-album-body]", { opacity: 0, y: 16, duration: 0.3 })
      .to(
        art,
        {
          left: origin.left,
          top: origin.top,
          width: origin.width,
          height: origin.height,
          duration: 0.7,
          ease: "expo.inOut",
        },
        "-=0.15",
      )
      .to(bgRef.current, { opacity: 0, duration: 0.4 }, "-=0.35");
  }, [onClose, origin, reduced]);

  useEscape(close, true);

  useLayoutEffect(() => {
    const art = artRef.current;
    const slot = slotRef.current;
    if (!art || !slot) return;

    if (scrollRef.current) scrollRef.current.scrollTop = 0;

    if (reduced || !origin) {
      setSettled(true);
      gsap.fromTo(bgRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
      return;
    }

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const full = Math.min(vw * 0.86, vh * 0.75);

    const displace = document.querySelector("#cd-displace feDisplacementMap");

    const ctx = gsap.context(() => {
      gsap.set(art, {
        left: origin.left,
        top: origin.top,
        width: origin.width,
        height: origin.height,
        opacity: 1,
      });

      const tl = gsap.timeline({
        onComplete: () => {
          setSettled(true);
        },
      });

      if (displace) {
        art.style.filter = "url(#cd-displace)";
        tl.fromTo(
          displace,
          { attr: { scale: 26 } },
          {
            attr: { scale: 0 },
            duration: 0.9,
            ease: "power2.out",
            onComplete: () => {
              art.style.filter = "";
            },
          },
          0,
        );
      }

      tl.to(bgRef.current, { opacity: 1, duration: 0.5 }, 0)
        // 1 — the record fills the frame
        .to(
          art,
          {
            left: (vw - full) / 2,
            top: (vh - full) / 2,
            width: full,
            height: full,
            duration: 0.85,
            ease: "expo.inOut",
          },
          0,
        )
        // 2 — a beat of stillness
        .to({}, { duration: 0.15 })
        // 3 — it settles into the environment
        .to(art, { ...rectOf(slot), duration: 0.85, ease: "expo.inOut" })
        .fromTo(
          "[data-album-body]",
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.8 },
          "-=0.55",
        )
        .fromTo(
          "[data-track]",
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.045 },
          "-=0.5",
        );
    });

    return () => ctx.revert();
  }, [origin, reduced]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${album.title} — album`}
      className="fixed inset-0 z-[105]"
    >
      <div
        ref={bgRef}
        className="absolute inset-0 bg-void opacity-0"
        style={{
          backgroundImage: `radial-gradient(80% 60% at 20% 30%, ${album.tone}55, transparent 70%)`,
        }}
        onClick={close}
      />

      {/* --- top bar --------------------------------------------------- */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-30 flex items-start justify-between edge-x pt-5 sm:pt-7">
        <button
          onClick={close}
          className="pointer-events-auto tap-safe -m-2 grid place-items-center p-2 t-display text-[1.6rem] leading-none tracking-[0.02em] text-bone transition-colors hover:text-oxide sm:text-[1.9rem]"
          aria-label="Close album and return to discography"
          data-cursor="CLOSE"
        >
          CD
        </button>

        <button
          onClick={close}
          aria-label="Close album"
          data-cursor="CLOSE"
          className="pointer-events-auto tap-safe t-label -mr-2 px-3 py-2 text-bone transition-colors hover:text-oxide"
        >
          ✕ CLOSE
        </button>
      </div>

      {/* Travelling artwork during FLIP animation only */}
      <div
        ref={artRef}
        className="pointer-events-none fixed z-20 overflow-hidden"
        style={{
          left: 0,
          top: 0,
          width: 0,
          height: 0,
          opacity: settled ? 0 : 1,
          visibility: settled ? "hidden" : "visible",
        }}
      >
        <SafeImage
          image={album.artwork}
          kind="artwork"
          sizes="(max-width: 1024px) 90vw, 42vw"
          priority
        />
      </div>

      <div ref={scrollRef} className="relative z-10 h-full overflow-y-auto overscroll-contain">
        <div className="edge-x flex min-h-full flex-col gap-10 pt-16 pb-24 lg:flex-row lg:gap-16 lg:pt-20 lg:pb-28 items-start">
          {/* left column — the artwork's resting place */}
          <div className="w-full lg:w-[42%] max-w-[480px] shrink-0">
            <div ref={slotRef} className="relative aspect-square w-full max-h-[62vh] overflow-hidden bg-void/30 border border-bone/10">
              {settled && (
                <SafeImage
                  image={album.artwork}
                  kind="artwork"
                  sizes="(max-width: 1024px) 90vw, 42vw"
                  priority
                />
              )}
            </div>

            <div data-album-body className="mt-8 max-w-[46ch] opacity-0">
              <p className="t-meta">
                {album.format}
                <span className="mx-2 text-dust">/</span>
                {album.year}
                <span className="mx-2 text-dust">/</span>
                {tracks.length} TRACKS
              </p>
              <p className="mt-5 text-[0.95rem] leading-relaxed text-paper/80">
                {album.description}
              </p>
              {album.appleUrl && (
                <a
                  href={album.appleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="OPEN"
                  className="t-label mt-6 inline-block border border-bone/25 px-5 py-3 text-bone transition-colors hover:border-oxide hover:text-oxide"
                >
                  HEAR IT IN FULL ↗
                </a>
              )}
              {album.copyright && (
                <p className="t-meta mt-6 normal-case tracking-[0.06em] text-dust">
                  {album.copyright}
                </p>
              )}
            </div>
          </div>

          {/* right column — the record itself */}
          <div className="flex-1 min-w-0 w-full">
            <div data-album-body className="opacity-0">
              <h2 className="t-display t-hang text-[clamp(2.4rem,7vw,6rem)] leading-[0.85] text-bone">
                {album.title}
              </h2>
              {album.subtitle && <p className="t-meta mt-3 text-dust">{album.subtitle}</p>}
            </div>

            <div className="mt-8">
              <Tracklist album={album} animated />
            </div>
          </div>
        </div>
      </div>

      <p className="sr-only">
        {album.title}, {album.format}, {album.year}. {tracks.length} tracks.
      </p>
    </div>,
    document.body,
  );
}

/** Absolute viewport rect of an element, in the shape GSAP wants. */
function rectOf(el: HTMLElement) {
  const r = el.getBoundingClientRect();
  return { left: r.left, top: r.top, width: r.width, height: r.height };
}
