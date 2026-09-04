# CHAAR DIWAARI — DIGITAL EXPERIENCE

An interactive audiovisual site: a scroll-driven film rather than an artist
portfolio. Everything is static and frontend-only — no database, no CMS, no
auth, no API.

> **This is an unofficial project.** It carries a real artist's name, catalogue
> and images but is not operated by him or his labels, and ships `noindex` for
> that reason. All music, artwork and footage belongs to its rights holders.

**Everything in `/src/data` is real and sourced.** The discography, tracklists,
durations, artwork and Apple links come from Apple's public iTunes catalogue
API (artist `1595489611`); the films, upload dates and view counts from the
artist's official YouTube channel; the shows from his verified Bandsintown
profile; the quotes verbatim from named, dated, linked interviews. All read on
**2026-09-04**. Every source is recorded in a comment at the top of the file it
supports.

Two things are deliberately *not* here, and the UI says so out loud rather than
faking them:

| Missing | Why | What the site does instead |
| --- | --- | --- |
| **Lyrics** | Copyrighted; none are licensed to this project | The lyric chapter hides itself; the pinned reading room runs the artist's own interview quotes (`data/quotes.ts`) |
| **Live photography** | None licensed | Shows carry a still from a film of the same period, *labelled as a still*, and the detail view states that no show photography was supplied |

---

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # fully static; every route prerenders
```

Stack: Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 ·
GSAP + ScrollTrigger · Lenis · Motion (Framer Motion).

---

## How it is put together

```
src/
  data/          content model + all content. The UI reads only from here.
  lib/           scroll engine glue, hooks, placeholder generator, signals
  components/
    core/        preloader, navigation, cursor, grain, progress, transitions
    motion/      the reusable animation primitives
    media/       SafeImage / SafeVideo / PhotoViewer
    player/      persistent playback, waveform
    sections/    the chapters
  app/           routes
public/          media drop zone — see public/README.md
```

### The scroll engine

`SmoothScroll` creates one Lenis instance and drives it from GSAP's ticker, so
the whole site runs on a **single RAF loop**. Every Lenis frame pushes
`ScrollTrigger.update`, and a native `scroll` listener covers the cases Lenis
does not emit (in-page anchors, restored scroll positions, find-in-page,
programmatic `scrollTo`) — without that fallback, pinned sections silently
desync.

Under `prefers-reduced-motion` Lenis is never instantiated at all.

### Motion levels

The brief's three levels are enforced by which primitive you reach for:

| Level | Primitive | Used for |
| --- | --- | --- |
| 1 — micro | `MagneticButton`, hover states, `Waveform` | controls, links |
| 2 — section | `Reveal`, `SplitText`, `Parallax` | copy, imagery, headers |
| 3 — cinematic | `PinnedSection`, `HorizontalScroll`, `VideoScrub`, `AlbumExperience` | hero, discography, lyrics, film, timeline, end |

Level 3 is deliberately rare — there is stillness between the loud parts.

`Reveal` is the only entrance animation on the site. One variant table sets the
timing for every element, so the whole page breathes at the same tempo, and
every variant collapses to a short fade under reduced motion.

### Playback

`PlayerProvider` sits above the router, so music never stops when you move
between sections or routes. It runs two transports behind one API:

1. **Real audio** — an `<audio>` element plus a Web Audio analyser whose RMS
   feeds the reactive visuals.
2. **Placeholder transport** — when a track has no audio file (the current
   state), a RAF clock advances the playhead across the track's listed duration
   and a deterministic envelope fills the level signal. Progress, lyric sync and
   every reactive visual behave exactly as they will with real audio, and the
   player states plainly that no file is loaded. Nothing pretends to play music.

Playhead and level live in plain mutable objects (`lib/playerSignals.ts`), not
React state — they change 60×/second and visual components sample them inside
their own RAF loops. React state is reserved for what changes discretely.

### Media, and what is not rehosted

`SafeImage` / `SafeVideo` are the only way media enters the site.

- Real `src` → `next/image` (AVIF/WebP, responsive `sizes`, blurred LQIP).
- `src: null` → a **procedurally generated, art-directed placeholder**: a
  deterministic duotone film-still with grain, scanlines and a stamped label
  saying exactly what to drop in. Same seed, same image, forever.
- Load failure → silently degrades to that same placeholder.

There is no state in which a broken-image icon or a grey box can appear.

**Nothing is copied into this repo.** Artwork and stills are served from the
platforms' own CDNs and optimised through `next/image`; the three permitted
hosts are allow-listed in `next.config.ts` and anything else is refused at build
time. Films play in YouTube's embedded player (`youtube-nocookie.com`) — no
footage is downloaded, re-encoded or served from here, which is also why the
video tiles do not hover-autoplay. To self-host instead, drop files in
`/public` and change `src`; nothing else moves, and `SafeVideo`'s hover
playback turns itself back on.

### Audio

The player streams Apple's official **30-second preview** for each track — the
URL Apple publishes for exactly this purpose, and one that sends
`Access-Control-Allow-Origin: *`, so the Web Audio analyser gets real samples
and the reactive visuals run off the actual waveform.

Every track is labelled `30s PREVIEW` and links out to the full release. Nobody
is led to think this site is streaming the record. To serve full tracks you must
hold the rights: drop files in `/public/audio`, set `audio` to that path and
`isPreview: false`.

### Distortion

RGB separation and turbulent displacement are defined once in `SvgFilters` and
used **only as moments**: the two cut points of the scrubbed film, the tear as
an album is pulled out of the gallery, and the ~500ms of a route change. Nothing
carries a live filter while idle.

---

## Adding real content

Every file in `src/data/` is commented with what to replace.

| To add | Edit | Drop files in |
| --- | --- | --- |
| Bio, roles, socials, streaming | `data/artist.ts` | `/public/images` |
| Records | `data/albums.ts` | `/public/albums` |
| Songs, audio, lyrics | `data/songs.ts` | `/public/audio` |
| Films, visualisers | `data/videos.ts` | `/public/videos` |
| Shows | `data/events.ts` | `/public/posters` |
| Pull-quotes | `data/press.ts` | — |
| Interview quotes (reading room) | `data/quotes.ts` | — |
| Career years | `data/timeline.ts` | `/public/images` |

`data/archive.ts` is **derived** from the files above rather than maintained
separately — add a record or a film anywhere and it appears in the archive
automatically.

Rules that are structural, not stylistic:

- **Links stay `null` until verified.** A platform with no verified URL renders
  as inert type reading `[ADD VERIFIED LINK]`, never as a dead link. Every URL
  currently in `artist.ts` was opened and confirmed before being written down.
- **Lyrics and quotes are never approximated.** `lyrics: null` hides the lyric
  chapter for that track entirely; every quote is verbatim and linked.
- **Never list a real show beside an invented one.** `upcomingEvents` is empty
  because the artist's profile said "no upcoming shows" on the date it was read.
- **Stamp anything that goes stale.** View counts carry `viewsAsOf`; the
  discography footer carries the date the catalogue was read.
- `metadata.robots` in `app/layout.tsx` is `noindex` **on purpose** — see the
  comment there. Flip it only if you have the artist's blessing to run this.

### Scroll-scrubbed film

`data/videos.ts → scrubVideo.media.scrubSrc` drives the pinned film section.
That file **must** be short and densely keyframed or the browser cannot seek
smoothly:

```bash
ffmpeg -i source.mov -an -vf "scale=1600:-2,fps=25" \
  -c:v libx264 -preset slow -crf 26 -g 1 -keyint_min 1 \
  -movflags +faststart public/videos/scrub/hero-scrub.mp4
```

No such clip can legally be cut from YouTube, so until a licensed one is
supplied the section runs its full pinned choreography — zoom, hard cut,
chromatic separation, a live position readout — on a real still chosen for
having no burned-in titles. It reports sequence position rather than inventing
a running time for footage that is not there.

---

## Accessibility

Not traded away for the aesthetic:

- Skip link; semantic landmarks and headings throughout.
- Visible `:focus-visible` outlines everywhere — never removed.
- Focus trapping + Escape + scroll locking on the menu, album environment, show
  detail and photo viewer.
- `SplitText` exposes the whole string via `aria-label` and hides the fragments,
  so screen readers never hear "C H A A R".
- Keyboard: `←`/`→` in the photo viewer, `Space` to play/pause, `Shift+←/→` to
  change track, arrow keys on the seek slider.
- `prefers-reduced-motion` removes Lenis, every pin, every scrub, every parallax
  and every entrance transform, leaving short fades.
- Caption tracks are wired in `MediaVideo.captions` — required for any video
  carrying speech.
- The custom cursor is desktop + fine-pointer only, and never hides the OS
  cursor on touch or under reduced motion.

## Performance

- Static export of every route; no runtime data fetching.
- One RAF loop for scroll, animation and playback signals.
- Playhead/level bypass React entirely.
- Overlays (`AlbumExperience`, `PhotoViewer`) are dynamically imported — they
  only exist behind a click.
- Grain is skipped on low-core devices; heavy pointer effects are gated behind
  `(min-width: 1024px) and (pointer: fine)`.
- Video is `preload="metadata"`, viewport-gated, single-stream, and simply not
  created when a source is absent.
