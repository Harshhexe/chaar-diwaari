import { scrubVideo } from "@/data/videos";
import { songsWithLyrics } from "@/data/songs";

import { Hero } from "@/components/sections/Hero";
import { MusicIntro } from "@/components/sections/MusicIntro";
import { Discography } from "@/components/sections/Discography";
import { Lyrics } from "@/components/sections/Lyrics";
import { Words } from "@/components/sections/Words";
import { About } from "@/components/sections/About";
import { Timeline } from "@/components/sections/Timeline";
import { Visuals } from "@/components/sections/Visuals";
import { Live } from "@/components/sections/Live";
import { Archive } from "@/components/sections/Archive";
import { Press } from "@/components/sections/Press";
import { Streaming } from "@/components/sections/Streaming";
import { FinalSection } from "@/components/sections/FinalSection";
import { VideoScrub } from "@/components/motion/VideoScrub";

/**
 * THE EXPERIENCE
 * ---------------------------------------------------------------------------
 * The homepage carries the whole film. The routes under /music, /about, etc.
 * exist for deep links and for people who want one chapter on its own — nobody
 * should have to navigate anywhere to understand who this is.
 *
 * Order is deliberate: loud, still, loud. The scrubbed film sits between the
 * records and the biography so there is a cinematic beat in the middle, and the
 * archive's monospace language arrives only after the eye is tired of display
 * type.
 */
export default function Home() {
  // Only the tracks that actually have lyrics get a lyric chapter.
  const lyricSong = songsWithLyrics()[0];

  return (
    <>
      <Hero />
      <MusicIntro />
      <Discography />

      {lyricSong ? <Lyrics song={lyricSong} /> : <Words />}

      <VideoScrub
        id="film"
        length={2}
        media={scrubVideo.media}
        title={scrubVideo.title}
        caption="Scroll controls the sequence · Visual film experience"
      />

      <About />
      <Timeline />
      <Visuals />
      <Live />
      <Archive />
      <Press />
      <Streaming />
      <FinalSection />
    </>
  );
}
