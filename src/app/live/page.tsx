import type { Metadata } from "next";
import { Live } from "@/components/sections/Live";

export const metadata: Metadata = { title: "Live" };

export default function LivePage() {
  return <Live />;
}
