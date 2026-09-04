# MEDIA DROP ZONE — CHAAR DIWAARI DIGITAL EXPERIENCE

Every folder below is wired into the site through `/src/data/*.ts`.
Nothing here is required for the site to run: any missing asset is replaced at
runtime by a procedurally generated, clearly-labelled placeholder
(see `src/lib/placeholder.ts`). You will never see a broken-image icon.

## How to replace a placeholder

1. Drop the file into the matching folder below.
2. Open the matching file in `/src/data/` and set the `src` field.
   Example — `src/data/albums.ts`:
   ```ts
   artwork: { src: "/albums/name-of-record.avif", alt: "…" }
   ```
3. That's it. The placeholder disappears automatically.

## Folders

| Folder            | What goes here                                        | Preferred format             |
| ----------------- | ----------------------------------------------------- | ---------------------------- |
| `/images`         | Portraits, editorial photography, hero stills         | `.avif` / `.webp`            |
| `/albums`         | Album + EP + single artwork (square, ≥2000px)          | `.avif` / `.webp`            |
| `/videos`         | Music videos, visualisers, live footage               | `.mp4` (h264) + `.webm`      |
| `/videos/scrub`   | SHORT, low-bitrate clips used for scroll-scrubbing    | `.mp4`, ≤8s, ≤2Mbps, keyint 1 |
| `/audio`          | Song audio for the persistent player                  | `.mp3` / `.m4a`              |
| `/archive`        | Scans, posters, polaroids, ephemera                   | `.avif` / `.webp`            |
| `/posters`        | Live + release posters                                | `.avif` / `.webp`            |
| `/fonts`          | Any licensed display font you own                     | `.woff2`                     |

## Scroll-scrub video encoding

Scrubbing needs dense keyframes or the browser cannot seek smoothly:

```bash
ffmpeg -i source.mov -an -vf "scale=1600:-2,fps=25" \
  -c:v libx264 -preset slow -crf 26 -g 1 -keyint_min 1 \
  -movflags +faststart public/videos/scrub/hero-scrub.mp4
```

Keep it under ~8 seconds. Long files make scrubbing stutter on every device.
