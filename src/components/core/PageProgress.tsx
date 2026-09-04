"use client";

import { useEffect, useRef, useState } from "react";
import { cx } from "@/lib/utils";

interface Props {
  /** Section ids in document order. Any `[data-section]` element is tracked. */
  total?: number;
}

/**
 * PROGRESS
 * ---------------------------------------------------------------------------
 * Replaces the native scrollbar (hidden globally) with two quiet signals: the
 * index of the section you are in, and a hairline that fills with document
 * progress. Enough to orient, never enough to look like chrome.
 */
export function PageProgress({ total }: Props) {
  const [index, setIndex] = useState(1);
  const [count, setCount] = useState(total ?? 6);
  const [visible, setVisible] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("[data-section]"),
    );
    // Measured after paint: the section count is DOM-derived, so reading it in
    // the effect body would run before layout has settled.
    const measure = requestAnimationFrame(() => {
      if (sections.length) setCount(sections.length);
    });

    const io = new IntersectionObserver(
      (entries) => {
        // The section occupying the most of the viewport wins.
        const best = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!best) return;
        const i = sections.indexOf(best.target as HTMLElement);
        if (i >= 0) setIndex(i + 1);
      },
      { threshold: [0.15, 0.35, 0.6, 0.9] },
    );
    sections.forEach((s) => io.observe(s));

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const p = max > 0 ? window.scrollY / max : 0;
        if (barRef.current) barRef.current.style.transform = `scaleY(${p})`;
        setVisible(window.scrollY > window.innerHeight * 0.45);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
      cancelAnimationFrame(measure);
    };
  }, []);

  return (
    <div
      aria-hidden
      className={cx(
        "pointer-events-none fixed left-[max(0.9rem,calc(var(--edge)*0.42))] top-1/2 z-[92] hidden -translate-y-1/2 flex-col items-center gap-4 transition-opacity duration-700 md:flex",
        visible ? "opacity-100" : "opacity-0",
      )}
    >
      <span className="font-mono text-[0.62rem] tracking-[0.2em] text-bone tabular-nums">
        {String(index).padStart(2, "0")}
      </span>
      <div className="relative h-28 w-px bg-bone/15">
        <div
          ref={barRef}
          className="absolute inset-x-0 top-0 h-full origin-top bg-oxide"
          style={{ transform: "scaleY(0)" }}
        />
      </div>
      <span className="font-mono text-[0.62rem] tracking-[0.2em] text-dust tabular-nums">
        {String(count).padStart(2, "0")}
      </span>
    </div>
  );
}
