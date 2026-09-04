/**
 * PROCEDURAL PLACEHOLDER MEDIA
 * ---------------------------------------------------------------------------
 * Real Chaar Diwaari photography, artwork and footage is not in this repo yet.
 * Rather than shipping grey boxes or broken-image icons, every missing asset is
 * replaced by a deterministic, art-directed SVG generated from a seed string:
 * a duotone film-still abstraction with grain, scanlines and a hard label that
 * states exactly what needs to be dropped in.
 *
 * Same seed -> same image, forever. So layouts stay stable between renders and
 * an album keeps "its" colour until the real artwork lands.
 *
 * Delete nothing here when real media arrives — just set `src` in /src/data.
 */

export type PlaceholderKind =
  | "portrait"
  | "artwork"
  | "still"
  | "poster"
  | "scan"
  | "frame";

/* --- deterministic noise -------------------------------------------------- */

function hash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed: string) {
  let s = hash(seed) || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return s / 4294967296;
  };
}

/* --- palette -------------------------------------------------------------- */

/** Restrained duotone pairs. Black ground, one warm lift, one cold lift. */
const DUOTONES: Array<[string, string]> = [
  ["#5c2410", "#1b2228"], // oxide / slate
  ["#4a3110", "#161d26"], // amber ash / blue-black
  ["#54181a", "#1e1815"], // dried blood / brown-black
  ["#1d3a35", "#3a1c0c"], // pine / rust
  ["#3a332e", "#141a21"], // neutral char / ink
  ["#553112", "#17171f"], // tobacco / graphite
];

const LABELS: Record<PlaceholderKind, string> = {
  portrait: "ADD REAL PORTRAIT",
  artwork: "ADD REAL ARTWORK",
  still: "ADD REAL STILL",
  poster: "ADD REAL POSTER",
  scan: "ADD REAL SCAN",
  frame: "ADD REAL FRAME",
};

export interface PlaceholderOptions {
  seed: string;
  kind?: PlaceholderKind;
  width?: number;
  height?: number;
  /** Overrides the auto label, e.g. "ADD ALBUM ARTWORK — RECORD 01". */
  label?: string;
  /** 0 = flat ground, 1 = full composition. Lower it for background layers. */
  intensity?: number;
}

/**
 * Builds the raw SVG markup. Exported for tests / static export scripts.
 */
export function placeholderSvg({
  seed,
  kind = "still",
  width = 1200,
  height = 1500,
  label,
  intensity = 1,
}: PlaceholderOptions): string {
  const r = rng(seed);
  const [warm, cool] = DUOTONES[Math.floor(r() * DUOTONES.length)];
  const id = hash(seed).toString(36).slice(0, 6);

  const angle = Math.floor(r() * 180);
  const bx = 20 + r() * 60;
  const by = 15 + r() * 55;
  const bx2 = 20 + r() * 60;
  const by2 = 30 + r() * 55;
  const br = 34 + r() * 26;

  // A single hard diagonal — the only "graphic" gesture. Keeps it editorial.
  const cut = 0.42 + r() * 0.3;
  const skew = (r() - 0.5) * 0.22;

  const bars = Array.from({ length: 3 }, () => {
    const y = (0.18 + r() * 0.7) * height;
    const w = (0.06 + r() * 0.3) * width;
    const x = r() * (width - w);
    const h = 1 + Math.floor(r() * 2);
    return `<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${w.toFixed(
      0,
    )}" height="${h}" fill="#ede8e0" opacity="${(0.05 + r() * 0.07).toFixed(3)}"/>`;
  }).join("");

  const text = label ?? LABELS[kind];
  const fs = Math.max(11, Math.round(Math.min(width, height) * 0.026));

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-hidden="true">
<defs>
<linearGradient id="g${id}" gradientTransform="rotate(${angle} .5 .5)">
<stop offset="0%" stop-color="${warm}"/><stop offset="100%" stop-color="${cool}"/>
</linearGradient>
<radialGradient id="b${id}"><stop offset="0%" stop-color="${warm}" stop-opacity="${(
    0.85 * intensity
  ).toFixed(2)}"/><stop offset="100%" stop-color="${warm}" stop-opacity="0"/></radialGradient>
<radialGradient id="c${id}"><stop offset="0%" stop-color="${cool}" stop-opacity="${(
    0.9 * intensity
  ).toFixed(2)}"/><stop offset="100%" stop-color="${cool}" stop-opacity="0"/></radialGradient>
<filter id="n${id}" x="0" y="0" width="100%" height="100%">
<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="${
    hash(seed) % 100
  }" stitchTiles="stitch"/>
<feColorMatrix type="saturate" values="0"/>
</filter>
<filter id="s${id}"><feGaussianBlur stdDeviation="${(
    Math.min(width, height) * 0.06
  ).toFixed(1)}"/></filter>
<clipPath id="p${id}"><rect width="${width}" height="${height}"/></clipPath>
</defs>
<g clip-path="url(#p${id})">
<rect width="${width}" height="${height}" fill="#0b0b0c"/>
<rect width="${width}" height="${height}" fill="url(#g${id})" opacity="${(
    0.9 * intensity
  ).toFixed(2)}"/>
<g filter="url(#s${id})" opacity="${(0.95 * intensity).toFixed(2)}">
<circle cx="${((bx / 100) * width).toFixed(0)}" cy="${((by / 100) * height).toFixed(
    0,
  )}" r="${((br / 100) * width).toFixed(0)}" fill="url(#b${id})"/>
<circle cx="${((bx2 / 100) * width).toFixed(0)}" cy="${(
    (by2 / 100) *
    height
  ).toFixed(0)}" r="${((br / 100) * width * 0.8).toFixed(0)}" fill="url(#c${id})"/>
</g>
<path d="M0 ${(cut * height).toFixed(0)} L${width} ${(
    (cut + skew) *
    height
  ).toFixed(0)} L${width} ${height} L0 ${height} Z" fill="#000" opacity="${(
    0.32 * intensity
  ).toFixed(2)}"/>
${intensity > 0.5 ? bars : ""}
<rect width="${width}" height="${height}" filter="url(#n${id})" opacity="${(
    0.3 * intensity
  ).toFixed(2)}" style="mix-blend-mode:overlay"/>
<rect width="${width}" height="${height}" fill="none" stroke="#ede8e0" stroke-opacity="0.1" stroke-width="2"/>
${
  intensity > 0.5
    ? `<text x="${fs * 1.4}" y="${height - fs * 1.6}" fill="#ede8e0" fill-opacity="0.5"
 font-family="ui-monospace,SFMono-Regular,Menlo,monospace" font-size="${fs}" letter-spacing="${(
        fs * 0.22
      ).toFixed(1)}">[ ${text} ]</text>
<text x="${fs * 1.4}" y="${fs * 2.4}" fill="#ede8e0" fill-opacity="0.28"
 font-family="ui-monospace,SFMono-Regular,Menlo,monospace" font-size="${fs * 0.8}" letter-spacing="${(
        fs * 0.18
      ).toFixed(1)}">${width}×${height}</text>`
    : ""
}
</g></svg>`;
}

/** Ready-to-use `src` for <img>/<video poster>. */
export function placeholder(opts: PlaceholderOptions): string {
  return `data:image/svg+xml,${encodeURIComponent(placeholderSvg(opts))}`;
}

/** Tiny, cheap version for `blurDataURL` / LQIP. */
export function placeholderBlur(seed: string): string {
  return `data:image/svg+xml,${encodeURIComponent(
    placeholderSvg({ seed, width: 24, height: 30, intensity: 0.9 }),
  )}`;
}

/** Deterministic accent colour derived from a seed — used to tint sections. */
export function seedTone(seed: string): string {
  const r = rng(seed + "::tone");
  const [warm] = DUOTONES[Math.floor(r() * DUOTONES.length)];
  return warm;
}
