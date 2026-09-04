import type { Metadata, Viewport } from "next";
import {
  Anton,
  Instrument_Serif,
  JetBrains_Mono,
  Noto_Sans_Devanagari,
  Space_Grotesk,
} from "next/font/google";
import "./globals.css";

import { artist } from "@/data/artist";
import { CustomCursor } from "@/components/core/CustomCursor";
import { GrainOverlay } from "@/components/core/GrainOverlay";
import { ScreenGlitches } from "@/components/core/ScreenGlitches";
import { LetterGlitch } from "@/components/backgrounds/LetterGlitch";
import { Navigation } from "@/components/core/Navigation";
import { PageTransition } from "@/components/core/PageTransition";
import { Preloader } from "@/components/core/Preloader";
import { SmoothScroll } from "@/components/core/SmoothScroll";
import { SvgFilters } from "@/components/core/SvgFilters";
import { MusicPlayer } from "@/components/player/MusicPlayer";
import { PlayerProvider } from "@/components/player/PlayerProvider";

/* --- type system -------------------------------------------------------- */

const display = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-anton",
  display: "swap",
});

const body = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-grotesk",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-jb",
  display: "swap",
});

const editorial = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["italic", "normal"],
  variable: "--font-editorial",
  display: "swap",
});

const devanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  variable: "--font-deva",
  display: "swap",
});

/* --- metadata ----------------------------------------------------------- */

const DESCRIPTION =
  "An interactive audiovisual experience built around the records, films and " +
  "words of Chaar Diwaari, the experimental Hindi artist from New Delhi. " +
  "An unofficial project — every release, film and quote links out to its " +
  "official source.";

export const metadata: Metadata = {
  title: {
    default: `${artist.name} — Digital Experience`,
    template: `%s — ${artist.name}`,
  },
  description: DESCRIPTION,
  applicationName: `${artist.name} — Digital Experience`,
  openGraph: {
    title: `${artist.name} — Digital Experience`,
    description: DESCRIPTION,
    type: "website",
  },
  /**
   * Deliberately not indexed.
   *
   * This site carries a real artist's name, portraits and catalogue but is not
   * operated by them. Letting it compete in search with the artist's own pages
   * would be the actual harm here, so it stays out of the index until whoever
   * runs it has the artist's blessing — at which point flip this to
   * `{ index: true, follow: true }`.
   */
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable} ${editorial.variable} ${devanagari.variable}`}
    >
      <body className="antialiased">
        {/*
          Every entrance animation parks its target at opacity 0 before the
          scroll trigger fires. If the bundle never arrives, that would hide the
          site — so without JS the resting state is simply "visible".

          This has to go in through dangerouslySetInnerHTML rather than as JSX
          children. When scripting is enabled the browser parses <noscript>
          content as a single raw text node, while React's server renderer emits
          it as real markup — so JSX children here hydrate as an element against
          a text node and throw a hydration mismatch on every load.
        */}
        <noscript
          dangerouslySetInnerHTML={{
            __html:
              "<style>[data-reveal],[data-split-unit],[data-reveal-item],[data-track]{opacity:1!important;transform:none!important;filter:none!important;clip-path:none!important}</style>",
          }}
        />

        <a href="#main" className="skip-link">
          SKIP TO CONTENT
        </a>

        <SvgFilters />

        {/* Ambient Letter Glitch Matrix Background (React Bits) */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
          <LetterGlitch />
        </div>

        <PlayerProvider>
          <SmoothScroll>
            <Preloader />
            <Navigation />

            <main id="main" className="relative z-[1]">
              <PageTransition>{children}</PageTransition>
            </main>

            <MusicPlayer />
          </SmoothScroll>
        </PlayerProvider>

        <ScreenGlitches />
        <GrainOverlay />
        <CustomCursor />
      </body>
    </html>
  );
}
