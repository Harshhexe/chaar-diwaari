"use client";

import { useMemo, useState } from "react";
import { archiveByType, archiveFolders, archiveItems, photoWall } from "@/data/archive";
import type { ArchiveType } from "@/data/types";
import { SafeImage } from "@/components/media/SafeImage";
import dynamic from "next/dynamic";
import type { ViewerItem } from "@/components/media/PhotoViewer";

// Interaction-only: never in the first paint's critical path.
const PhotoViewer = dynamic(
  () => import("@/components/media/PhotoViewer").then((m) => m.PhotoViewer),
  { ssr: false },
);
import { Reveal } from "@/components/motion/Reveal";
import { SectionHeader } from "./SectionHeader";
import { cx } from "@/lib/utils";

/**
 * 05 — ARCHIVE
 * ---------------------------------------------------------------------------
 * A deliberate change of language. Everything else on this site is display
 * type and photography; here it is monospace, hairlines, reference numbers and
 * file metadata — an artist's filing cabinet rather than a gallery.
 *
 * It is not a fake operating system: no window chrome, no desktop icons, no
 * traffic-light buttons. The mechanical feeling comes from the typography, the
 * stepped stagger on open, and the reference codes — nothing skeuomorphic.
 */
export function Archive() {
  const [folder, setFolder] = useState<ArchiveType>("PHOTOS");
  const [open, setOpen] = useState<number | null>(null);

  const contents = useMemo(() => archiveByType(folder), [folder]);
  const items: ViewerItem[] = contents.map((c) => ({
    id: c.id,
    image: c.image,
    title: c.title,
    meta: `${c.type} / ${c.year} / ${c.meta?.format ?? "———"}`,
    description: c.description,
  }));

  return (
    <div id="archive" data-section className="relative py-[11vh]">
      <SectionHeader
        index="05"
        label="ARCHIVE"
        title="THE ARCHIVE"
        lede="The same material, filed rather than staged."
      />

      <div className="mt-[7vh] edge-x">
        <p className="font-mono text-[0.7rem] tracking-[0.24em] text-dust">
          /CHAAR_DIWAARI
        </p>

        <div className="mt-6 grid grid-cols-1 gap-px border border-bone/10 bg-bone/10 lg:grid-cols-[minmax(0,15rem)_1fr]">
          {/* --- folders --------------------------------------------- */}
          <nav aria-label="Archive folders" className="bg-void">
            <ul>
              {archiveFolders.map((f) => {
                const count = archiveByType(f.type).length;
                const active = folder === f.type;
                return (
                  <li key={f.type}>
                    <button
                      onClick={() => setFolder(f.type)}
                      aria-current={active ? "true" : undefined}
                      data-cursor="OPEN"
                      className={cx(
                        "flex w-full items-center justify-between gap-3 border-b border-bone/10 px-4 py-4 text-left font-mono text-[0.72rem] tracking-[0.16em] transition-colors",
                        active
                          ? "bg-bone/[0.06] text-bone"
                          : "text-ash hover:bg-bone/[0.03] hover:text-paper",
                      )}
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <span className={active ? "text-oxide" : "text-dust"}>
                          {active ? "▾" : "▸"}
                        </span>
                        <span className="truncate">{f.type}</span>
                      </span>
                      <span className="shrink-0 text-dust tabular-nums">
                        {String(count).padStart(2, "0")}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <p className="px-4 py-4 font-mono text-[0.62rem] leading-relaxed tracking-[0.14em] text-dust">
              {archiveFolders.find((f) => f.type === folder)?.note}
            </p>
          </nav>

          {/* --- contents -------------------------------------------- */}
          <div className="bg-void">
            <div className="grid grid-cols-[2.5rem_1fr_5rem_5rem] gap-3 border-b border-bone/10 px-4 py-3 font-mono text-[0.6rem] tracking-[0.2em] text-dust sm:grid-cols-[3rem_1fr_8rem_6rem_5rem]">
              <span>NO</span>
              <span>TITLE</span>
              <span className="hidden sm:block">REF</span>
              <span>FORMAT</span>
              <span className="text-right">YEAR</span>
            </div>

            {contents.length === 0 && (
              <p className="px-4 py-10 font-mono text-[0.72rem] tracking-[0.16em] text-dust">
                NOTHING FILED HERE YET — NO LICENSED MATERIAL OF THIS KIND IS
                IN THIS PROJECT

              </p>
            )}

            <ul key={folder}>
              {contents.map((item, i) => (
                <li
                  key={item.id}
                  style={{ animation: `ar-row .32s ${i * 0.028}s steps(4) both` }}
                >
                  <button
                    onClick={() => setOpen(i)}
                    data-cursor="VIEW"
                    aria-label={`Open ${item.title}`}
                    className="group grid w-full grid-cols-[2.5rem_1fr_5rem_5rem] items-center gap-3 border-b border-bone/10 px-4 py-3 text-left font-mono text-[0.72rem] tracking-[0.12em] text-ash transition-colors hover:bg-bone/[0.04] hover:text-bone sm:grid-cols-[3rem_1fr_8rem_6rem_5rem]"
                  >
                    <span className="text-dust tabular-nums">
                      {String(i + 1).padStart(3, "0")}
                    </span>
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="relative hidden h-8 w-8 shrink-0 overflow-hidden opacity-60 transition-opacity group-hover:opacity-100 sm:block">
                        <SafeImage
                          image={item.image}
                          kind="scan"
                          intensity={0.5}
                          sizes="32px"
                        />
                      </span>
                      <span className="truncate">{item.title}</span>
                    </span>
                    <span className="hidden truncate text-dust sm:block">
                      {item.meta?.ref}
                    </span>
                    <span className="text-dust">{item.meta?.format}</span>
                    <span className="text-right text-dust">{item.year}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-4 font-mono text-[0.62rem] tracking-[0.18em] text-dust">
          {String(archiveItems.length).padStart(3, "0")} OBJECTS INDEXED
          <span className="mx-2">·</span>
          DERIVED FROM RELEASE, FILM, SHOW AND PRESS DATA
        </p>
      </div>

      {/* --- photo wall --------------------------------------------- */}
      <PhotoWall />

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

/* -------------------------------------------------------------------------- */

/** Scatter is authored per-index so it is stable and composed, not random. */
const SCATTER = [
  { w: "w-[62%] sm:w-[26%]", x: "sm:ml-[4%]", y: "sm:mt-0", r: -3.2, z: 3 },
  { w: "w-[52%] sm:w-[19%]", x: "sm:ml-[-3%]", y: "sm:mt-[14vh]", r: 2.4, z: 5 },
  { w: "w-[70%] sm:w-[24%]", x: "sm:ml-[2%]", y: "sm:mt-[-6vh]", r: -1.4, z: 2 },
  { w: "w-[46%] sm:w-[15%]", x: "sm:ml-[6%]", y: "sm:mt-[20vh]", r: 4.1, z: 6 },
  { w: "w-[64%] sm:w-[22%]", x: "sm:ml-[-4%]", y: "sm:mt-[4vh]", r: -2.6, z: 4 },
  { w: "w-[56%] sm:w-[18%]", x: "sm:ml-[3%]", y: "sm:mt-[26vh]", r: 1.8, z: 7 },
  { w: "w-[72%] sm:w-[27%]", x: "sm:ml-[-2%]", y: "sm:mt-[-10vh]", r: -4.4, z: 1 },
  { w: "w-[48%] sm:w-[16%]", x: "sm:ml-[5%]", y: "sm:mt-[10vh]", r: 3.3, z: 8 },
];

function PhotoWall() {
  const [open, setOpen] = useState<number | null>(null);
  const photos = photoWall;

  const items: ViewerItem[] = photos.map((p) => ({
    id: p.id,
    image: p.image,
    title: p.title,
    meta: `${p.type} / ${p.year}`,
    description: p.description,
  }));

  return (
    <section className="mt-[12vh]" aria-label="Photo archive">
      <p className="t-label mb-8 edge-x text-oxide">05.1 — PHOTO WALL</p>

      {/* Desktop: an overlapping wall. Mobile: an honest single column, because
          a scattered pile is unusable with a thumb. */}
      <div className="flex flex-col items-center gap-6 edge-x sm:-space-y-[8vh] sm:flex-row sm:flex-wrap sm:items-start sm:justify-center sm:gap-0">
        {photos.map((p, i) => {
          const s = SCATTER[i % SCATTER.length];
          return (
            <Reveal
              key={p.id}
              variant="scale"
              delay={(i % 4) * 0.05}
              className={cx("relative", s.w, s.x, s.y)}
            >
              <button
                onClick={() => setOpen(i)}
                data-cursor="VIEW"
                aria-label={`View ${p.title}`}
                className="group relative block w-full"
                style={{ zIndex: s.z }}
              >
                <span
                  className="relative block w-full overflow-hidden shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)] transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:-translate-y-3 group-hover:rotate-0 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0"
                  style={{
                    aspectRatio: `${p.image.width ?? 4} / ${p.image.height ?? 5}`,
                    rotate: `${s.r}deg`,
                  }}
                >
                  <SafeImage
                    image={p.image}
                    kind="scan"
                    sizes="(max-width: 640px) 70vw, 26vw"
                  />
                  <span className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-bone/10" />
                </span>
                <span className="t-meta mt-3 block truncate opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100">
                  {p.meta?.ref}
                </span>
              </button>
            </Reveal>
          );
        })}
      </div>

      {open !== null && (
        <PhotoViewer
          items={items}
          index={open}
          onIndex={setOpen}
          onClose={() => setOpen(null)}
        />
      )}
    </section>
  );
}
