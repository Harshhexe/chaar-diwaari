"use client";

import { useRef, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";
import { useIsoLayoutEffect, usePrefersReducedMotion } from "@/lib/hooks";
import { cx } from "@/lib/utils";

interface Props {
  children: ReactNode;
  /** Positive = travels slower than the page. 0.2 is a strong, tasteful move. */
  speed?: number;
  /** Adds a counter-scale so the image never reveals its own edges. */
  scaleCompensate?: boolean;
  axis?: "y" | "x";
  className?: string;
}

/**
 * PARALLAX — scroll-linked displacement.
 *
 * Depth comes from several elements moving at *different* speeds within one
 * composition, not from one element moving a lot. Keep `speed` small and vary
 * it between siblings.
 */
export function Parallax({
  children,
  speed = 0.18,
  scaleCompensate = true,
  axis = "y",
  className,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;

    const ctx = gsap.context(() => {
      const distance = speed * 100;
      gsap.fromTo(
        el,
        axis === "y" ? { yPercent: -distance / 2 } : { xPercent: -distance / 2 },
        {
          [axis === "y" ? "yPercent" : "xPercent"]: distance / 2,
          ease: "none",
          scrollTrigger: {
            trigger: el.parentElement ?? el,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true,
          },
        },
      );
    }, el);

    return () => ctx.revert();
  }, [speed, axis, reduced]);

  return (
    <div
      ref={ref}
      className={cx("h-full w-full will-change-transform", className)}
      style={
        scaleCompensate && !reduced
          ? { scale: 1 + Math.abs(speed) * 1.15 }
          : undefined
      }
    >
      {children}
    </div>
  );
}
