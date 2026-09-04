import { albums, albumById } from "./albums";
import { artist } from "./artist";
import { events } from "./events";
import { press } from "./press";
import { songs, songsOfAlbum } from "./songs";
import { videos } from "./videos";
import type { ArchiveItem, ArchiveType, MediaImage } from "./types";

/**
 * ARCHIVE — DERIVED & COMPREHENSIVE
 * ---------------------------------------------------------------------------
 * Includes every release and individual song across Chaar Diwaari's catalogue,
 * full filmography, extensive live show and editorial photo archives.
 */

export const archiveFolders: { type: ArchiveType; note: string }[] = [
  { type: "MUSIC", note: "ALL SONGS & RELEASES · 2021—2026" },
  { type: "VIDEOS", note: "FILMS · VISUALISERS · LIVE" },
  { type: "PHOTOS", note: "PORTRAITS · GIGS · STILLS" },
  { type: "LIVE", note: "SHOWS PLAYED" },
  { type: "PRESS", note: "INTERVIEWS · FEATURES" },
  { type: "POSTERS", note: "PROMOTIONAL POSTERS" },
  { type: "UNRELEASED", note: "VAULT · DEMOS" },
];

const ref = (type: ArchiveType, n: number) =>
  `CD/${type}/${String(n).padStart(3, "0")}`;

// All releases plus every individual track in the discography
const music: ArchiveItem[] = [
  ...albums.map((a, i) => ({
    id: `ar-release-${a.slug}`,
    type: "MUSIC" as ArchiveType,
    title: a.title,
    image: a.artwork,
    description: `${a.format} · ${a.description}`,
    year: a.year,
    meta: {
      format: a.format,
      size: `${songsOfAlbum(a.id).length} TRK`,
      ref: ref("MUSIC", i + 1),
    },
    isPlaceholder: false,
  })),
  ...songs.map((s, i) => {
    const album = albumById(s.albumId);
    return {
      id: `ar-song-${s.id}`,
      type: "MUSIC" as ArchiveType,
      title: s.title,
      image: album?.artwork ?? { src: null, seed: s.id, alt: s.title },
      description: `${s.artistCredit ?? "Chaar Diwaari"} · ${album?.title ?? "Single"}`,
      year: album?.year ?? "2024",
      meta: {
        format: "TRACK",
        size: s.duration,
        ref: ref("MUSIC", albums.length + i + 1),
      },
      isPlaceholder: false,
    };
  }),
];

const film: ArchiveItem[] = videos.map((v, i) => ({
  id: `ar-video-${v.id}`,
  type: "VIDEOS" as ArchiveType,
  title: v.title,
  image: v.media.poster,
  description: v.description,
  year: v.year,
  meta: {
    format: v.kind,
    size: v.views ? `${(v.views / 1_000_000).toFixed(1)}M VIEWS` : "FILM",
    ref: ref("VIDEOS", i + 1),
  },
  isPlaceholder: false,
}));

const extraPhotos: { title: string; image: MediaImage; desc: string; year: string; format: string }[] = [
  {
    title: "LIVE CONCERT — BGMI MASTERS",
    image: {
      src: "/images/chaar-diwaari-bgmi-live.jpg",
      seed: "ar-pic-live-1",
      alt: "Chaar Diwaari performing on live festival stage",
      width: 6048,
      height: 4024,
      credit: "Live Gig Photo",
    },
    desc: "Stage performance with full venue crowd recitation",
    year: "2025",
    format: "CONCERT",
  },
  {
    title: "EDITORIAL — OXIDE RED SHOOT",
    image: {
      src: "/images/chaar-diwaari-red-sarthak.jpg",
      seed: "ar-pic-sarthak",
      alt: "Chaar Diwaari red photoshoot by Sarthak",
      width: 1080,
      height: 720,
      credit: "Rolling Stone India · Sarthak",
    },
    desc: "Official editorial feature shoot in signature oxide red palette",
    year: "2023",
    format: "EDITORIAL",
  },
  {
    title: "PARVANA STUDIO SHOOT",
    image: {
      src: "/images/chaar-diwaari-parvana.jpg",
      seed: "ar-pic-parvana",
      alt: "Chaar Diwaari Parvana EP studio portrait",
      width: 1080,
      height: 864,
      credit: "Parvana Studio",
    },
    desc: "Studio portrait for Parvana EP release",
    year: "2026",
    format: "PORTRAIT",
  },
  {
    title: "ROSHNI COLLABORATIVE SHOOT",
    image: {
      src: "/images/chaar-diwaari-roshni.jpg",
      seed: "ar-pic-roshni",
      alt: "Chaar Diwaari in Roshni shoot",
      width: 1200,
      height: 800,
      credit: "Rolling Stone India",
    },
    desc: "Cover story and photoshoot for Roshni",
    year: "2023",
    format: "FEATURE",
  },
  {
    title: "THEHRA — STUDIO SESSIONS",
    image: {
      src: "/images/chaar-diwaari-thehra.jpg",
      seed: "ar-pic-thehra",
      alt: "Chaar Diwaari Thehra session",
      width: 1500,
      height: 1500,
      credit: "Def Jam India",
    },
    desc: "Studio session and artwork portrait for Thehra",
    year: "2024",
    format: "STUDIO",
  },
  {
    title: "FAREBI — LIVE BAND SESSION",
    image: {
      src: "https://i.ytimg.com/vi/XlOBtQSjYRU/maxresdefault.jpg",
      seed: "ar-pic-farebi-live",
      alt: "Chaar Diwaari Farebi Live Session",
      width: 1280,
      height: 720,
      credit: "YouTube Live Session",
    },
    desc: "Live in-studio performance session of Farebi with live instrumentation",
    year: "2025",
    format: "LIVE SESSION",
  },
  {
    title: "THEHRA — LIVE ACOUSTIC",
    image: {
      src: "https://i.ytimg.com/vi/ZsYliIMJ-BI/maxresdefault.jpg",
      seed: "ar-pic-thehra-live",
      alt: "Chaar Diwaari Thehra Live Acoustic",
      width: 1280,
      height: 720,
      credit: "YouTube Live Session",
    },
    desc: "Raw acoustic live performance session",
    year: "2024",
    format: "ACOUSTIC",
  },
  {
    title: "JHAAG — OFFICIAL STILL",
    image: {
      src: "https://i.ytimg.com/vi/Dqk2LyrtTBU/maxresdefault.jpg",
      seed: "ar-pic-jhaag",
      alt: "Chaar Diwaari Jhaag music video still",
      width: 1280,
      height: 720,
      credit: "Def Jam India",
    },
    desc: "Music video still from Jhaag, 11M+ views",
    year: "2023",
    format: "VIDEO STILL",
  },
  {
    title: "GARAM — OFFICIAL STILL",
    image: {
      src: "https://i.ytimg.com/vi/b-gjLgT4SUQ/maxresdefault.jpg",
      seed: "ar-pic-garam",
      alt: "Chaar Diwaari in Garam video with Rawal",
      width: 1280,
      height: 720,
      credit: "Garam Video",
    },
    desc: "Cinematic frame from Garam collaboration with Rawal",
    year: "2023",
    format: "VIDEO STILL",
  },
  {
    title: "BAROOD — OFFICIAL STILL",
    image: {
      src: "https://i.ytimg.com/vi/XTYal8zcp3s/maxresdefault.jpg",
      seed: "ar-pic-barood",
      alt: "Chaar Diwaari Barood video still",
      width: 1280,
      height: 720,
      credit: "Barood Video",
    },
    desc: "Official still from Barood breakthrough film",
    year: "2023",
    format: "VIDEO STILL",
  },
  {
    title: "LOVESEXDHOKA!!! — SHOOT STILL",
    image: {
      src: "https://i.ytimg.com/vi/42J5m3t4klw/maxresdefault.jpg",
      seed: "ar-pic-lsd",
      alt: "Chaar Diwaari LOVESEXDHOKA video still",
      width: 1280,
      height: 720,
      credit: "LOVESEXDHOKA",
    },
    desc: "Arc two of Pyaar Diwaari, high-concept visual piece",
    year: "2024",
    format: "VIDEO STILL",
  },
  {
    title: "VIOLENCE — WITH GRAVITY",
    image: {
      src: "https://i.ytimg.com/vi/IxitSvto9FQ/maxresdefault.jpg",
      seed: "ar-pic-violence",
      alt: "Chaar Diwaari Violence video still",
      width: 1280,
      height: 720,
      credit: "Universal Music India",
    },
    desc: "First major label collaborative visual film",
    year: "2023",
    format: "VIDEO STILL",
  },
];

const photos: ArchiveItem[] = [
  ...artist.portraits.map((p, i) => ({
    id: `ar-portrait-${i}`,
    type: "PHOTOS" as ArchiveType,
    title: `PORTRAIT ${String(i + 1).padStart(2, "0")}`,
    image: p,
    description: `${p.alt}${p.credit ? ` — ${p.credit}` : ""}`,
    year: "2023—2026",
    meta: {
      format: (p.credit ?? "IMAGE").split(" ")[0].toUpperCase(),
      size: `${p.width ?? 1280}×${p.height ?? 720}`,
      ref: ref("PHOTOS", i + 1),
    },
    isPlaceholder: false,
  })),
  ...extraPhotos.map((ep, i) => ({
    id: `ar-photo-extra-${i}`,
    type: "PHOTOS" as ArchiveType,
    title: ep.title,
    image: ep.image,
    description: ep.desc,
    year: ep.year,
    meta: {
      format: ep.format,
      size: `${ep.image.width ?? 1280}×${ep.image.height ?? 720}`,
      ref: ref("PHOTOS", artist.portraits.length + i + 1),
    },
    isPlaceholder: false,
  })),
];

const live: ArchiveItem[] = events.map((e, i) => ({
  id: `ar-live-${e.id}`,
  type: "LIVE",
  title: `${e.city} — ${e.venue}`,
  image: e.poster,
  description: e.note ?? "",
  year: e.year,
  meta: { format: "SHOW", size: e.date ?? "———", ref: ref("LIVE", i + 1) },
  isPlaceholder: false,
}));

const pressItems: ArchiveItem[] = press.map((p, i) => ({
  id: `ar-press-${p.id}`,
  type: "PRESS",
  title: p.source,
  // Press entries have no image of their own; the procedural plate stands in,
  // which is the correct behaviour rather than borrowing an unrelated picture.
  image: {
    src: null,
    seed: `archive-press-${p.id}`,
    alt: `${p.source}, ${p.year}`,
    width: 1240,
    height: 1754,
  },
  description: p.quote,
  year: p.year,
  meta: { format: "ARTICLE", size: p.date ?? "———", ref: ref("PRESS", i + 1) },
  isPlaceholder: false,
}));

export const archiveItems: ArchiveItem[] = [
  ...music,
  ...film,
  ...photos,
  ...live,
  ...pressItems,
];

export const archiveByType = (type: ArchiveType) =>
  archiveItems.filter((i) => i.type === type);

/**
 * The scattered wall. Curated rather than "everything with a picture" — a pile
 * of thirty images reads as a dump, not a composition.
 */
export const photoWall: ArchiveItem[] = [
  ...photos,
  ...film.filter((f) =>
    [
      "ar-video-XTYal8zcp3s",
      "ar-video-42J5m3t4klw",
      "ar-video-b-gjLgT4SUQ",
      "ar-video-s4fYA_wkta8",
      "ar-video-Dqk2LyrtTBU",
      "ar-video-l_r5AeJawmE",
      "ar-video-1Zk6Jg4QuF0",
      "ar-video-oct9a5g6JmM",
    ].includes(f.id),
  ),
  ...live.slice(0, 2),
];
