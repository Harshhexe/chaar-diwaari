"use client";

import Image from "next/image";
import { useState } from "react";
import type { MediaImage } from "@/data/types";
import { placeholder, placeholderBlur, type PlaceholderKind } from "@/lib/placeholder";
import { cx } from "@/lib/utils";

interface Props {
  image: MediaImage;
  kind?: PlaceholderKind;
  /** Overrides the placeholder's stamped label. */
  label?: string;
  sizes?: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  /** Fills the parent (which must be positioned). Default true. */
  fill?: boolean;
  /** Lower this for background layers so the label/bars are suppressed. */
  intensity?: number;
}

/**
 * The only way images enter the site.
 *
 * - Real `src`  → next/image, AVIF/WebP, responsive `sizes`, blurred LQIP.
 * - `src: null` → a deterministic procedural placeholder (never a grey box).
 * - Load error  → silently degrades to that same placeholder.
 *
 * Because the placeholder is generated from `seed`, an album keeps its colour
 * between renders and layouts never shift when real art is dropped in.
 */
export function SafeImage({
  image,
  kind = "still",
  label,
  sizes = "100vw",
  className,
  imgClassName,
  priority,
  fill = true,
  intensity = 1,
}: Props) {
  const [failed, setFailed] = useState(false);
  const missing = !image.src || failed;

  const w = image.width ?? 1200;
  const h = image.height ?? 1500;

  const body = missing ? (
    // eslint-disable-next-line @next/next/no-img-element -- data-URI placeholder; nothing to optimise.
    <img
      src={placeholder({ seed: image.seed, kind, width: w, height: h, label, intensity })}
      alt={image.alt}
      draggable={false}
      className={cx(
        fill ? "absolute inset-0 h-full w-full" : "block h-auto w-full",
        "object-cover select-none",
        imgClassName,
      )}
    />
  ) : (
    <Image
      src={image.src as string}
      alt={image.alt}
      {...(fill ? { fill: true } : { width: w, height: h })}
      sizes={sizes}
      priority={priority}
      placeholder="blur"
      blurDataURL={placeholderBlur(image.seed)}
      draggable={false}
      onError={() => setFailed(true)}
      className={cx("object-cover select-none", imgClassName)}
    />
  );

  if (!className) return body;
  return <span className={cx("block", className)}>{body}</span>;
}
