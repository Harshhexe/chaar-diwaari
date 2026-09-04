"use client";

import { useEffect, useRef } from "react";
import { level, playhead } from "@/lib/playerSignals";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { cx } from "@/lib/utils";

interface Props {
  bars?: number;
  className?: string;
  /** Height in CSS pixels. */
  height?: number;
  /** Bars past the playhead are drawn dim; before it, lit. */
  showProgress?: boolean;
  color?: string;
  dim?: string;
}

/**
 * WAVEFORM
 * ---------------------------------------------------------------------------
 * A fixed, deterministic "shape" for the track (so it does not jitter like a
 * spectrum analyser) whose amplitude breathes with the live level. Canvas, one
 * RAF, no React re-renders — this can sit in the player bar for an entire
 * session without costing anything.
 */
export function Waveform({
  bars = 64,
  className,
  height = 28,
  showProgress = true,
  color = "#ede8e0",
  dim = "rgba(237,232,224,0.22)",
}: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Stable per-bar shape: two offset sines + a fixed hash. Reads as a
    // waveform, never as random noise.
    const shape = Array.from({ length: bars }, (_, i) => {
      const x = i / bars;
      const a = Math.sin(x * Math.PI * 7.3) * 0.5 + 0.5;
      const b = Math.sin(x * Math.PI * 2.1 + 1.7) * 0.5 + 0.5;
      const h = ((Math.imul(i + 1, 2654435761) >>> 0) % 1000) / 1000;
      return 0.18 + (a * 0.45 + b * 0.3 + h * 0.25) * 0.82;
    });

    let raf = 0;
    let w = 0;
    let h = 0;

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = height;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      raf = requestAnimationFrame(draw);
      if (!w) resize();
      ctx.clearRect(0, 0, w, h);

      const amp = reduced ? 0.55 : 0.42 + level.current * 0.68;
      const p =
        showProgress && playhead.duration > 0
          ? playhead.current / playhead.duration
          : 1;
      const gap = 2;
      const bw = Math.max(1, w / bars - gap);

      for (let i = 0; i < bars; i++) {
        const x = i * (bw + gap);
        // Bars nearest the playhead get a touch more lift — motion has a focus.
        const near = 1 - Math.min(1, Math.abs(i / bars - p) * 6);
        const bh = Math.max(1.5, shape[i] * h * amp * (0.85 + near * 0.35));
        ctx.fillStyle = i / bars <= p ? color : dim;
        ctx.fillRect(x, (h - bh) / 2, bw, bh);
      }
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [bars, height, showProgress, color, dim, reduced]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={cx("block w-full", className)}
      style={{ height }}
    />
  );
}
