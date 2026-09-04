import type { TimelineEntry } from "./types";

/**
 * CAREER TIMELINE — REAL
 * ---------------------------------------------------------------------------
 * Every release date is from Apple's catalogue API (artist 1595489611); every
 * show is from the verified Bandsintown profile; the Future of Music listing
 * is from Rolling Stone India (5 Apr 2024). All read on 2026-09-04.
 *
 * Where a year has no verified milestone beyond its releases, it says so
 * rather than being padded out.
 */
export const timeline: TimelineEntry[] = [
  {
    year: "2021",
    headline: "THE FIRST RELEASE",
    body: "“Kaun Mera?” arrives on 20 November, self-released through Diwaari Records, with an official video the same day. The name Chaar Diwaari starts here.",
    markers: ["KAUN MERA?", "DIWAARI RECORDS"],
    image: {
      src: "https://i.ytimg.com/vi/ompSXppU9mU/maxresdefault.jpg",
      seed: "timeline-2021",
      alt: "Still from the Kaun Mera? video",
      width: 1280,
      height: 720,
      credit: "YouTube — Kaun Mera?",
    },
    isPlaceholder: false,
  },
  {
    year: "2022",
    headline: "TERI MAIYAT KE GAANE",
    body: "Four singles across the year — “Rang”, “Bhool Ja”, “Enjaay”, “Mera Saman Kahan Hai?” — then the debut EP on 16 December, still self-released, with MC Kode, Arpit Bala and Yashraj across its four tracks.",
    markers: ["DEBUT EP", "MC KODE", "ARPIT BALA", "YASHRAJ"],
    image: {
      src: "https://i.ytimg.com/vi/1Zk6Jg4QuF0/maxresdefault.jpg",
      seed: "timeline-2022",
      alt: "Still from the Mera Saman Kahan Hai? video",
      width: 1280,
      height: 720,
      credit: "YouTube — Mera Saman Kahan Hai?",
    },
    isPlaceholder: false,
  },
  {
    year: "2023",
    headline: "THE LABEL YEAR",
    body: "“Barood” in April, then “VIOLENCE” with Gravity in August — the first record carrying a Universal Music India line. “Garam” with Rawal follows, and “Jhaag” closes the year as the film that would go furthest of all of them.",
    markers: ["BAROOD", "VIOLENCE", "GARAM", "JHAAG", "DEF JAM INDIA"],
    image: {
      src: "https://i.ytimg.com/vi/XTYal8zcp3s/maxresdefault.jpg",
      seed: "timeline-2023",
      alt: "Still from the Barood video",
      width: 1280,
      height: 720,
      credit: "YouTube — Barood",
    },
    isPlaceholder: false,
  },
  {
    year: "2024",
    headline: "PYAAR DIWAARI",
    body: "Rolling Stone India names him in its Future of Music class in April. “Thehra” and “LOVESEXDHOKA!!!” open arcs one and two of Pyaar Diwaari. The live year begins: New Delhi in October, Pune in December.",
    markers: ["FUTURE OF MUSIC", "THEHRA", "LOVESEXDHOKA!!!", "NEW DELHI", "PUNE"],
    image: {
      src: "https://i.ytimg.com/vi/42J5m3t4klw/maxresdefault.jpg",
      seed: "timeline-2024",
      alt: "Still from the LOVESEXDHOKA!!! video",
      width: 1280,
      height: 720,
      credit: "YouTube — LOVESEXDHOKA!!!",
    },
    isPlaceholder: false,
  },
  {
    year: "2025",
    headline: "FAREBI",
    body: "Mumbai in February, Bengaluru in March. “Farebi” with Raftaar lands in April as arc three and becomes one of the most-watched films on the channel; the live session cut follows in June. “Banda Kaam Ka” with Sanjith Hegde opens the next record in November.",
    markers: ["MUMBAI", "BENGALURU", "RAFTAAR", "BANDA KAAM KA"],
    image: {
      src: "https://i.ytimg.com/vi/Pirzg-F_aag/maxresdefault.jpg",
      seed: "timeline-2025",
      alt: "Still from the Farebi video",
      width: 1280,
      height: 720,
      credit: "YouTube — Farebi",
    },
    isPlaceholder: false,
  },
  {
    year: "2026",
    headline: "PARVANA",
    body: "“Iss Tarah” with Sonu Nigam in February, then the Parvana EP on the 26th — six tracks with Encore ABJ, gini and Indian Ocean. “Radha”, with Natkhat, follows in September.",
    markers: ["PARVANA", "SONU NIGAM", "INDIAN OCEAN", "ENCORE ABJ", "RADHA"],
    image: {
      src: "https://i.ytimg.com/vi/s4fYA_wkta8/maxresdefault.jpg",
      seed: "timeline-2026",
      alt: "Still from the Iss Tarah video",
      width: 1280,
      height: 720,
      credit: "YouTube — Iss Tarah",
    },
    isPlaceholder: false,
  },
];
