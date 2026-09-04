"use client";

import { useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useIsoLayoutEffect, usePrefersReducedMotion } from "@/lib/hooks";
import { cx } from "@/lib/utils";

interface Props {
  children: ReactNode;
  className?: string;
  /** Scroll length while pinned, in viewport heights. */
  length?: number;
  onProgress?: (p: number) => void;
  /** Disable pinning below this width (px). */
  minWidth?: number;
  id?: string;
}

/**
 * PINNED SECTION — Level-3 motion. Hold the viewport still and let the content
 * move through it. Used sparingly: lyrics, the scrubbed film, the timeline.
 *
 * Never pins under reduced motion or on narrow screens; the children simply
 * stack and scroll normally, and `onProgress` is driven by ordinary viewport
 * position so dependent UI still works.
 */
export function PinnedSection({
  children,
  className,
  length = 3,
  onProgress,
  minWidth = 0,
  id,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const canPin = !reduced && window.innerWidth >= minWidth;

      if (!canPin) {
        gsap.to(
          {},
          {
            scrollTrigger: {
              trigger: el,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
              onUpdate: (self) => onProgress?.(self.progress),
            },
          },
        );
        return;
      }

      gsap.to(
        {},
        {
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: () => `+=${window.innerHeight * length}`,
            pin: true,
            scrub: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => onProgress?.(self.progress),
          },
        },
      );

      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    }, el);

    return () => {
      ctx.revert();
      ScrollTrigger.refresh();
    };
  }, [length, minWidth, onProgress, reduced]);

  return (
    <section ref={ref} id={id} className={cx("relative", className)}>
      {children}
    </section>
  );
}
