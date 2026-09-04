/**
 * CONTENT MODEL
 * ---------------------------------------------------------------------------
 * The UI reads only from these types. No component hardcodes content.
 *
 * `src: null` anywhere means "no real asset yet" — the media layer swaps in a
 * procedural placeholder (src/lib/placeholder.ts) instead of failing. Set the
 * string and the placeholder disappears. Nothing else has to change.
 */

export interface MediaImage {
  /**
   * Local path ("/images/portrait.avif") or an approved remote URL.
   * `null` = no asset yet, so a procedural placeholder is drawn instead.
   * Remote hosts must be allow-listed in next.config.ts → images.remotePatterns.
   */
  src: string | null;
  alt: string;
  /** Stable placeholder seed. Keep it even after adding a real src. */
  seed: string;
  width?: number;
  height?: number;
  /** Where the asset comes from. Shown in the archive, used for attribution. */
  credit?: string;
}

export interface MediaVideo {
  src: string | null;
  /** Optional WebM for browsers that prefer it. */
  webm?: string | null;
  poster: MediaImage;
  /** Short, densely-keyframed cut used only for scroll scrubbing. */
  scrubSrc?: string | null;
  /** Captions/subtitles track — required for any video carrying speech. */
  captions?: string | null;
  durationSec?: number;
}

export interface SocialLink {
  label: string;
  /** `null` until a verified URL is supplied. Never invent one. */
  href: string | null;
  handle?: string;
}

export interface Artist {
  name: string;
  nameDevanagari: string;
  nameParts: [string, string];
  tagline: string;
  /** Editorial fragments, rendered as separate spreads — not one wall of text. */
  bio: string[];
  roles: string[];
  based: string;
  portraits: MediaImage[];
  socialLinks: SocialLink[];
  streaming: SocialLink[];
  isPlaceholder: boolean;
}

export type ReleaseFormat = "ALBUM" | "EP" | "SINGLE" | "MIXTAPE";

export interface Album {
  id: string;
  slug: string;
  /** Apple Music release page. Opened from the album environment. */
  appleUrl?: string | null;
  title: string;
  /** Displayed under the title — supports a Devanagari secondary title. */
  subtitle?: string;
  year: string;
  format: ReleaseFormat;
  artwork: MediaImage;
  description: string;
  /** Song ids, in tracklist order. */
  songIds: string[];
  /** Hex used to tint the environment while this record is in focus. */
  tone: string;
  /** ℗ line exactly as published. Never paraphrase a rights statement. */
  copyright?: string;
  isPlaceholder: boolean;
}

export interface LyricLine {
  /** Seconds into the track. Used to sync the lyric view when audio plays. */
  t?: number;
  text: string;
}

export interface Song {
  id: string;
  title: string;
  albumId: string;
  trackNumber: number;
  /**
   * Audio source. Currently Apple's official 30-second preview stream, which
   * is published for exactly this purpose. Swap for a full local file in
   * /public/audio once you hold the rights to serve one.
   */
  audio: string | null;
  /** True when `audio` is a 30s preview rather than the full track. */
  isPreview?: boolean;
  /** Billed artists, exactly as credited on the release. */
  artistCredit?: string;
  /** Apple Music track page. */
  appleUrl?: string | null;
  /** "mm:ss" — display only; the player uses real metadata when audio exists. */
  duration: string;
  /** `null` hides the lyric experience for this track entirely. */
  lyrics: LyricLine[] | null;
  credits?: string[];
  isPlaceholder: boolean;
}

export type VideoKind =
  | "MUSIC VIDEO"
  | "VISUALISER"
  | "TEASER"
  | "LIVE"
  | "FILM";

export interface VideoWork {
  id: string;
  title: string;
  kind: VideoKind;
  year: string;
  /** Exact upload date, ISO. */
  date?: string;
  description: string;
  /**
   * YouTube id. The film is watched through YouTube's own player — the footage
   * is not rehosted, and nothing is downloaded.
   */
  youtubeId?: string | null;
  /** Views at the time the data was compiled, with `viewsAsOf` for honesty. */
  views?: number;
  viewsAsOf?: string;
  media: MediaVideo;
  /** Layout weight in the editorial grid: how much room this work commands. */
  scale: "sm" | "md" | "lg" | "xl";
  credits?: string[];
  isPlaceholder: boolean;
}

export interface LiveEvent {
  id: string;
  city: string;
  country?: string;
  venue: string;
  /** ISO date or `null` when unknown. Never guess a date. */
  date: string | null;
  year: string;
  status: "PAST" | "ANNOUNCED" | "TBA";
  poster: MediaImage;
  photos: MediaImage[];
  video?: MediaVideo | null;
  note?: string;
  isPlaceholder: boolean;
}

export type ArchiveType =
  | "MUSIC"
  | "PHOTOS"
  | "VIDEOS"
  | "POSTERS"
  | "LIVE"
  | "PRESS"
  | "UNRELEASED";

export interface ArchiveItem {
  id: string;
  type: ArchiveType;
  title: string;
  image: MediaImage;
  description: string;
  year: string;
  /** File-system flavour metadata shown in the archive UI. */
  meta?: { format?: string; size?: string; ref?: string };
  isPlaceholder: boolean;
}

export interface PressItem {
  id: string;
  /** Publication date of the piece, ISO. */
  date?: string;
  /** True when the words are the artist's, said to that publication. */
  isArtistQuote?: boolean;
  /** Never paraphrase or invent. Placeholder until the real pull-quote exists. */
  quote: string;
  source: string;
  year: string;
  href: string | null;
  isPlaceholder: boolean;
}

export interface TimelineEntry {
  year: string;
  headline: string;
  body: string;
  /** Short tags: releases, shows, shifts in the visual identity. */
  markers: string[];
  image: MediaImage;
  isPlaceholder: boolean;
}

export interface NavItem {
  index: string;
  label: string;
  href: string;
  /** Section id on the homepage, for in-page scroll navigation. */
  anchor?: string;
  preview: MediaImage;
}

/** A short, attributed quotation. Never paraphrased, always linked. */
export interface Quote {
  id: string;
  text: string;
  source: string;
  year: string;
  href: string;
}
