"use client";

import { useClientValue } from "@/lib/hooks";

/**
 * ATMOSPHERE
 * ---------------------------------------------------------------------------
 * Three fixed layers, all pointer-transparent:
 *   1. a static SVG grain plate (never animated as a whole — that reads cheap;
 *      instead the plate is oversized and nudged in 8 discrete steps, which is
 *      how real film grain behaves and costs one transform per frame step),
 *   2. a soft vignette,
 *   3. a barely-there horizontal scanline field that only becomes visible
 *      during transitions (driven by `data-distort` on <html>).
 */
export function GrainOverlay() {
  // Grain is the first thing to cut on a weak device, and it is suppressed
  // entirely when the machine is already struggling. Read once, no re-render.
  const enabled = useClientValue(() => {
    const cores = navigator.hardwareConcurrency ?? 8;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return reduced ? cores > 2 : cores > 4;
  }, false);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[90]">
      {enabled && (
        <>
          {/* Primary film grain layer */}
          <div
            className="grain-layer absolute -inset-[140px] opacity-[0.22] mix-blend-overlay"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='260' height='260'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.88' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='260' height='260' filter='url(%23n)'/%3E%3C/svg%3E\")",
            }}
          />
          {/* Subtle secondary fine grain for depth */}
          <div
            className="grain-layer-alt absolute -inset-[100px] opacity-[0.12] mix-blend-color-dodge pointer-events-none"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n2'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n2)'/%3E%3C/svg%3E\")",
            }}
          />
        </>
      )}

      {/* Vignette depth */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(130% 100% at 50% 45%, transparent 38%, rgba(0,0,0,0.48) 75%, rgba(0,0,0,0.85) 100%)",
        }}
      />

      {/* Atmospheric CRT scanline texture */}
      <div className="scanlines absolute inset-0 opacity-[0.07] mix-blend-screen pointer-events-none" />

      {/* Signal noise glitch sweep bar */}
      <div className="vhs-glitch-line absolute inset-x-0 h-1 bg-oxide/20 opacity-0 mix-blend-screen pointer-events-none" />
    </div>
  );
}
