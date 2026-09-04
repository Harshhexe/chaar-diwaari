import type { Quote } from "./types";

/**
 * IN HIS OWN WORDS
 * ---------------------------------------------------------------------------
 * This is what fills the site's pinned "reading room" chapter.
 *
 * That chapter was designed for lyrics. Song lyrics are copyrighted and are
 * not reproduced anywhere in this project, so rather than leave the strongest
 * piece of scroll choreography on the site unused — or fake it — the same
 * mechanism reads the artist's own words from named, dated, linked interviews.
 *
 * Every line is verbatim. If licensed lyrics are ever added to
 * /src/data/songs.ts, the lyric chapter turns itself back on automatically and
 * this one can sit alongside it.
 */
export const quotes: Quote[] = [
  {
    id: "q-01",
    text: "I'm making music that I'm infusing everything that I want to in a single song.",
    source: "Rolling Stone India",
    year: "2024",
    href: "https://rollingstoneindia.com/future-of-music-2024/chaar-diwaari-future-of-music-2024/",
  },
  {
    id: "q-02",
    text: "It's a very feeling-driven and programming-driven approach.",
    source: "Rolling Stone India",
    year: "2024",
    href: "https://rollingstoneindia.com/future-of-music-2024/chaar-diwaari-future-of-music-2024/",
  },
  {
    id: "q-03",
    text: "I'm very thankful because when I came up in the scene, the DHH community welcomed me with open hands and open arms.",
    source: "Rolling Stone India",
    year: "2024",
    href: "https://rollingstoneindia.com/future-of-music-2024/chaar-diwaari-future-of-music-2024/",
  },
  {
    id: "q-04",
    text: "I felt like I hadn't lived enough to fully be able to make an autobiographical project at that time.",
    source: "Rolling Stone India",
    year: "2026",
    href: "https://rollingstoneindia.com/chaar-diwaari-parvana-ep-sonu-nigam-interview/",
  },
  {
    id: "q-05",
    text: "Enjoy it on surface level first and then go deeper.",
    source: "Outlook India",
    year: "2025",
    href: "https://www.outlookindia.com/art-entertainment/interview/chaar-diwaari-interview-on-his-latest-single-the-light-im-looking-for-is-the-touch-of-god",
  },
  {
    id: "q-06",
    text: "The light that I am actually looking for is the touch of God.",
    source: "Outlook India",
    year: "2025",
    href: "https://www.outlookindia.com/art-entertainment/interview/chaar-diwaari-interview-on-his-latest-single-the-light-im-looking-for-is-the-touch-of-god",
  },
];
