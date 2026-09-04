"use client";

import { useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useIsoLayoutEffect, useIsDesktop, usePrefersReducedMotion } from "@/lib/hooks";
import { cx } from "@/lib/utils";

interface Props {
  children: ReactNode;
  className?: string;
  trackClassName?: string;
  /**
   * Scroll length as a multiple of the horizontal travel.
   *   1  = exactly 1:1 — a pixel of scroll moves the rail one pixel.
   *   >1 = the rail moves slower than the pointer (a longer, calmer section).
   * Values below 1 make the gallery outrun the scroll, which reads as broken,
   * so anything lower is clamped.
   */
  drag?: number;
  onProgress?: (p: number) => void;
}

/**
 * HORIZONTAL SCROLL — vertical wheel drives lateral travel.
 *
 * Desktop: the section pins and the track translates by exactly its overflow,
 * so the sequence starts and ends flush and hands the page back to vertical
 * scrolling without a jump.
 *
 * Touch / reduced-motion: no pinning, no hijack. The same markup becomes a
 * natively swipeable, snap-aligned rail — which is what a thumb actually wants.
 */
export function HorizontalScroll({
  children,
  className,
  trackClassName,
  drag = 1,
  onProgress,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const desktop = useIsDesktop();
  const reduced = usePrefersReducedMotion();
  const pinned = desktop && !reduced;

  useIsoLayoutEffect(() => {
    if (!pinned) return;
    const wrap = wrapRef.current;
    const track = trackRef.current;
    if (!wrap || !track) return;

    const ctx = gsap.context(() => {
      const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
      const ratio = Math.max(1, drag);

      gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: wrap,
          start: "top top",
          // The scroll length must be at least the travel distance, or the rail
          // covers more ground than the scroll driving it.
          end: () => `+=${distance() * ratio}`,
          pin: true,
          // Lenis already smooths the input. A numeric scrub stacks a second
          // lag on top and the rail ends up swimming behind the pointer.
          scrub: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => onProgress?.(self.progress),
        },
      });

      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    }, wrap);

    return () => {
      ctx.revert();
      ScrollTrigger.refresh();
    };
  }, [pinned, drag, onProgress]);

  return (
    // The pinned wrapper must clip: while pinned, the track is translated far
    // past the right edge, and with nothing clipping it the whole document
    // gains that width and the page scrolls sideways. Only the desktop path
    // needs it — on touch the inner rail is its own scroll container.
    <div
      ref={wrapRef}
      className={cx("relative", pinned && "overflow-hidden", className)}
    >
      <div
        ref={trackRef}
        className={cx(
          "flex",
          pinned
            ? "will-change-transform"
            : "no-scrollbar snap-x snap-mandatory overflow-x-auto overscroll-x-contain",
          trackClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}
