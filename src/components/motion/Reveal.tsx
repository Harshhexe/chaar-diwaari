"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useIsoLayoutEffect, usePrefersReducedMotion } from "@/lib/hooks";
import { cx } from "@/lib/utils";

export type RevealVariant =
  | "text" // opacity + rise. The default for copy.
  | "image" // scale down into place, blur off, opacity up.
  | "mask" // clip-path wipe from an edge — for important imagery.
  | "slide" // horizontal displacement, for large display type.
  | "scale"; // quiet push-in for artwork.

interface Props {
  children: ReactNode;
  variant?: RevealVariant;
  as?: ElementType;
  className?: string;
  delay?: number;
  duration?: number;
  /** Stagger children marked `data-reveal-item` instead of the wrapper. */
  stagger?: number;
  /** ScrollTrigger start. Default fires a little before the element lands. */
  start?: string;
  from?: "left" | "right" | "top" | "bottom";
  distance?: number;
}

const VARIANTS: Record<
  RevealVariant,
  { from: gsap.TweenVars; to: gsap.TweenVars; duration: number }
> = {
  text: {
    from: { opacity: 0, y: 30 },
    to: { opacity: 1, y: 0 },
    duration: 0.9,
  },
  image: {
    from: { opacity: 0, scale: 1.08, filter: "blur(12px)" },
    to: { opacity: 1, scale: 1, filter: "blur(0px)" },
    duration: 1.4,
  },
  mask: {
    from: { clipPath: "inset(0% 0% 100% 0%)", scale: 1.12 },
    to: { clipPath: "inset(0% 0% 0% 0%)", scale: 1 },
    duration: 1.5,
  },
  slide: {
    from: { opacity: 0, x: 80 },
    to: { opacity: 1, x: 0 },
    duration: 1.2,
  },
  scale: {
    from: { opacity: 0, scale: 0.94 },
    to: { opacity: 1, scale: 1 },
    duration: 1.1,
  },
};

const EDGE: Record<string, string> = {
  bottom: "inset(0% 0% 100% 0%)",
  top: "inset(100% 0% 0% 0%)",
  left: "inset(0% 100% 0% 0%)",
  right: "inset(0% 0% 0% 100%)",
};

/**
 * REVEAL — the single entry point for entrance motion.
 *
 * Nothing on this site appears instantly, and nothing gets bespoke entrance
 * code. Pick a variant; the timing curve, distance and trigger point come from
 * one table so the whole site breathes at the same tempo.
 *
 * Under `prefers-reduced-motion` every variant collapses to a short fade.
 */
export function Reveal({
  children,
  variant = "text",
  as: Tag = "div",
  className,
  delay = 0,
  duration,
  stagger,
  start = "top 82%",
  from,
  distance,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();

  useIsoLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const targets = stagger
        ? Array.from(root.querySelectorAll<HTMLElement>("[data-reveal-item]"))
        : [root];
      if (!targets.length) return;

      if (reduced) {
        gsap.fromTo(
          targets,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.45,
            delay,
            stagger: stagger ? Math.min(stagger, 0.06) : 0,
            scrollTrigger: { trigger: root, start: "top 92%", once: true },
          },
        );
        return;
      }

      const spec = VARIANTS[variant];
      const fromVars = { ...spec.from };
      if (variant === "mask" && from) fromVars.clipPath = EDGE[from];
      if (variant === "slide" && distance != null) {
        fromVars.x = from === "left" ? -distance : distance;
      }
      if (variant === "text" && distance != null) fromVars.y = distance;

      gsap.fromTo(targets, fromVars, {
        ...spec.to,
        duration: duration ?? spec.duration,
        delay,
        ease: variant === "mask" ? "expo.out" : "power3.out",
        stagger: stagger ?? 0,
        scrollTrigger: { trigger: root, start, once: true },
        // Keep the compositor clean once the reveal has finished.
        onComplete: () => gsap.set(targets, { clearProps: "filter,willChange" }),
      });
    }, root);

    return () => ctx.revert();
  }, [variant, delay, duration, stagger, start, from, distance, reduced]);

  const El = Tag as ElementType;

  // `image` and `mask` scale their target past its own box on the way in. On a
  // full-width element that pushes the document sideways — and stays that way
  // for anything the viewer never scrolls to. Clipping keeps the reveal inside
  // its frame, which is also what it should look like. `scale` is left
  // unclipped: it is used on cards whose drop shadows must escape.
  const clip = variant === "image" || variant === "mask";

  return (
    <El
      ref={ref}
      data-reveal
      className={cx(clip && "overflow-clip", className)}
    >
      {children}
    </El>
  );
}

/** Convenience alias used where copy should sharpen rather than rise. */
export function BlurReveal(props: Omit<Props, "variant">) {
  return <Reveal {...props} variant="image" />;
}

/** Re-measure after dynamic content mounts. */
export const refreshScroll = () => ScrollTrigger.refresh();
