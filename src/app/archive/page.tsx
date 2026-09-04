import type { Metadata } from "next";
import { Archive } from "@/components/sections/Archive";
import { Press } from "@/components/sections/Press";

export const metadata: Metadata = { title: "Archive" };

export default function ArchivePage() {
  return (
    <div className="pt-[14vh]">
      <Archive />
      <Press />
    </div>
  );
}
