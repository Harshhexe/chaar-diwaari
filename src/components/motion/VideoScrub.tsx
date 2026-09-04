"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MediaVideo } from "@/data/types";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useIsoLayoutEffect, usePrefersReducedMotion } from "@/lib/hooks";
import { clamp, formatTime } from "@/lib/utils";
import { SafeImage } from "@/components/media/SafeImage";

interface Props {
  media: MediaVideo;
  title: string;
  caption?: string;
  /** Scroll length while pinned, in viewport heights. */
  length?: number;
  id?: string;
}

/**
 * SCROLL-CONTROLLED FILM
 * ---------------------------------------------------------------------------
 * The section pins and scroll position maps 1:1 onto the clip's currentTime.
 *
 * Two details make this feel like film rather than a stuttering seek:
 *  - the target time is *lerped* toward in a RAF loop instead of being written
 *    on every scroll event, so fast flicks glide instead of thrashing the
 *    decoder;
 *  - seeks are skipped while the previous one is still resolving.
 *
 * With no `scrubSrc` the same pinned choreography runs on the poster frame —
 * zoom, hard cut, RGB separation, live timecode — so the interaction can be
 * reviewed before a single frame of real footage exists.
 *
 * Reduced motion: no pin, no scrub. A still frame and the caption.
 */
export function VideoScrub({ media, title, caption, length = 4, id }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const posterRef = useRef<HTMLDivElement>(null);
  const splitRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const tcRef = useRef<HTMLSpanElement>(null);

  const progress = useRef(0);
  const eased = useRef(0);
  const seeking = useRef(false);

  const [duration, setDuration] = useState(media.durationSec ?? 8);
  const [ready, setReady] = useState(false);
  const reduced = usePrefersReducedMotion();
  const clipSrc = media.scrubSrc || media.src;
  const hasClip = Boolean(clipSrc);

  /* --- render one frame of the sequence -------------------------------- */
  const render = useCallback(() => {
    const p = eased.current;

    if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
    if (tcRef.current) {
      tcRef.current.textContent = hasClip
        ? formatTime(p * duration)
        : String(Math.round(p * 100)).padStart(3, "0");
    }

    if (hasClip) {
      const v = videoRef.current;
      if (v && ready && !seeking.current) {
        const t = clamp(p, 0, 0.999) * (v.duration || duration);
        if (Math.abs(v.currentTime - t) > 0.02) {
          seeking.current = true;
          v.currentTime = t;
        }
      }
      return;
    }

    // Placeholder choreography: the poster becomes the film.
    const el = posterRef.current;
    if (!el) return;
    const zoom = 1.18 - p * 0.22;
    const drift = (p - 0.5) * 6;
    // Separation peaks at the two "cuts" and settles at rest.
    const split = Math.sin(p * Math.PI * 3) * 3.2 * (1 - Math.abs(p - 0.5) * 0.6);
    el.style.transform = `scale(${zoom}) translate3d(${drift}%, ${drift * -0.4}%, 0)`;
    el.style.filter = `saturate(${0.7 + p * 0.5}) contrast(${1 + p * 0.25})`;
    // Chromatic separation is a moment, not a state: it only switches on at
    // the two cut points and is off the rest of the sequence.
    splitRef.current?.setAttribute("data-split", Math.abs(split) > 2.2 ? "on" : "off");
  }, [duration, hasClip, ready]);

  useIsoLayoutEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || reduced) return;

    const ctx = gsap.context(() => {
      gsap.to(
        {},
        {
          scrollTrigger: {
            trigger: wrap,
            start: "top top",
            end: () => `+=${window.innerHeight * length}`,
            pin: true,
            scrub: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
               progress.current = self.progress;
            },
          },
        },
      );

      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    }, wrap);

    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      // Lerp toward the scroll target — this is what removes the stutter.
      eased.current += (progress.current - eased.current) * 0.12;
      render();
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ctx.revert();
      ScrollTrigger.refresh();
    };
  }, [length, reduced, render]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onSeeked = () => (seeking.current = false);
    const onMeta = () => {
      setDuration(v.duration || media.durationSec || 8);
      setReady(true);
    };
    v.addEventListener("seeked", onSeeked);
    v.addEventListener("loadedmetadata", onMeta);
    return () => {
      v.removeEventListener("seeked", onSeeked);
      v.removeEventListener("loadedmetadata", onMeta);
    };
  }, [media.durationSec]);

  return (
    <section
      ref={wrapRef}
      id={id}
      className="relative h-screen w-full overflow-hidden bg-void"
      aria-label={`${title} — scroll-controlled film`}
    >
      <div className="absolute inset-0">
        {hasClip ? (
          <video
            ref={videoRef}
            src={clipSrc as string}
            poster={media.poster.src ?? undefined}
            muted
            playsInline
            preload="auto"
            disablePictureInPicture
            className="h-full w-full object-cover"
          >
            {media.captions && (
              <track kind="captions" src={media.captions} srcLang="en" label="English" default />
            )}
          </video>
        ) : (
          <div
            ref={splitRef}
            data-split="off"
            className="scrub-plate distortable h-full w-full"
          >
            <div
              ref={posterRef}
              className="relative h-full w-full will-change-transform"
              style={{ transform: "scale(1.18)" }}
            >
              {/* Not `priority`: this section is a dozen screens down, and
                  preloading it competes with the hero for the first bytes. */}
              <SafeImage
                image={media.poster}
                kind="frame"
                label="ADD SCRUB CLIP → /videos/scrub"
                sizes="100vw"
              />
            </div>
          </div>
        )}
      </div>

      {/* Letterbox bars — this is a film, not a hero image. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[9vh] bg-void" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[9vh] bg-void" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void/70 via-transparent to-void/50" />

      {/* HUD */}
      <div className="pointer-events-none absolute inset-x-0 bottom-[9vh] edge-x pb-6">
        <div className="flex items-end justify-between gap-6">
          <div className="max-w-[46ch]">
            <p className="t-meta mb-2">
              {hasClip
                ? "SCROLL-CONTROLLED FILM"
                : "SCROLL-CONTROLLED SEQUENCE — STILL FRAME"}
            </p>
            <h3 className="t-display text-[clamp(2.2rem,7vw,5.5rem)] text-bone">{title}</h3>
            {caption && <p className="t-meta mt-3 normal-case tracking-[0.08em]">{caption}</p>}
          </div>
          {/* With a real clip this is a timecode. Without one there is no
              footage to give a time for, so it reports sequence position
              instead of inventing a running time. */}
          <div className="hidden shrink-0 text-right font-mono text-[0.7rem] tracking-[0.2em] text-ash sm:block">
            {hasClip ? (
              <>
                <span ref={tcRef}>0:00</span>
                <span className="mx-1 text-dust">/</span>
                <span>{formatTime(duration)}</span>
              </>
            ) : (
              <>
                <span ref={tcRef}>000</span>
                <span className="mx-1 text-dust">/</span>
                <span>100</span>
              </>
            )}
          </div>
        </div>

        <div className="mt-5 h-px w-full bg-bone/15">
          <div
            ref={barRef}
            className="h-px w-full origin-left bg-oxide"
            style={{ transform: "scaleX(0)" }}
          />
        </div>
      </div>

      {reduced && (
        <p className="absolute inset-x-0 bottom-[11vh] text-center t-meta">
          REDUCED MOTION — SCRUBBING DISABLED
        </p>
      )}
    </section>
  );
}
