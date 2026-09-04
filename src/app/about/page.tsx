import type { Metadata } from "next";
import { About } from "@/components/sections/About";
import { Timeline } from "@/components/sections/Timeline";
import { Press } from "@/components/sections/Press";
import { Words } from "@/components/sections/Words";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="pt-[14vh]">
      <About />
      <Timeline />
      <Words />
      <Press />
    </div>
  );
}
