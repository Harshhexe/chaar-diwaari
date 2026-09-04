"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { featuredVideos, videoUrl } from "@/data/videos";
import type { VideoWork } from "@/data/types";
import { Parallax } from "@/components/motion/Parallax";
import { Reveal } from "@/components/motion/Reveal";
import { SafeImage } from "@/components/media/SafeImage";
import type { ViewerItem } from "@/components/media/PhotoViewer";
import { usePlayer } from "@/components/player/PlayerProvider";
import { SectionHeader } from "./SectionHeader";
import { cx } from "@/lib/utils";

const PhotoViewer = dynamic(
  () => import("@/components/media/PhotoViewer").then((m) => m.PhotoViewer),
  { ssr: false },
);

/**
 * 03 — VISUALS
 * ---------------------------------------------------------------------------
 * An editorial spread, not a card grid. The rhythm below is authored — eight
 * slots with deliberate column spans, aspect ratios, vertical offsets and
 * parallax speeds — and cycled, so the page stays unbalanced in a controlled
 * way however many films are in the data.
 *
 * The films are not rehosted, so there is no hover-to-play: instead a tile
 * darkens, its still pushes in, and clicking opens YouTube's own player inside
 * the site's viewer. That is both the licence-correct behaviour and the
 * cheaper one — no video element is created until someone asks for it.
 */

const RHYTHM = [
  { col: "col-span-12 lg:col-span-7 lg:col-start-1", ratio: "aspect-[16/9]", speed: 0.1, offset: "" },
  { col: "col-span-7 lg:col-span-4 lg:col-start-9", ratio: "aspect-[3/4]", speed: 0.26, offset: "lg:-mt-[10vh]" },
  { col: "col-span-5 col-start-8 lg:col-span-3 lg:col-start-2", ratio: "aspect-[4/5]", speed: 0.34, offset: "mt-[4vh]" },
  { col: "col-span-12 lg:col-span-6 lg:col-start-6", ratio: "aspect-[16/10]", speed: 0.14, offset: "mt-[6vh]" },
  { col: "col-span-8 lg:col-span-4 lg:col-start-1", ratio: "aspect-[16/9]", speed: 0.22, offset: "mt-[4vh] lg:-mt-[3vh]" },
  { col: "col-span-6 col-start-7 lg:col-span-3 lg:col-start-6", ratio: "aspect-[3/4]", speed: 0.3, offset: "mt-[7vh]" },
  { col: "col-span-12 lg:col-span-5 lg:col-start-8", ratio: "aspect-[4/5]", speed: 0.18, offset: "lg:-mt-[6vh]" },
  { col: "col-span-9 lg:col-span-5 lg:col-start-2", ratio: "aspect-[16/9]", speed: 0.12, offset: "mt-[6vh]" },
];

const compactViews = (n?: number) =>
  n == null
    ? null
    : n >= 1_000_000
      ? `${(n / 1_000_000).toFixed(1)}M VIEWS`
      : `${Math.round(n / 1000)}K VIEWS`;

export function Visuals() {
  const [open, setOpen] = useState<number | null>(null);
  const player = usePlayer();

  // Two soundtracks at once is never what anyone wanted: opening a film pauses
  // the site's own player rather than talking over it.
  const openFilm = (i: number) => {
    if (player.isPlaying) player.toggle();
    setOpen(i);
  };

  const items: ViewerItem[] = featuredVideos.map((v) => ({
    id: v.id,
    image: v.media.poster,
    youtubeId: v.youtubeId,
    title: v.title,
    meta: `${v.kind} / ${v.year}`,
    description: v.description,
    href: videoUrl(v),
  }));

  return (
    <div id="visuals" data-section className="relative py-[11vh]">
      <SectionHeader
        index="03"
        label="VISUALS"
        title="MOVING IMAGES"
        lede="Films, visualisers and live cuts, played from the artist's own channel."
      />

      <div className="mt-[8vh] grid grid-cols-12 gap-x-4 gap-y-[5vh] edge-x sm:gap-x-6">
        {featuredVideos.map((work, i) => (
          <VisualItem key={work.id} work={work} index={i} onOpen={() => openFilm(i)} />
        ))}
      </div>

      <p className="t-meta mt-[7vh] max-w-[64ch] edge-x normal-case leading-relaxed tracking-[0.06em]">
        {featuredVideos.length} of the films on the official channel — the rest
        are in the archive. View counts were read on 04.09.2026 and are not
        live. Playback happens in YouTube&rsquo;s player; nothing is rehosted.
      </p>

      {open !== null && (
        <PhotoViewer
          items={items}
          index={open}
          onIndex={setOpen}
          onClose={() => setOpen(null)}
        />
      )}
    </div>
  );
}

function VisualItem({
  work,
  index,
  onOpen,
}: {
  work: VideoWork;
  index: number;
  onOpen: () => void;
}) {
  const l = RHYTHM[index % RHYTHM.length];
  const views = compactViews(work.views);

  return (
    <Reveal variant="mask" from="bottom" className={cx(l.col, l.offset)}>
      <figure>
        <button
          onClick={onOpen}
          data-cursor="WATCH"
          aria-label={`Watch ${work.title} on YouTube`}
          className="group block w-full text-left"
        >
          <div className={cx("relative w-full overflow-hidden", l.ratio)}>
            <Parallax speed={l.speed}>
              <span className="relative block h-full w-full">
                <SafeImage
                  image={work.media.poster}
                  kind="frame"
                  sizes="(max-width: 768px) 92vw, 55vw"
                  imgClassName="transition-transform duration-[1.2s] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.04] motion-reduce:group-hover:scale-100"
                />
              </span>
            </Parallax>

            {/* The tile lifts its veil on approach rather than starting a clip. */}
            <span className="pointer-events-none absolute inset-0 bg-void/35 transition-opacity duration-700 group-hover:opacity-0 group-focus-visible:opacity-0" />
            <span className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-bone/10 transition-[box-shadow] duration-500 group-hover:ring-bone/30" />

            <span className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-2 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100">
              <span className="t-label bg-bone px-2 py-1 text-void">WATCH</span>
              {views && <span className="t-label text-bone">{views}</span>}
            </span>
          </div>

          <figcaption className="mt-4 flex items-baseline justify-between gap-4">
            <span className="min-w-0">
              <span className="t-label block text-dust">
                {String(index + 1).padStart(2, "0")} — {work.kind}
              </span>
              <span className="mt-2 block truncate text-[clamp(1rem,1.8vw,1.5rem)] text-bone transition-transform duration-500 group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0">
                {work.title}
              </span>
            </span>
            <span className="t-meta shrink-0">{work.year}</span>
          </figcaption>
        </button>
      </figure>
    </Reveal>
  );
}
