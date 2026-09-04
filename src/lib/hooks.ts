"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

/** SSR-safe layout effect. */
export const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function useMediaQuery(query: string, fallback = false): boolean {
  return useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === "undefined") return () => {};
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onStoreChange);
      return () => mql.removeEventListener("change", onStoreChange);
    },
    () => (typeof window !== "undefined" ? window.matchMedia(query).matches : fallback),
    () => fallback,
  );
}

/** True only for a real pointer on a wide viewport — gates cursor + heavy FX. */
export const useIsDesktop = () =>
  useMediaQuery("(min-width: 1024px) and (pointer: fine)");

export const useIsTouch = () => useMediaQuery("(pointer: coarse)", false);

/** Honoured everywhere. When true the site runs on fades alone. */
export const usePrefersReducedMotion = () =>
  useMediaQuery("(prefers-reduced-motion: reduce)");

const noopSubscribe = () => () => {};

/**
 * Reads a value that only exists in the browser (feature detection, device
 * capability) without a setState-in-effect round trip. `compute` must be pure
 * and return a stable value for the same environment.
 */
export function useClientValue<T>(compute: () => T, serverValue: T): T {
  return useSyncExternalStore(noopSubscribe, compute, () => serverValue);
}

/**
 * requestAnimationFrame loop that never re-renders React.
 * The callback receives (deltaMs, elapsedMs).
 */
export function useRaf(cb: (dt: number, t: number) => void, active = true) {
  const saved = useRef(cb);
  // Kept fresh after each render so the loop below never needs to restart.
  useEffect(() => {
    saved.current = cb;
  });

  useEffect(() => {
    if (!active) return;
    let id = 0;
    let last = performance.now();
    const start = last;
    const tick = (now: number) => {
      id = requestAnimationFrame(tick);
      saved.current(now - last, now - start);
      last = now;
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [active]);
}

/** Locks page scroll (menus, viewers, album overlay). Ref-counted. */
let lockCount = 0;
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    lockCount += 1;
    document.documentElement.classList.add("lenis-stopped");
    document.body.style.overflow = "hidden";
    return () => {
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount === 0) {
        document.documentElement.classList.remove("lenis-stopped");
        document.body.style.overflow = "";
      }
    };
  }, [locked]);
}

/** Calls `cb` on Escape. */
export function useEscape(cb: () => void, active = true) {
  const saved = useRef(cb);
  useEffect(() => {
    saved.current = cb;
  });
  useEffect(() => {
    if (!active) return;
    const on = (e: KeyboardEvent) => {
      if (e.key === "Escape") saved.current();
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [active]);
}

/**
 * Traps Tab focus inside a container while it is open — required for the
 * fullscreen menu, the album overlay and the photo viewer.
 */
export function useFocusTrap<T extends HTMLElement>(active: boolean) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!active || !ref.current) return;
    const root = ref.current;
    const prev = document.activeElement as HTMLElement | null;

    const focusables = () =>
      Array.from(
        root.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => el.offsetParent !== null);

    focusables()[0]?.focus({ preventScroll: true });

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const list = focusables();
      if (!list.length) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    root.addEventListener("keydown", onKey);
    return () => {
      root.removeEventListener("keydown", onKey);
      prev?.focus?.();
    };
  }, [active]);

  return ref;
}

/** Smoothed pointer position in normalised [-1, 1] space. Desktop only. */
export function usePointerParallax(strength = 1, enabled = true) {
  const target = useRef({ x: 0, y: 0 });
  const value = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!enabled) return;
    const on = (e: PointerEvent) => {
      target.current.x = (e.clientX / window.innerWidth - 0.5) * 2 * strength;
      target.current.y = (e.clientY / window.innerHeight - 0.5) * 2 * strength;
    };
    window.addEventListener("pointermove", on, { passive: true });
    return () => window.removeEventListener("pointermove", on);
  }, [strength, enabled]);

  const sample = useCallback((lerp = 0.08) => {
    value.current.x += (target.current.x - value.current.x) * lerp;
    value.current.y += (target.current.y - value.current.y) * lerp;
    return value.current;
  }, []);

  return sample;
}
