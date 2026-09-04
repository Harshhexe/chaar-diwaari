import type { Metadata } from "next";
import { MusicIntro } from "@/components/sections/MusicIntro";
import { Discography } from "@/components/sections/Discography";
import { Lyrics } from "@/components/sections/Lyrics";
import { Words } from "@/components/sections/Words";
import { Streaming } from "@/components/sections/Streaming";
import { songsWithLyrics } from "@/data/songs";

export const metadata: Metadata = { title: "Music" };

export default function MusicPage() {
  const lyricSong = songsWithLyrics()[0];
  return (
    <div className="pt-[18vh]">
      <MusicIntro />
      <Discography />
      {lyricSong ? <Lyrics song={lyricSong} /> : <Words />}
      <Streaming />
    </div>
  );
}
