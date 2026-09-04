"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MediaVideo } from "@/data/types";
import { claimPlayback, releasePlayback } from "@/lib/videoBus";
import { placeholder } from "@/lib/placeholder";
import { cx } from "@/lib/utils";
import { SafeImage } from "./SafeImage";

type Trigger = "viewport" | "hover" | "manual";

interface Props {
  media: MediaVideo;
  /** viewport → plays while on screen. hover → plays under the cursor. */
  trigger?: Trigger;
  loop?: boolean;
  className?: string;
  /** Forwarded to the poster placeholder. */
  label?: string;
  playing?: boolean;
  onReady?: (el: HTMLVideoElement) => void;
}

/**
 * A video that is honest about not existing yet.
 *
 * With `media.src === null` it renders only the poster placeholder — no <video>
 * element is created at all, so nothing 404s and no bandwidth is spent.
 *
 * With a real source it stays lazy: metadata only, never more than one clip
 * playing site-wide (see lib/videoBus), always muted + playsInline, and paused
 * the moment it leaves the viewport.
 */
export function SafeVideo({
  media,
  trigger = "viewport",
  loop = true,
  className,
  label,
  playing,
  onReady,
}: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [canPlay, setCanPlay] = useState(false);
  const [hovered, setHovered] = useState(false);
  const has = Boolean(media.src);

  const play = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    claimPlayback(el);
    el.play().catch(() => {
      /* autoplay refused — poster stays, which is a valid resting state */
    });
  }, []);

  const pause = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.pause();
    releasePlayback(el);
  }, []);

  // Viewport-driven playback + lazy source attachment.
  useEffect(() => {
    if (!has || trigger !== "viewport") return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? play() : pause()),
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      pause();
    };
  }, [has, trigger, play, pause]);

  useEffect(() => {
    if (!has || trigger !== "hover") return;
    if (hovered) play();
    else pause();
  }, [hovered, has, trigger, play, pause]);

  useEffect(() => {
    if (!has || trigger !== "manual") return;
    if (playing) play();
    else pause();
  }, [playing, has, trigger, play, pause]);

  const posterSrc =
    media.poster.src ??
    placeholder({
      seed: media.poster.seed,
      kind: "frame",
      width: media.poster.width ?? 1600,
      height: media.poster.height ?? 900,
      label,
    });

  return (
    <div
      className={cx("relative h-full w-full overflow-hidden bg-void", className)}
      onPointerEnter={trigger === "hover" ? () => setHovered(true) : undefined}
      onPointerLeave={trigger === "hover" ? () => setHovered(false) : undefined}
    >
      {/* The poster is always mounted underneath: it is the fallback, the
          loading state, and the resting state for hover-triggered clips. */}
      <SafeImage
        image={media.poster}
        kind="frame"
        label={label}
        sizes="(max-width: 768px) 100vw, 60vw"
        imgClassName={cx(
          "transition-opacity duration-700",
          has && canPlay && (trigger !== "hover" || hovered) ? "opacity-0" : "opacity-100",
        )}
      />

      {has && (
        <video
          ref={(el) => {
            ref.current = el;
            if (el) onReady?.(el);
          }}
          poster={posterSrc}
          muted
          playsInline
          loop={loop}
          preload="metadata"
          disablePictureInPicture
          onCanPlay={() => setCanPlay(true)}
          className="absolute inset-0 h-full w-full object-cover"
        >
          {media.webm && <source src={media.webm} type="video/webm" />}
          <source src={media.src as string} type="video/mp4" />
          {media.captions && (
            <track kind="captions" src={media.captions} srcLang="en" label="English" default />
          )}
        </video>
      )}
    </div>
  );
}
