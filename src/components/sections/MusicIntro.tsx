"use client";

import { useRef } from "react";
import { albums } from "@/data/albums";
import { songs } from "@/data/songs";
import { gsap } from "@/lib/gsap";
import { useIsoLayoutEffect, usePrefersReducedMotion } from "@/lib/hooks";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHeader } from "./SectionHeader";
import { Waveform } from "@/components/player/Waveform";

/**
 * 01 — MUSIC
 * ---------------------------------------------------------------------------
 * A breath between the hero and the discography. Nothing autoplays here: the
 * waveform sits at rest until the listener starts a track, at which point it
 * begins reading the live level. Stillness before the loud part.
 */
export function MusicIntro() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useIsoLayoutEffect(() => {
    const root = ref.current;
    if (!root || reduced) return;
    const ctx = gsap.context(() => {
      gsap.to("[data-sound-word]", {
        xPercent: -6,
        ease: "none",
        scrollTrigger: { trigger: root, start: "top bottom", end: "bottom top", scrub: true },
      });
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  const trackCount = songs.length;
  const years = albums.map((a) => a.year).sort();
  const first = years[0];
  const latest = years[years.length - 1];

  return (
    <div ref={ref} className="relative py-[11vh]">
      {/* The masthead drifts laterally against the page as you pass it —
          Level-2 motion, and the reason this wrapper carries the hook. */}
      <div data-sound-word className="will-change-transform">
        <SectionHeader
          index="01"
          label="MUSIC"
          title="THE SOUND"
          lede="Every release under the name, newest first."
        />
      </div>

      <div className="edge-x mt-[7vh]">
        <Reveal variant="image">
          <div className="relative">
            <Waveform bars={120} height={90} showProgress={false} dim="rgba(237,232,224,0.14)" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-void via-transparent to-void" />
          </div>
        </Reveal>

        <Reveal
          variant="text"
          stagger={0.08}
          className="mt-10 grid grid-cols-2 gap-y-6 border-t border-bone/10 pt-6 sm:grid-cols-4"
        >
          <div data-reveal-item>
            <p className="t-meta">RELEASES</p>
            <p className="mt-1 font-mono text-lg text-bone tabular-nums">
              {String(albums.length).padStart(2, "0")}
            </p>
          </div>
          <div data-reveal-item>
            <p className="t-meta">TRACKS</p>
            <p className="mt-1 font-mono text-lg text-bone tabular-nums">
              {String(trackCount).padStart(2, "0")}
            </p>
          </div>
          <div data-reveal-item>
            <p className="t-meta">SPAN</p>
            <p className="mt-1 font-mono text-lg text-bone tabular-nums">
              {first}—{latest}
            </p>
          </div>
          <div data-reveal-item>
            <p className="t-meta">AUDIO</p>
            <p className="mt-1 font-mono text-lg text-oxide">30s PREVIEWS</p>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
