"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { events, upcomingEvents } from "@/data/events";
import type { LiveEvent } from "@/data/types";
import { gsap } from "@/lib/gsap";
import {
  useEscape,
  useFocusTrap,
  useIsDesktop,
  useIsoLayoutEffect,
  usePrefersReducedMotion,
  useScrollLock,
} from "@/lib/hooks";
import { artist } from "@/data/artist";
import { SafeImage } from "@/components/media/SafeImage";
import dynamic from "next/dynamic";
import type { ViewerItem } from "@/components/media/PhotoViewer";

const PhotoViewer = dynamic(
  () => import("@/components/media/PhotoViewer").then((m) => m.PhotoViewer),
  { ssr: false },
);
import { Reveal } from "@/components/motion/Reveal";
import { SectionHeader } from "./SectionHeader";
import { cx } from "@/lib/utils";

/**
 * 04 — LIVE
 * ---------------------------------------------------------------------------
 * Opens on a single frame that expands out of a narrow letterbox into the full
 * viewport as you enter it, then hands over to the list of shows, set as
 * display type rather than as a table of dates.
 *
 * The dates here are placeholders and are labelled as such. Real shows must
 * never be listed next to invented ones.
 */
export function Live() {
  const stageRef = useRef<HTMLDivElement>(null);
  const [detail, setDetail] = useState<LiveEvent | null>(null);
  const [hover, setHover] = useState<LiveEvent | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const desktop = useIsDesktop();
  const reduced = usePrefersReducedMotion();

  useIsoLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage || reduced) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-live-frame]",
        { clipPath: "inset(28% 22% 28% 22%)", scale: 1.14 },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: stage,
            start: "top 85%",
            end: "top 5%",
            scrub: true,
          },
        },
      );
    }, stage);
    return () => ctx.revert();
  }, [reduced]);

  /* Cursor-following preview for the show list (desktop only). */
  const trackPreview = (e: React.PointerEvent) => {
    if (!desktop || !previewRef.current) return;
    gsap.to(previewRef.current, {
      x: e.clientX - 150,
      y: e.clientY - 110,
      duration: 0.9,
      ease: "power3.out",
    });
  };

  return (
    <div id="live" data-section className="relative">
      {/* --- opening frame -------------------------------------------- */}
      <div ref={stageRef} className="relative h-svh w-full overflow-hidden">
        <div data-live-frame className="absolute inset-0 will-change-transform">
          <SafeImage
            image={artist.portraits[2]}
            kind="still"
            sizes="100vw"
          />
        </div>
        <div className="absolute inset-0 bg-void/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-void via-transparent to-void/60" />

        <div className="relative flex h-full flex-col justify-end pb-[12vh] edge-x">
          <p className="t-label mb-4 text-oxide">04 — LIVE</p>
          <h2 className="t-display t-hang text-[clamp(4rem,22vw,18rem)] leading-[0.78] text-bone">
            LIVE
          </h2>
        </div>
      </div>

      {/* --- shows ----------------------------------------------------- */}
      <div className="py-[9vh]" onPointerLeave={() => setHover(null)}>
        <SectionHeader index="04.1" label="SHOWS" title="ON STAGE" className="mb-[6vh]" />

        <ul className="border-t border-bone/10">
          {events.map((ev, i) => (
            <li key={ev.id}>
              <Reveal variant="text" delay={i * 0.04}>
                <button
                  onClick={() => setDetail(ev)}
                  onPointerEnter={() => setHover(ev)}
                  onPointerMove={trackPreview}
                  onFocus={() => setHover(ev)}
                  data-cursor="VIEW"
                  aria-label={`Open ${ev.city} — ${ev.venue}`}
                  className="group grid w-full grid-cols-[2.4rem_1fr_auto] items-center gap-4 border-b border-bone/10 py-6 text-left transition-colors edge-x hover:bg-bone/[0.02] sm:gap-8 sm:py-8"
                >
                  <span className="t-label text-dust">{String(i + 1).padStart(2, "0")}</span>

                  <span className="min-w-0">
                    <span className="t-display block truncate text-[clamp(1.6rem,6vw,4.4rem)] leading-[0.9] text-bone transition-transform duration-700 group-hover:translate-x-4 motion-reduce:group-hover:translate-x-0">
                      {ev.city}
                    </span>
                    <span className="t-meta mt-2 block truncate">{ev.venue}</span>
                  </span>

                  <span className="shrink-0 text-right">
                    <span className="t-meta block">{ev.year}</span>
                    <span
                      className={cx(
                        "t-label mt-2 block",
                        ev.status === "ANNOUNCED" ? "text-oxide" : "text-dust",
                      )}
                    >
                      {ev.status}
                    </span>
                  </span>
                </button>
              </Reveal>
            </li>
          ))}
        </ul>

        <div className="mt-10 edge-x">
          <p className="t-meta">
            {upcomingEvents.length > 0
              ? `${upcomingEvents.length} ANNOUNCED`
              : "NO UPCOMING SHOWS ANNOUNCED"}
            <span className="mx-2 text-dust">/</span>
            {events.length} PLAYED
          </p>
          <p className="t-meta mt-2 max-w-[62ch] normal-case leading-relaxed tracking-[0.06em] text-dust">
            Official headline sets and festival performances across India.
          </p>
        </div>
      </div>

      {/* cursor-following preview */}
      {desktop && (
        <div
          ref={previewRef}
          aria-hidden
          className="pointer-events-none fixed left-0 top-0 z-[80] h-[220px] w-[300px] overflow-hidden transition-opacity duration-500"
          style={{ opacity: hover ? 1 : 0 }}
        >
          {hover && (
            <SafeImage
              image={hover.poster}
              kind="still"
              intensity={0.85}
              sizes="300px"
            />
          )}
        </div>
      )}

      <AnimatePresence>
        {detail && <LiveDetail event={detail} onClose={() => setDetail(null)} />}
      </AnimatePresence>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function LiveDetail({ event, onClose }: { event: LiveEvent; onClose: () => void }) {
  const ref = useFocusTrap<HTMLDivElement>(true);
  const [photo, setPhoto] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  useScrollLock(true);
  useEscape(onClose, true);

  useEffect(() => {
    setMounted(true);
  }, []);

  const items: ViewerItem[] = event.photos.map((p, i) => ({
    id: `${event.id}-${i}`,
    image: p,
    title: `${event.city} — ${event.venue}`,
    meta: event.year,
    description: event.note,
  }));

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <motion.div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label={`${event.city} — ${event.venue}`}
      className="fixed inset-0 z-[106] overflow-y-auto overscroll-contain bg-void"
      initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
      animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
      exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
      transition={{ duration: 0.8, ease: [0.83, 0, 0.17, 1] }}
    >
      {/* --- top bar --------------------------------------------------- */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-30 flex items-start justify-between edge-x pt-5 sm:pt-7">
        <button
          onClick={onClose}
          className="pointer-events-auto tap-safe -m-2 grid place-items-center p-2 t-display text-[1.6rem] leading-none tracking-[0.02em] text-bone transition-colors hover:text-oxide sm:text-[1.9rem]"
          aria-label="Close show and return to shows"
          data-cursor="CLOSE"
        >
          CD
        </button>

        <button
          onClick={onClose}
          data-cursor="CLOSE"
          aria-label="Close show"
          className="pointer-events-auto tap-safe t-label -mr-2 px-3 py-2 text-bone transition-colors hover:text-oxide"
        >
          ✕ CLOSE
        </button>
      </div>

      <div className="relative h-[62svh] w-full overflow-hidden">
        <SafeImage
          image={event.poster}
          kind="still"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-void via-void/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 edge-x pb-10">
          <h3 className="t-display t-hang text-[clamp(2.6rem,12vw,9rem)] leading-[0.82] text-bone">
            {event.city}
          </h3>
        </div>
      </div>

      <div className="edge-x py-[6vh]">
        <dl className="grid grid-cols-2 gap-y-8 border-y border-bone/10 py-8 sm:grid-cols-4">
          <div>
            <dt className="t-meta">VENUE</dt>
            <dd className="mt-2 text-bone">{event.venue}</dd>
          </div>
          <div>
            <dt className="t-meta">DATE</dt>
            <dd className="mt-2 text-bone">{event.date ?? "——"}</dd>
          </div>
          <div>
            <dt className="t-meta">YEAR</dt>
            <dd className="mt-2 text-bone">{event.year}</dd>
          </div>
          <div>
            <dt className="t-meta">STATUS</dt>
            <dd className="mt-2 text-oxide">{event.status}</dd>
          </div>
        </dl>

        {event.note && (
          <p className="mt-8 max-w-[54ch] text-paper/80">{event.note}</p>
        )}

        {event.poster.credit && (
          <p className="t-meta mt-6 normal-case tracking-[0.06em] text-dust">
            Photo: {event.poster.credit}
          </p>
        )}

        <div className="mt-[6vh] grid grid-cols-2 gap-4 lg:grid-cols-4">
          {event.photos.map((p, i) => (
            <button
              key={i}
              onClick={() => setPhoto(i)}
              data-cursor="VIEW"
              aria-label={`View photograph ${i + 1}`}
              className="group relative aspect-[3/4] w-full overflow-hidden"
            >
              <SafeImage
                image={p}
                kind="still"
                sizes="(max-width: 1024px) 50vw, 25vw"
                imgClassName="transition-transform duration-700 group-hover:scale-105 motion-reduce:group-hover:scale-100"
              />
            </button>
          ))}
        </div>
      </div>

      {photo !== null && (
        <PhotoViewer
          items={items}
          index={photo}
          onIndex={setPhoto}
          onClose={() => setPhoto(null)}
        />
      )}
    </motion.div>,
    document.body,
  );
}
