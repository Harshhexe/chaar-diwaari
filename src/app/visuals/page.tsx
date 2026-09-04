import type { Metadata } from "next";
import { Visuals } from "@/components/sections/Visuals";
import { VideoScrub } from "@/components/motion/VideoScrub";
import { scrubVideo } from "@/data/videos";

export const metadata: Metadata = { title: "Visuals" };

export default function VisualsPage() {
  return (
    <div className="pt-[14vh]">
      <Visuals />
      <VideoScrub
        media={scrubVideo.media}
        title={scrubVideo.title}
        caption="Scroll controls playback."
      />
    </div>
  );
}
