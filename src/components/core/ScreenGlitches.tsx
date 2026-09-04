"use client";

import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/hooks";

interface GlitchSlice {
  top: number; // percentage
  height: number; // pixels
  offset: number; // pixels
  color: string;
}

/**
 * SCREEN GLITCHES
 * ---------------------------------------------------------------------------
 * Sporadic, realistic CRT/digital glitches that flash erratically across the
 * screen. Fits the abrasive, experimental Chaar Diwaari aesthetic.
 * Pointer-transparent, fully GPU-accelerated.
 */
export function ScreenGlitches() {
  const reduced = usePrefersReducedMotion();
  const [glitching, setGlitching] = useState(false);
  const [slices, setSlices] = useState<GlitchSlice[]>([]);
  const [screenShift, setScreenShift] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    if (reduced) return;

    let timeoutId: NodeJS.Timeout;
    let burstTimeoutId: NodeJS.Timeout;

    const triggerGlitch = () => {
      // Generate 2-4 random horizontal slice displacements
      const count = Math.floor(Math.random() * 3) + 2;
      const newSlices: GlitchSlice[] = [];
      const colors = ["rgba(215,48,15,0.7)", "rgba(237,232,224,0.5)", "rgba(215,48,15,0.85)"];

      for (let i = 0; i < count; i++) {
        newSlices.push({
          top: Math.floor(Math.random() * 92),
          height: Math.floor(Math.random() * 14) + 2,
          offset: (Math.random() - 0.5) * 36,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }

      setSlices(newSlices);
      setScreenShift({
        x: (Math.random() - 0.5) * 6,
        y: (Math.random() - 0.5) * 3,
      });
      setGlitching(true);

      // Brief burst duration (70ms - 160ms)
      const burstDuration = Math.floor(Math.random() * 90) + 70;
      burstTimeoutId = setTimeout(() => {
        setGlitching(false);
        setSlices([]);
        setScreenShift({ x: 0, y: 0 });

        // Next random interval (2.5s to 6s)
        const nextDelay = Math.floor(Math.random() * 3500) + 2500;
        timeoutId = setTimeout(triggerGlitch, nextDelay);
      }, burstDuration);
    };

    // Initial trigger
    timeoutId = setTimeout(triggerGlitch, 2000);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(burstTimeoutId);
    };
  }, [reduced]);

  if (reduced || !glitching) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[98] overflow-hidden"
      style={{
        transform: `translate3d(${screenShift.x}px, ${screenShift.y}px, 0)`,
      }}
    >
      {/* Glitch slices */}
      {slices.map((slice, i) => (
        <div
          key={i}
          className="absolute inset-x-0 will-change-transform mix-blend-screen"
          style={{
            top: `${slice.top}%`,
            height: `${slice.height}px`,
            backgroundColor: slice.color,
            transform: `translateX(${slice.offset}px)`,
            boxShadow: `0 0 12px ${slice.color}`,
            filter: "contrast(180%)",
          }}
        />
      ))}

      {/* Screen chromatic aberration flash */}
      <div
        className="absolute inset-0 opacity-40 mix-blend-color-dodge"
        style={{
          background:
            "linear-gradient(90deg, rgba(215,48,15,0.18) 0%, transparent 40%, rgba(237,232,224,0.15) 60%, transparent 100%)",
        }}
      />
    </div>
  );
}
