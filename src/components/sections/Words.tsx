"use client";

import { useCallback, useState } from "react";
import { quotes } from "@/data/quotes";
import { artist } from "@/data/artist";
import { PinnedSection } from "@/components/motion/PinnedSection";
import { SafeImage } from "@/components/media/SafeImage";
import { cx } from "@/lib/utils";

/**
 * IN HIS OWN WORDS
 * ---------------------------------------------------------------------------
 * This chapter occupies the slot the lyric reader was designed for. Song
 * lyrics are copyrighted and are not reproduced anywhere in this project, so
 * the same pinned, scroll-driven mechanism reads verbatim lines from named,
 * dated, linked interviews instead.
 *
 * One quote holds the frame at a time. Scroll advances it, the portrait behind
 * drifts, and the attribution is always visible and always a real link — a
 * quotation without a source is just a caption.
 *
 * If licensed lyrics are ever added to /src/data/songs.ts, the lyric chapter
 * turns itself back on and this one can run alongside it.
 */
export function Words() {
  const [i, setI] = useState(0);

  const onProgress = useCallback((p: number) => {
    setI(Math.min(quotes.length - 1, Math.floor(p * quotes.length * 0.999)));
  }, []);

  const q = quotes[i];

  return (
    <PinnedSection
      id="words"
      // ~0.45 of a viewport per quote. Long enough to read one and feel it
      // hold, short enough that six of them are not a five-screen detour.
      length={quotes.length * 0.45}
      onProgress={onProgress}
    >
      <div className="relative h-svh overflow-hidden">
        {/* The portrait sits far back, at low contrast — it is the room, not
            the subject. */}
        <div aria-hidden className="absolute inset-0 opacity-[0.16]">
          <SafeImage image={artist.portraits[1]} kind="portrait" sizes="100vw" />
        </div>
        <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-void via-void/70 to-void" />

        <div className="relative grid h-full grid-cols-1 items-center gap-10 edge-x lg:grid-cols-[minmax(0,18rem)_1fr] lg:gap-20">
          <div className="self-start pt-[14vh] lg:self-center lg:pt-0">
            <p className="t-label text-oxide">IN HIS OWN WORDS</p>
            <p className="t-meta mt-4 leading-relaxed">
              VERBATIM, FROM PUBLISHED INTERVIEWS.
              <br />
              NO LYRICS ARE REPRODUCED ON THIS SITE.
            </p>

            <ol className="mt-8 hidden gap-3 lg:flex lg:flex-col">
              {quotes.map((item, k) => (
                <li key={item.id} className="flex items-center gap-3">
                  <span
                    className={cx(
                      "h-px transition-all duration-500",
                      k === i ? "w-8 bg-oxide" : "w-4 bg-bone/25",
                    )}
                  />
                  <span
                    className={cx(
                      "font-mono text-[0.62rem] tracking-[0.2em] tabular-nums transition-colors duration-500",
                      k === i ? "text-bone" : "text-dust",
                    )}
                  >
                    {String(k + 1).padStart(2, "0")}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <figure className="max-w-[24ch]">
            <blockquote
              key={q.id}
              className="t-editorial text-[clamp(1.9rem,5.6vw,4.6rem)] leading-[1.03] text-bone"
              style={{ animation: "words-in 0.9s cubic-bezier(.16,1,.3,1) both" }}
            >
              “{q.text}”
            </blockquote>

            <figcaption
              key={`${q.id}-cite`}
              className="mt-8 flex flex-wrap items-baseline gap-x-5 gap-y-2"
              style={{ animation: "words-in 0.9s 0.12s cubic-bezier(.16,1,.3,1) both" }}
            >
              <a
                href={q.href}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="OPEN"
                className="t-label text-paper transition-colors hover:text-oxide"
              >
                {q.source} ↗
              </a>
              <span className="t-meta">{q.year}</span>
            </figcaption>
          </figure>
        </div>
      </div>
    </PinnedSection>
  );
}
