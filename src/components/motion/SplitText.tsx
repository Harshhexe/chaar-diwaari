"use client";

import { useMemo, useRef, type ElementType } from "react";
import { gsap } from "@/lib/gsap";
import { useIsoLayoutEffect, usePrefersReducedMotion } from "@/lib/hooks";
import { cx } from "@/lib/utils";

interface Props {
  text: string;
  as?: ElementType;
  className?: string;
  /** Word = editorial copy. Char = display type. Line = quotes. */
  by?: "word" | "char" | "line";
  stagger?: number;
  delay?: number;
  start?: string;
  /** Animate on mount instead of on scroll (hero, overlays). */
  immediate?: boolean;
  ariaLabel?: string;
}

/**
 * SPLIT TEXT — masked, per-unit type reveal.
 *
 * Each unit sits inside an `overflow:hidden` box and rises out of it, so type
 * appears to be uncovered rather than faded in. The whole string is exposed to
 * assistive tech once via aria-label while the visual fragments are hidden, so
 * screen readers never hear "C H A A R" letter by letter.
 */
export function SplitText({
  text,
  as: Tag = "span",
  className,
  by = "word",
  stagger = 0.045,
  delay = 0,
  start = "top 85%",
  immediate = false,
  ariaLabel,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();

  const units = useMemo(() => {
    if (by === "line") return text.split("\n");
    if (by === "char") return Array.from(text);
    return text.split(" ");
  }, [text, by]);

  useIsoLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const targets = root.querySelectorAll<HTMLElement>("[data-split-unit]");
      if (!targets.length) return;

      if (reduced) {
        gsap.fromTo(
          root,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.4,
            delay,
            ...(immediate ? {} : { scrollTrigger: { trigger: root, start: "top 92%", once: true } }),
          },
        );
        return;
      }

      gsap.fromTo(
        targets,
        { yPercent: 118, rotate: by === "char" ? 3 : 0, opacity: 0 },
        {
          yPercent: 0,
          rotate: 0,
          opacity: 1,
          duration: 1.1,
          ease: "expo.out",
          stagger,
          delay,
          ...(immediate
            ? {}
            : { scrollTrigger: { trigger: root, start, once: true } }),
        },
      );
    }, root);

    return () => ctx.revert();
  }, [by, stagger, delay, start, immediate, reduced]);

  const El = Tag as ElementType;

  return (
    <El ref={ref} className={cx(className)} aria-label={ariaLabel ?? text}>
      {units.map((unit, i) => (
        <span
          key={`${unit}-${i}`}
          aria-hidden
          className={cx(
            "mask-line",
            by === "line" ? "block" : "inline-block",
            by === "word" && "mr-[0.26em]",
          )}
        >
          <span data-split-unit className="inline-block will-change-transform">
            {unit === " " ? " " : unit}
          </span>
        </span>
      ))}
    </El>
  );
}
