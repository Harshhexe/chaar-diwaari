"use client";

import { useRef } from "react";
import { artist } from "@/data/artist";
import { gsap } from "@/lib/gsap";
import { useIsoLayoutEffect, usePrefersReducedMotion } from "@/lib/hooks";
import { Reveal } from "@/components/motion/Reveal";
import { SafeImage } from "@/components/media/SafeImage";
import { SplitText } from "@/components/motion/SplitText";

/**
 * 02 — ABOUT
 * ---------------------------------------------------------------------------
 * Not a biography page. A question, a portrait you fall into, four words that
 * drift past each other at different speeds, and then the text — broken into
 * fragments with air around them so nobody is asked to read a wall.
 */
export function About() {
  const rootRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useIsoLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || reduced) return;

    const ctx = gsap.context(() => {
      // The portrait holds while the roles pass over it.
      gsap.to("[data-about-portrait]", {
        scale: 1.28,
        ease: "none",
        scrollTrigger: {
          trigger: "[data-about-stage]",
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });

      // Depth comes from each line travelling a different DISTANCE, not from
      // giving each one a different scrub lag. Lag-based depth reads as the
      // page struggling to keep up, and it compounds with Lenis's own easing.
      gsap.utils.toArray<HTMLElement>("[data-role]").forEach((el, i) => {
        const travel = 16 + i * 9;
        const dir = i % 2 === 0 ? 1 : -1;
        gsap.fromTo(
          el,
          { xPercent: travel * dir },
          {
            xPercent: -travel * dir,
            ease: "none",
            scrollTrigger: {
              trigger: "[data-about-stage]",
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      });
    }, root);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <div ref={rootRef} id="about" data-section className="relative">
      <div className="edge-x pt-[11vh]">
        <Reveal variant="text" className="mb-5 flex items-center gap-3">
          <span className="t-label text-oxide">02</span>
          <span className="h-px w-10 bg-bone/25" />
          <span className="t-label text-paper">ABOUT</span>
        </Reveal>

        <SplitText
          as="h2"
          text="WHO IS"
          by="char"
          stagger={0.05}
          className="t-display t-hang block text-[clamp(3rem,14vw,12rem)] leading-[0.8] text-bone"
        />
        <SplitText
          as="p"
          text="CHAAR DIWAARI?"
          by="char"
          stagger={0.035}
          delay={0.1}
          className="t-display t-hang block text-[clamp(2.2rem,10.5vw,9rem)] leading-[0.8] text-bone/40"
        />
      </div>

      {/* --- portrait stage -------------------------------------------- */}
      <div data-about-stage className="relative mt-[7vh] h-[112svh] overflow-hidden">
        <div className="sticky top-0 h-svh overflow-hidden">
          <div data-about-portrait className="absolute inset-0 will-change-transform">
            {/* A landscape frame for a full-bleed stage: the square artist
                images are only 640px wide and go soft at this scale. */}
            <SafeImage
              image={artist.portraits[3]}
              kind="portrait"
              sizes="100vw"
            />
          </div>
          <div className="absolute inset-0 bg-void/45" />
          <div className="absolute inset-0 bg-gradient-to-b from-void via-transparent to-void" />

          <div className="relative flex h-full flex-col justify-center gap-[1.5vh]">
            {artist.roles.map((role, i) => (
              <span
                key={role}
                data-role
                className="t-display block whitespace-nowrap text-[clamp(2.4rem,9vw,7.5rem)] leading-[0.85] will-change-transform"
                style={{
                  color: i % 2 === 0 ? "var(--color-bone)" : "transparent",
                  WebkitTextStroke:
                    i % 2 === 0 ? undefined : "1px rgba(237,232,224,0.5)",
                  textAlign: i % 2 === 0 ? "left" : "right",
                  paddingInline: "var(--edge)",
                  opacity: 0.92,
                }}
              >
                {role} — {role} — {role}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* --- biography fragments --------------------------------------- */}
      <div className="edge-x py-[10vh]">
        <div className="mx-auto max-w-[86rem] space-y-[7vh]">
          {artist.bio.map((fragment, i) => (
            <Reveal
              key={i}
              variant="text"
              className={
                i % 2 === 0
                  ? "max-w-[52ch]"
                  : "ml-auto max-w-[52ch] text-right"
              }
            >
              <p className="t-label mb-4 text-dust">
                {String(i + 1).padStart(2, "0")} / {String(artist.bio.length).padStart(2, "0")}
              </p>
              <p className="text-[clamp(1.05rem,2.1vw,1.6rem)] leading-[1.55] text-paper">
                {fragment}
              </p>
            </Reveal>
          ))}

          <Reveal variant="text" className="border-t border-bone/10 pt-8">
            <dl className="grid grid-cols-2 gap-y-6 sm:grid-cols-4">
              <div>
                <dt className="t-meta">BASED</dt>
                <dd className="mt-1 text-bone">{artist.based}</dd>
              </div>
              <div>
                <dt className="t-meta">NAME</dt>
                <dd lang="hi" className="mt-1 font-deva text-bone">{artist.nameDevanagari}</dd>
              </div>
              <div>
                <dt className="t-meta">ROLES</dt>
                <dd className="mt-1 text-bone">{artist.roles.length}</dd>
              </div>
              <div>
                <dt className="t-meta">SOURCES</dt>
                <dd className="mt-1 text-bone">OFFICIAL BIO · RSI · APPLE</dd>
              </div>
            </dl>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
