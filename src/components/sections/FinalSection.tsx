"use client";

import { useRef } from "react";
import { artist } from "@/data/artist";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useIsoLayoutEffect, usePrefersReducedMotion } from "@/lib/hooks";

/**
 * END
 * ---------------------------------------------------------------------------
 * No footer. The wordmark is pulled apart and driven out through both edges of
 * the frame while the ground goes completely black, leaving a single line of
 * metadata — a slate at the end of a reel.
 */
export function FinalSection() {
  const ref = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();

  useIsoLayoutEffect(() => {
    const root = ref.current;
    if (!root || reduced) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "+=240%",
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      });

      // Stillness beat at the entrance
      tl.to({}, { duration: 0.15 }, 0)
        .fromTo(
          "[data-end-label]",
          { opacity: 0, letterSpacing: "0.3em" },
          { opacity: 1, letterSpacing: "0.5em", duration: 0.22 },
          0.15,
        )
        .to("[data-end-label]", { opacity: 0, duration: 0.15 }, 0.40)
        .fromTo(
          "[data-end-w1]",
          { xPercent: 0, opacity: 0 },
          { opacity: 1, duration: 0.18 },
          0.38,
        )
        .fromTo(
          "[data-end-w2]",
          { xPercent: 0, opacity: 0 },
          { opacity: 1, duration: 0.18 },
          0.42,
        )
        .to("[data-end-w1]", { xPercent: -120, duration: 0.45, ease: "power2.inOut" }, 0.62)
        .to("[data-end-w2]", { xPercent: 120, duration: 0.45, ease: "power2.inOut" }, 0.62)
        .fromTo(
          "[data-end-slate]",
          { opacity: 0 },
          { opacity: 1, duration: 0.2 },
          0.85,
        );

      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    }, root);

    return () => {
      ctx.revert();
      ScrollTrigger.refresh();
    };
  }, [reduced]);

  return (
    <section
      ref={ref}
      id="end"
      data-section
      className="relative h-svh w-full overflow-hidden"
      aria-label="End"
    >
      <div className="flex h-full flex-col items-center justify-center gap-6">
        <p
          data-end-label
          className="t-label text-paper/70"
          style={{ letterSpacing: "0.4em" }}
        >
          END OF TRANSMISSION
        </p>

        <div className="w-full">
          <span
            data-end-w1
            className="t-display t-hang block whitespace-nowrap text-center text-[clamp(3.5rem,19vw,16rem)] leading-[0.8] text-bone will-change-transform"
          >
            {artist.nameParts[0]}
          </span>
          <span
            data-end-w2
            className="t-display t-hang block whitespace-nowrap text-center text-[clamp(3.5rem,19vw,16rem)] leading-[0.8] text-bone will-change-transform"
          >
            {artist.nameParts[1]}
          </span>
        </div>
      </div>

      <div
        data-end-slate
        className="pointer-events-none absolute inset-x-0 bottom-8 flex flex-col items-center gap-2 opacity-0"
      >
        <p lang="hi" className="font-deva text-[0.8rem] tracking-[0.1em] text-paper/40">
          {artist.nameDevanagari}
        </p>
        <p className="t-meta">{artist.name}</p>
        <p className="t-meta text-dust">DIGITAL EXPERIENCE</p>

        <a
          href="https://www.instagram.com/har3hhhhh/"
          target="_blank"
          rel="noopener noreferrer"
          data-cursor="@HARSH"
          className="pointer-events-auto t-label group mt-2 inline-flex items-center gap-2 border border-bone/25 bg-void/80 px-3.5 py-1.5 text-[0.7rem] tracking-[0.2em] text-bone backdrop-blur-md transition-all hover:border-oxide hover:bg-oxide hover:text-void shadow-md"
          aria-label="Made by Harsh on Instagram"
        >
          <span>MADE BY @ HARSH</span>
          <span className="text-oxide transition-colors group-hover:text-void">↗</span>
        </a>

        {/* The site uses a real artist's name and images. Saying so is not
            fine print — it is the difference between a tribute and a
            passing-off. */}
        <p className="t-meta mt-3 max-w-[46ch] text-center leading-relaxed text-dust">
          UNOFFICIAL PROJECT · NOT AFFILIATED WITH THE ARTIST OR HIS LABELS ·
          ALL MUSIC, ARTWORK AND FOOTAGE © THEIR RIGHTS HOLDERS
        </p>
      </div>
    </section>
  );
}
