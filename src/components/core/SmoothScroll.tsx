"use client";

import Lenis from "lenis";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { usePrefersReducedMotion } from "@/lib/hooks";

interface ScrollApi {
  /** Live instance, or null under reduced motion. Read it, do not store it. */
  lenisRef: { current: Lenis | null };
  scrollTo: (target: string | number | HTMLElement, offset?: number) => void;
  stop: () => void;
  start: () => void;
}

const ScrollContext = createContext<ScrollApi>({
  lenisRef: { current: null },
  scrollTo: () => {},
  stop: () => {},
  start: () => {},
});

export const useSmoothScroll = () => useContext(ScrollContext);

/**
 * SCROLL ENGINE
 * ---------------------------------------------------------------------------
 * Lenis owns the scroll position; GSAP's ticker drives it, and every Lenis
 * frame pushes ScrollTrigger. One RAF loop for the entire site — no competing
 * animation loops, no jitter between pinned sections and smooth scrolling.
 *
 * With `prefers-reduced-motion` we never instantiate Lenis at all: native
 * scrolling, and ScrollTrigger falls back to its own listener.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduced = usePrefersReducedMotion();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (reduced) {
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
      return;
    }

    const instance = new Lenis({
      // Weight, not lag. Past about a second the page stops feeling attached
      // to the wheel, and every scrubbed section inherits that disconnection.
      duration: 0.85,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
      syncTouch: false,
      autoRaf: false,
    });

    lenisRef.current = instance;

    instance.on("scroll", ScrollTrigger.update);
    // Lenis is not the only thing that can move the page: in-page anchors, the
    // browser restoring a scroll position, find-in-page and any programmatic
    // window.scrollTo all fire a native scroll event that Lenis does not emit.
    // Without this, ScrollTrigger silently desyncs and pinned sections render
    // in stale positions.
    window.addEventListener("scroll", ScrollTrigger.update, { passive: true });

    const tick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    ScrollTrigger.sort();
    ScrollTrigger.refresh();

    return () => {
      window.removeEventListener("scroll", ScrollTrigger.update);
      gsap.ticker.remove(tick);
      instance.destroy();
      lenisRef.current = null;
    };
  }, [reduced]);

  // Media loading changes document height; re-measure once things settle.
  useEffect(() => {
    const refresh = () => {
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    };
    const t = window.setTimeout(refresh, 600);
    window.addEventListener("load", refresh);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("load", refresh);
    };
  }, []);

  // Stable for the lifetime of the provider: consumers reach the instance
  // through the ref, so starting or destroying Lenis never re-renders the app.
  const api = useMemo<ScrollApi>(
    () => ({
      lenisRef,
      scrollTo: (target, offset = 0) => {
        if (lenisRef.current) {
          lenisRef.current.scrollTo(target, { offset, duration: 1.4 });
          return;
        }
        const el =
          typeof target === "string" ? document.querySelector(target) : target;
        if (typeof target === "number") {
          window.scrollTo({ top: target + offset });
        } else if (el instanceof HTMLElement) {
          window.scrollTo({ top: el.offsetTop + offset });
        }
      },
      stop: () => lenisRef.current?.stop(),
      start: () => lenisRef.current?.start(),
    }),
    [],
  );

  return <ScrollContext.Provider value={api}>{children}</ScrollContext.Provider>;
}
