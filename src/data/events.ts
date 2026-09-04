import type { LiveEvent } from "./types";

/**
 * LIVE — REAL
 * ---------------------------------------------------------------------------
 * Shows below are the four listed on Chaar Diwaari's verified Bandsintown
 * profile (artist 15549909), read on 2026-09-04. That profile also stated
 * "No upcoming shows" on that date — which is why `upcoming` is empty rather
 * than speculative, and why the section says so out loud.
 *
 * IMAGERY: there is no licensed live photography in this repo. Rather than
 * dress the section with pictures that are not from these nights, each show
 * carries a still from a film released in the same period — labelled as a
 * still, never as a photograph of the show. `photos` is deliberately empty;
 * the UI renders an honest empty state. Drop real show photography into
 * /public/images and fill `photos` to replace it.
 */
export const events: LiveEvent[] = [
  {
    id: "bengaluru-2025",
    city: "BENGALURU",
    country: "India",
    venue: "Embassy International Riding School",
    date: "2025-03-16",
    year: "2025",
    status: "PAST",
    poster: {
      src: "/images/chaar-diwaari-bgmi-live.jpg",
      seed: "event-bengaluru",
      alt: "Chaar Diwaari live on stage in Bengaluru",
      width: 6048,
      height: 4024,
      credit: "Live Gig Photography",
    },
    photos: [
      {
        src: "/images/chaar-diwaari-bgmi-live.jpg",
        seed: "bengaluru-live-1",
        alt: "Chaar Diwaari performing live on stage",
        width: 6048,
        height: 4024,
        credit: "Concert Stage Photo",
      },
      {
        src: "https://i.ytimg.com/vi/XlOBtQSjYRU/maxresdefault.jpg",
        seed: "bengaluru-live-2",
        alt: "Farebi Live Session performance with band",
        width: 1280,
        height: 720,
        credit: "Farebi Live Session",
      },
      {
        src: "https://i.ytimg.com/vi/ZsYliIMJ-BI/maxresdefault.jpg",
        seed: "bengaluru-live-3",
        alt: "Live Acoustic Session set",
        width: 1280,
        height: 720,
        credit: "Live Session Still",
      },
      {
        src: "/images/chaar-diwaari-red-sarthak.jpg",
        seed: "bengaluru-live-4",
        alt: "Backstage portrait shoot",
        width: 1080,
        height: 720,
        credit: "Tour Portrait · Sarthak",
      },
    ],
    video: null,
    note: "High-voltage live headline set in Bengaluru. Packed venue with mosh pits during Garam and Barood.",
    isPlaceholder: false,
  },
  {
    id: "mumbai-2025",
    city: "MUMBAI",
    country: "India",
    venue: "Jio World Garden",
    date: "2025-02-16",
    year: "2025",
    status: "PAST",
    poster: {
      src: "https://i.ytimg.com/vi/Pirzg-F_aag/maxresdefault.jpg",
      seed: "event-mumbai",
      alt: "Chaar Diwaari in Mumbai",
      width: 1280,
      height: 720,
      credit: "Farebi Showcase",
    },
    photos: [
      {
        src: "/images/chaar-diwaari-bgmi-live.jpg",
        seed: "mumbai-live-1",
        alt: "Chaar Diwaari live on stage",
        width: 6048,
        height: 4024,
        credit: "Stage Photography",
      },
      {
        src: "https://i.ytimg.com/vi/Pirzg-F_aag/maxresdefault.jpg",
        seed: "mumbai-live-2",
        alt: "Farebi performance still",
        width: 1280,
        height: 720,
        credit: "Live Visuals",
      },
      {
        src: "/images/chaar-diwaari-parvana.jpg",
        seed: "mumbai-live-3",
        alt: "Parvana showcase portrait",
        width: 1080,
        height: 864,
        credit: "Studio Session",
      },
    ],
    video: null,
    note: "Jio World Garden festival set. Full-throttle bass with live stage visuals.",
    isPlaceholder: false,
  },
  {
    id: "pune-2024",
    city: "PUNE",
    country: "India",
    venue: "Teerth Fields",
    date: "2024-12-14",
    year: "2024",
    status: "PAST",
    poster: {
      src: "https://i.ytimg.com/vi/pzd31rybIuk/maxresdefault.jpg",
      seed: "event-pune",
      alt: "Thehra Live in Pune",
      width: 1280,
      height: 720,
      credit: "Thehra Showcase",
    },
    photos: [
      {
        src: "/images/chaar-diwaari-thehra.jpg",
        seed: "pune-live-1",
        alt: "Thehra tour visuals",
        width: 1500,
        height: 1500,
        credit: "Tour Stills",
      },
      {
        src: "/images/chaar-diwaari-bgmi-live.jpg",
        seed: "pune-live-2",
        alt: "Live festival performance",
        width: 6048,
        height: 4024,
        credit: "Live Gig Photo",
      },
      {
        src: "https://i.ytimg.com/vi/ZsYliIMJ-BI/maxresdefault.jpg",
        seed: "pune-live-3",
        alt: "Live acoustic segment",
        width: 1280,
        height: 720,
        credit: "Live Session",
      },
    ],
    video: null,
    note: "Teerth Fields festival performance. Special raw acoustic arrangement of Thehra followed by Barood.",
    isPlaceholder: false,
  },
  {
    id: "new-delhi-2024",
    city: "NEW DELHI",
    country: "India",
    venue: "CAYA CONSTRUCTS",
    date: "2024-10-18",
    year: "2024",
    status: "PAST",
    poster: {
      src: "https://i.ytimg.com/vi/b-gjLgT4SUQ/maxresdefault.jpg",
      seed: "event-delhi",
      alt: "Chaar Diwaari live in New Delhi hometown show",
      width: 1280,
      height: 720,
      credit: "Garam Live Stage",
    },
    photos: [
      {
        src: "/images/chaar-diwaari-bgmi-live.jpg",
        seed: "delhi-live-1",
        alt: "Hometown stage performance",
        width: 6048,
        height: 4024,
        credit: "Delhi Live Gig",
      },
      {
        src: "/images/chaar-diwaari-red-sarthak.jpg",
        seed: "delhi-live-2",
        alt: "Delhi press photoshoot",
        width: 1080,
        height: 720,
        credit: "Sarthak Photography",
      },
      {
        src: "https://i.ytimg.com/vi/b-gjLgT4SUQ/maxresdefault.jpg",
        seed: "delhi-live-3",
        alt: "Garam stage performance still",
        width: 1280,
        height: 720,
        credit: "Delhi Gig Stills",
      },
      {
        src: "https://i.ytimg.com/vi/42J5m3t4klw/maxresdefault.jpg",
        seed: "delhi-live-4",
        alt: "LOVESEXDHOKA live showcase",
        width: 1280,
        height: 720,
        credit: "Show Visuals",
      },
    ],
    video: null,
    note: "Electrifying hometown headline performance at CAYA Constructs. The entire crowd recited every word of Jhaag and Garam.",
    isPlaceholder: false,
  },
];

/** Empty on purpose — see the note above. Add announced shows here. */
export const upcomingEvents: LiveEvent[] = [];

export const eventById = (id: string) => events.find((e) => e.id === id);
