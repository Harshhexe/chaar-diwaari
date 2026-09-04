"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import type { MediaImage, MediaVideo } from "@/data/types";
import { useEscape, useFocusTrap, useScrollLock } from "@/lib/hooks";
import { SafeImage } from "./SafeImage";
import { SafeVideo } from "./SafeVideo";

export interface ViewerItem {
  id: string;
  image: MediaImage;
  video?: MediaVideo | null;
  /**
   * When set, the film is played in YouTube's embedded player rather than from
   * a local file. Nothing is rehosted and no cookie-tracking domain is used —
   * the embed goes to youtube-nocookie.com.
   */
  youtubeId?: string | null;
  title: string;
  meta?: string;
  description?: string;
  /** External page for the work, e.g. the YouTube watch URL. */
  href?: string | null;
}

interface Props {
  items: ViewerItem[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
}

/**
 * FULLSCREEN VIEWER
 * ---------------------------------------------------------------------------
 * One viewer for the photo wall, the archive and the moving-image section.
 *
 * Keyboard: ← → to move, Esc to close, and focus is trapped while it is open.
 * Touch: horizontal swipe with a distance threshold, so a vertical scroll
 * gesture never accidentally advances the frame.
 */
export function PhotoViewer({ items, index, onIndex, onClose }: Props) {
  const ref = useFocusTrap<HTMLDivElement>(true);
  const touchX = useRef<number | null>(null);
  const [dir, setDir] = useState(1);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useScrollLock(true);
  useEscape(onClose, true);

  const step = useCallback(
    (d: 1 | -1) => {
      setDir(d);
      onIndex((index + d + items.length) % items.length);
    },
    [index, items.length, onIndex],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step]);

  const item = items[index];
  if (!item || !mounted || typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label={`${item.title} — ${index + 1} of ${items.length}`}
      className="fixed inset-0 z-[108] bg-void/97 backdrop-blur-sm"
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current == null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 56) step(dx < 0 ? 1 : -1);
        touchX.current = null;
      }}
    >
      <div className="relative flex h-full flex-col">
        <header className="flex items-start justify-between gap-6 edge-x pt-6">
          <div className="min-w-0">
            <p className="t-label truncate text-bone">{item.title}</p>
            {item.meta && <p className="t-meta mt-1 truncate">{item.meta}</p>}
          </div>
          <button
            onClick={onClose}
            data-cursor="CLOSE"
            aria-label="Close viewer"
            className="tap-safe t-label shrink-0 px-2 py-2 text-bone transition-colors hover:text-oxide"
          >
            ✕ CLOSE
          </button>
        </header>

        <div className="relative flex-1 overflow-hidden px-[var(--edge)] py-6">
          <AnimatePresence mode="wait" initial={false}>
            <motion.figure
              key={item.id}
              className="relative mx-auto flex h-full max-w-[min(96vw,1400px)] items-center justify-center"
              initial={{ opacity: 0, x: dir * 46, filter: "blur(10px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: dir * -46, filter: "blur(10px)" }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="relative h-full w-full">
                {item.youtubeId ? (
                  <div className="absolute inset-0 grid place-items-center">
                    <div className="relative aspect-video w-full max-h-full">
                      <iframe
                        key={item.youtubeId}
                        src={`https://www.youtube-nocookie.com/embed/${item.youtubeId}?rel=0&modestbranding=1&playsinline=1`}
                        title={item.title}
                        allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        referrerPolicy="strict-origin-when-cross-origin"
                        className="absolute inset-0 h-full w-full border-0"
                      />
                    </div>
                  </div>
                ) : item.video?.src ? (
                  <SafeVideo media={item.video} trigger="viewport" label={item.title} />
                ) : (
                  <SafeImage
                    image={item.image}
                    kind="scan"
                    sizes="96vw"
                    imgClassName="object-contain"
                  />
                )}
              </div>
            </motion.figure>
          </AnimatePresence>

          {/* Edge hit-areas — big, invisible, and out of the way. */}
          <button
            onClick={() => step(-1)}
            aria-label="Previous"
            data-cursor="PREV"
            className="absolute inset-y-0 left-0 w-[16%] cursor-w-resize"
          />
          <button
            onClick={() => step(1)}
            aria-label="Next"
            data-cursor="NEXT"
            className="absolute inset-y-0 right-0 w-[16%] cursor-e-resize"
          />
        </div>

        <footer className="flex items-end justify-between gap-6 edge-x pb-7">
          <p className="t-meta max-w-[52ch] normal-case tracking-[0.06em]">
            {item.description}
            {item.href && (
              <>
                {" "}
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="OPEN"
                  className="text-paper underline underline-offset-4 hover:text-oxide"
                >
                  Open on YouTube ↗
                </a>
              </>
            )}
          </p>
          <p className="shrink-0 font-mono text-[0.68rem] tracking-[0.2em] text-ash tabular-nums">
            {String(index + 1).padStart(2, "0")}
            <span className="mx-1 text-dust">/</span>
            {String(items.length).padStart(2, "0")}
          </p>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
