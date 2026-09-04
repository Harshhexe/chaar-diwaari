"use client";

import { useCallback, useState } from "react";
import { timeline } from "@/data/timeline";
import { PinnedSection } from "@/components/motion/PinnedSection";
import { SafeImage } from "@/components/media/SafeImage";
import { cx } from "@/lib/utils";

/**
 * CAREER TIMELINE
 * ---------------------------------------------------------------------------
 * The year is the only fixed thing. It hangs at full display size while the
 * work moves through it: photographs slide in from the right and out to the
 * left, markers re-set, the body text re-writes. Reading it should feel like
 * travelling forward through the career rather than scanning a list of dates.
 *
 * Progress drives a single index, so exactly one entry is mounted-visible at a
 * time — no stack of years all animating at once.
 */
export function Timeline() {
  const [i, setI] = useState(0);
  const onProgress = useCallback((p: number) => {
    setI(Math.min(timeline.length - 1, Math.floor(p * timeline.length * 0.999)));
  }, []);

  const entry = timeline[i];

  return (
    <PinnedSection
      // Roughly half a viewport per year — a step through the career, not
      // a full screen of scrolling spent on each date.
      length={timeline.length * 0.55}
      onProgress={onProgress}
      id="timeline"
    >
      <div className="relative h-svh overflow-hidden">
        {/* --- the pinned year ----------------------------------------- */}
        <div className="pointer-events-none absolute inset-0 flex items-center edge-x">
          <div className="relative">
            <span className="t-label absolute -top-8 left-1 text-oxide">TIMELINE</span>
            <span
              key={entry.year}
              className="t-display t-hang block text-[clamp(5rem,22vw,18rem)] leading-[0.8] text-bone/10"
            >
              {entry.year}
            </span>
          </div>
        </div>

        {/* --- the work ------------------------------------------------- */}
        <div className="relative grid h-full grid-cols-1 items-center gap-8 edge-x lg:grid-cols-[1fr_minmax(0,34rem)] lg:gap-16">
          <div className="order-2 max-w-[46ch] lg:order-1">
            <p className="font-mono text-[0.72rem] tracking-[0.24em] text-oxide">
              {entry.year}
            </p>
            <h3
              key={`h-${entry.year}`}
              className="t-display mt-3 text-[clamp(1.8rem,5vw,3.6rem)] leading-[0.9] text-bone"
              style={{ animation: "tl-in 0.7s cubic-bezier(.16,1,.3,1) both" }}
            >
              {entry.headline}
            </h3>
            <p
              key={`b-${entry.year}`}
              className="mt-5 text-[0.98rem] leading-relaxed text-paper/85"
              style={{ animation: "tl-in 0.7s 0.06s cubic-bezier(.16,1,.3,1) both" }}
            >
              {entry.body}
            </p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {entry.markers.map((m, k) => (
                <li
                  key={`${entry.year}-${k}`}
                  className="t-label border border-bone/20 px-3 py-2 text-paper/70"
                  style={{ animation: `tl-in .6s ${0.12 + k * 0.06}s cubic-bezier(.16,1,.3,1) both` }}
                >
                  {m}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative order-1 aspect-[4/5] w-full max-w-[28rem] justify-self-end overflow-hidden lg:order-2 lg:aspect-[3/4] lg:max-w-none">
            <div
              key={`i-${entry.year}`}
              className="absolute inset-0"
              style={{ animation: "tl-plate 0.9s cubic-bezier(.16,1,.3,1) both" }}
            >
              <SafeImage
                image={entry.image}
                kind="still"
                label={`ADD ${entry.year} PHOTOGRAPH`}
                sizes="(max-width: 1024px) 90vw, 34rem"
              />
            </div>
            <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-bone/10" />
          </div>
        </div>

        {/* --- year rail ------------------------------------------------ */}
        <ol className="pointer-events-none absolute bottom-8 left-0 right-0 flex justify-center gap-4 edge-x sm:gap-6">
          {timeline.map((t, k) => (
            <li
              key={t.year}
              className={cx(
                "font-mono text-[0.62rem] tracking-[0.18em] transition-colors duration-500 tabular-nums",
                k === i ? "text-oxide" : k < i ? "text-paper/50" : "text-dust",
              )}
            >
              {t.year}
            </li>
          ))}
        </ol>
      </div>
    </PinnedSection>
  );
}
