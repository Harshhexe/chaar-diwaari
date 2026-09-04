import type { Artist } from "./types";

/**
 * ARTIST — REAL
 * ---------------------------------------------------------------------------
 * Sources, all checked 2026-09-04:
 *  - Official artist bio as published on Bandsintown's verified profile
 *    (name, city, self-description as producer / singer-songwriter / visual
 *    artist).
 *  - Rolling Stone India, "Chaar Diwaari — Future of Music 2024" (5 Apr 2024):
 *    real name, New Delhi, True School of Music, debut EP.
 *  - Apple Music catalogue API, artist 1595489611: release history.
 *  - Profile URLs below were each requested and confirmed to resolve to this
 *    artist before being written down.
 *
 * Nothing in the biography is inferred. If you cannot point at a source for a
 * sentence, it does not belong in this file.
 */
export const artist: Artist = {
  name: "CHAAR DIWAARI",
  nameDevanagari: "चार दीवारी",
  nameParts: ["CHAAR", "DIWAARI"],
  tagline: "EXPERIMENTAL HINDI MUSIC",

  bio: [
    "Chaar Diwaari is the alias of Garv Taneja, an artist based in New Delhi. He describes his focus as making experimental Hindi music and pushing at the boundaries of convention in art — and he works as producer, singer-songwriter and visual artist across all of it.",
    "The first release under the name arrived in November 2021. A year later came the debut EP, Teri Maiyat Ke Gaane, self-released through Diwaari Records with MC Kode, Arpit Bala and Yashraj across its four tracks. From 2023 the records began coming out through Universal Music India and Def Jam India.",
    "In 2024 Rolling Stone India named him part of its Future of Music class. Parvana followed in February 2026 — six tracks around the moth that will not leave the flame, with Sonu Nigam, Encore ABJ, gini and Indian Ocean passing through it.",
  ],

  roles: ["ARTIST", "PRODUCER", "WRITER", "PERFORMER"],
  based: "NEW DELHI, INDIA",

  /**
   * Official artist imagery, served from the platforms' own CDNs (allow-listed
   * in next.config.ts). These are the pictures the artist's team supplied to
   * Apple and Spotify. For a production launch, replace them with press assets
   * you have been given directly: drop files in /public/images and set `src`.
   */
  portraits: [
    {
      src: "/images/chaar-diwari-hero.webp",
      seed: "portrait-hero",
      alt: "Chaar Diwaari in fur coat and camo against glowing amber projection",
      width: 860,
      height: 860,
      credit: "Official artist portrait",
    },
    {
      src: "/images/chaar-diwaari-red-sarthak.jpg",
      seed: "portrait-red",
      alt: "Chaar Diwaari in oxide red editorial photoshoot",
      width: 1080,
      height: 720,
      credit: "Rolling Stone India · Photo by Sarthak",
    },
    {
      src: "/images/chaar-diwaari-bgmi-live.jpg",
      seed: "portrait-live",
      alt: "Chaar Diwaari performing live on stage with audience",
      width: 6048,
      height: 4024,
      credit: "Live Gig Performance",
    },
    {
      src: "/images/chaar-diwaari-parvana.jpg",
      seed: "portrait-about",
      alt: "Chaar Diwaari studio shoot for Parvana EP",
      width: 1080,
      height: 864,
      credit: "Parvana Studio Shoot",
    },
    {
      src: "https://i.scdn.co/image/ab6761610000e5eb7893d3d72cd3b06791652580",
      seed: "portrait-spotify",
      alt: "Chaar Diwaari in a fur coat, looking into the lens",
      width: 640,
      height: 640,
      credit: "Spotify artist image",
    },
    {
      src: "/images/chaar-diwaari-roshni.jpg",
      seed: "portrait-roshni",
      alt: "Chaar Diwaari editorial feature portrait",
      width: 1200,
      height: 800,
      credit: "Rolling Stone India Feature",
    },
    {
      src: "https://i.ytimg.com/vi/b-gjLgT4SUQ/maxresdefault.jpg",
      seed: "portrait-garam",
      alt: "Chaar Diwaari in Garam music video",
      width: 1280,
      height: 720,
      credit: "Garam Video Still",
    },
    {
      src: "https://is1-ssl.mzstatic.com/image/thumb/AMCArtistImages126/v4/dd/60/e2/dd60e275-3108-fe70-4200-4549ca209ff8/180c0bf0-ff7e-45ca-87dd-68be2f74b274_ami-identity-31917423245698e8947ffaea3135f223-2023-02-11T14-32-22.073Z_cropped.png/1400x1400bb.jpg",
      seed: "portrait-raincoat",
      alt: "Chaar Diwaari, seated against a red tiled wall in a translucent raincoat",
      width: 1400,
      height: 1400,
      credit: "Apple Music artist image",
    },
    {
      src: "https://i.ytimg.com/vi/Dqk2LyrtTBU/maxresdefault.jpg",
      seed: "portrait-jhaag",
      alt: "Chaar Diwaari in Jhaag music video",
      width: 1280,
      height: 720,
      credit: "Jhaag Video Still",
    },
  ],

  socialLinks: [
    { label: "INSTAGRAM", href: "https://www.instagram.com/chaardiwaari/", handle: "@chaardiwaari" },
    { label: "YOUTUBE", href: "https://www.youtube.com/@chaardiwaari", handle: "@chaardiwaari" },
  ],

  streaming: [
    { label: "SPOTIFY", href: "https://open.spotify.com/artist/2n4q8jLM4WLwlva1sZ2WRx" },
    { label: "APPLE MUSIC", href: "https://music.apple.com/in/artist/chaar-diwaari/1595489611" },
    { label: "YOUTUBE MUSIC", href: "https://music.youtube.com/channel/UCMcnoDQxbY2Esd3E0NmJ9Bg" },
  ],

  isPlaceholder: false,
};
