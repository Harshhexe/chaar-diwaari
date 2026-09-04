"use client";

import { useRef } from "react";
import { artist } from "@/data/artist";
import { gsap } from "@/lib/gsap";
import {
  useIsoLayoutEffect,
  useIsDesktop,
  usePointerParallax,
  usePrefersReducedMotion,
  useRaf,
} from "@/lib/hooks";
import { SafeImage } from "@/components/media/SafeImage";

/**
 * HERO
 * ---------------------------------------------------------------------------
 * The composition is a centred portrait plate with the wordmark broken across
 * it: CHAAR in front of the plate, DIWAARI behind it. That single overlap does
 * the work — it reads as a printed cover rather than a header on an image.
 *
 * Scroll choreography (pinned, scrubbed, ~1.8 viewports):
 *   0.00 → type is soft and slightly oversized, plate is tight and dark
 *   0.25 → type sharpens and settles
 *   0.45 → the two words separate outward, opening the plate
 *   0.70 → the plate expands past the frame edges and lifts
 *   1.00 → full bleed, type gone, handing off to 01 — MUSIC
 *
 * Reduced motion gets the same composition as a still, with a quiet fade-in.
 */
export function Hero() {
  const rootRef = useRef<HTMLElement>(null);
  const plateRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const w1Ref = useRef<HTMLSpanElement>(null);
  const w2Ref = useRef<HTMLSpanElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const devaRef = useRef<HTMLParagraphElement>(null);

  const reduced = usePrefersReducedMotion();
  const desktop = useIsDesktop();
  const sample = usePointerParallax(1, desktop && !reduced);

  /* Mouse parallax — the plate leans, the type stays put. Depth, not drift. */
  useRaf(() => {
    const p = sample(0.06);
    if (mediaRef.current) {
      mediaRef.current.style.setProperty("--px", `${p.x * -14}px`);
      mediaRef.current.style.setProperty("--py", `${p.y * -14}px`);
    }
  }, desktop && !reduced);

  useIsoLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      /* --- entrance: the type resolves out of blur -------------------- */
      if (reduced) {
        gsap.fromTo(
          [w1Ref.current, w2Ref.current, plateRef.current, devaRef.current],
          { opacity: 0 },
          { opacity: 1, duration: 0.6, stagger: 0.08, delay: 0.2 },
        );
      } else {
        gsap
          .timeline({ delay: 0.35 })
          .fromTo(
            plateRef.current,
            { clipPath: "inset(100% 0% 0% 0%)", scale: 1.2 },
            { clipPath: "inset(0% 0% 0% 0%)", scale: 1, duration: 1.6, ease: "expo.out" },
          )
          .fromTo(
            [w1Ref.current, w2Ref.current],
            { opacity: 0, filter: "blur(18px)", scale: 1.06, y: 26 },
            {
              opacity: 1,
              filter: "blur(0px)",
              scale: 1,
              y: 0,
              duration: 1.5,
              ease: "expo.out",
              stagger: 0.12,
            },
            "-=1.2",
          )
          .fromTo(
            [devaRef.current, hintRef.current],
            { opacity: 0, y: 14 },
            { opacity: 1, y: 0, duration: 0.9, stagger: 0.1 },
            "-=0.8",
          );
      }

      if (reduced) return;

      /* --- scrubbed sequence ----------------------------------------- */
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top top",
          // 1.1 viewports is enough for all five beats. Longer just makes the
          // opening feel like it will not end.
          end: "+=110%",
          pin: true,
          scrub: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      tl.to(hintRef.current, { opacity: 0, y: 20, duration: 0.12 }, 0)
        // words separate
        .to(w1Ref.current, { xPercent: -26, duration: 0.5 }, 0.12)
        .to(w2Ref.current, { xPercent: 26, duration: 0.5 }, 0.12)
        .to(devaRef.current, { opacity: 0, duration: 0.2 }, 0.15)
        // plate opens past the frame
        .to(
          plateRef.current,
          { width: "100vw", height: "100vh", duration: 0.55, ease: "power2.inOut" },
          0.24,
        )
        .to(mediaRef.current, { scale: 1.24, duration: 0.6, ease: "none" }, 0.24)
        // type dissolves as the image takes the whole frame
        .to(
          [w1Ref.current, w2Ref.current],
          { opacity: 0, filter: "blur(20px)", duration: 0.28 },
          0.5,
        )
        .to(root.querySelector("[data-hero-veil]"), { opacity: 1, duration: 0.4 }, 0.62);
    }, root);

    return () => ctx.revert();
  }, [reduced]);

  const [first, second] = artist.nameParts;

  return (
    <section
      ref={rootRef}
      id="hero"
      data-section
      className="relative h-svh w-full overflow-hidden"
      aria-label={`${artist.name} — introduction`}
    >
      {/* --- layer 1: DIWAARI, behind the plate ------------------------ */}
      <div className="pointer-events-none absolute inset-0 z-0 flex flex-col justify-center edge-x">
        <span aria-hidden className="block text-[clamp(4rem,20vw,17rem)] leading-[0.8] opacity-0">
          {first}
        </span>
        <span
          ref={w2Ref}
          className="t-display t-hang glitch-hover block self-end text-right text-[clamp(4rem,20vw,17rem)] leading-[0.8] text-bone will-change-transform"
        >
          {second}
        </span>
      </div>

      {/* --- layer 2: the portrait plate ------------------------------- */}
      <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center">
        <div
          ref={plateRef}
          className="relative h-[62svh] w-[74vw] overflow-hidden sm:h-[74svh] sm:w-[44vw] lg:w-[27vw]"
        >
          <div
            ref={mediaRef}
            className="distortable absolute inset-0 scale-[1.12] will-change-transform"
            style={{ translate: "var(--px, 0) var(--py, 0)" }}
          >
            <SafeImage
              image={artist.portraits[0]}
              kind="portrait"
              sizes="100vw"
              priority
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-void/20 via-transparent to-void/60" />
          <div
            data-hero-veil
            className="pointer-events-none absolute inset-0 bg-void opacity-0"
          />
        </div>
      </div>

      {/* --- layer 3: CHAAR, in front of the plate ---------------------- */}
      <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-center edge-x">
        <span
          ref={w1Ref}
          className="t-display t-hang glitch-hover block text-[clamp(4rem,20vw,17rem)] leading-[0.8] text-bone will-change-transform"
        >
          {first}
        </span>
        <span aria-hidden className="block text-[clamp(4rem,20vw,17rem)] leading-[0.8] opacity-0">
          {second}
        </span>
      </div>


      {/* --- marginalia ------------------------------------------------ */}
      <p
        ref={devaRef}
        lang="hi"
        className="pointer-events-none absolute left-[var(--edge)] top-[24svh] z-30 font-deva text-[0.95rem] tracking-[0.06em] text-paper/55 sm:top-[22svh] sm:text-[1.1rem]"
      >
        {artist.nameDevanagari}
      </p>

      <div
        ref={hintRef}
        className="absolute inset-x-0 bottom-7 z-30 flex flex-col items-center gap-2"
      >
        <span className="t-label text-paper/70">SCROLL TO ENTER</span>
        <span className="scroll-tick block h-8 w-px bg-bone/40" />
      </div>

      <div className="pointer-events-none absolute bottom-7 right-[var(--edge)] z-30 hidden text-right md:block">
        <p className="t-meta">{artist.tagline}</p>
        <p className="t-meta mt-1 text-dust">{artist.based}</p>
      </div>
    </section>
  );
}
