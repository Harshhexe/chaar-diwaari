"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { artist } from "@/data/artist";
import { gsap } from "@/lib/gsap";
import { usePrefersReducedMotion, useScrollLock } from "@/lib/hooks";

const MIN_MS = 550; // long enough to read the title card
const MAX_MS = 2600; // never hold the door shut waiting on a slow asset

/**
 * ENTRY
 * ---------------------------------------------------------------------------
 * A title card, not a fake progress bar. The counter is driven by work that is
 * actually happening — fonts resolving and the window load event — and is
 * capped so a slow network can never trap anyone behind it.
 *
 * On exit the wordmark scales past the edges of the viewport while the curtain
 * lifts, so the hero is revealed from *underneath* the type rather than faded
 * in behind it. That is the transition into the world.
 */
export function Preloader() {
  const [done, setDone] = useState(false);
  const [pct, setPct] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useScrollLock(!done);

  const exit = useCallback(() => {
    const root = rootRef.current;
    const word = wordRef.current;
    if (!root) return setDone(true);

    if (reduced) {
      gsap.to(root, {
        opacity: 0,
        duration: 0.45,
        onComplete: () => setDone(true),
      });
      return;
    }

    const tl = gsap.timeline({ onComplete: () => setDone(true) });
    tl.to("[data-preload-meta]", { opacity: 0, duration: 0.35, ease: "power2.in" })
      .to(
        word,
        {
          scale: 9,
          letterSpacing: "0.4em",
          filter: "blur(14px)",
          opacity: 0,
          duration: 1.5,
          ease: "expo.inOut",
        },
        "-=0.1",
      )
      .to(
        root,
        { clipPath: "inset(0% 0% 100% 0%)", duration: 1.15, ease: "expo.inOut" },
        "-=1.05",
      );
  }, [reduced]);

  useEffect(() => {
    let cancelled = false;
    const start = performance.now();

    const ready = Promise.race([
      Promise.all([
        document.fonts?.ready ?? Promise.resolve(),
        document.readyState === "complete"
          ? Promise.resolve()
          : new Promise((r) => window.addEventListener("load", r, { once: true })),
      ]),
      new Promise((r) => window.setTimeout(r, MAX_MS)),
    ]);

    // The counter tracks elapsed time against the cap, and snaps to 100 the
    // moment real readiness resolves — it never sits at 99 waiting.
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const elapsed = performance.now() - start;
      setPct((p) => Math.max(p, Math.min(96, Math.round((elapsed / MAX_MS) * 100))));
    };
    raf = requestAnimationFrame(tick);

    ready.then(async () => {
      cancelAnimationFrame(raf);
      if (cancelled) return;
      setPct(100);
      const wait = Math.max(0, MIN_MS - (performance.now() - start));
      await new Promise((r) => window.setTimeout(r, wait));
      if (cancelled) return;
      exit();
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [exit]);

  if (done) return null;

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[130] grid place-items-center bg-void"
      style={{ clipPath: "inset(0% 0% 0% 0%)" }}
      role="status"
      aria-live="polite"
      aria-label="Loading the Chaar Diwaari digital experience"
    >
      <div ref={wordRef} className="text-center will-change-transform">
        <p className="t-label text-bone">{artist.name}</p>
        <p className="t-label mt-2 text-dust">DIGITAL EXPERIENCE</p>
      </div>

      <div
        data-preload-meta
        className="absolute inset-x-0 bottom-0 edge-x pb-6 sm:pb-8"
      >
        <div className="flex items-end justify-between">
          <span lang="hi" className="t-meta font-deva text-paper/60">{artist.nameDevanagari}</span>
          <span className="font-mono text-[0.68rem] tracking-[0.24em] text-ash tabular-nums">
            {String(pct).padStart(3, "0")}
          </span>
        </div>
        <div className="mt-3 h-px w-full bg-bone/12">
          <div
            className="h-px bg-bone transition-[width] duration-300 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
