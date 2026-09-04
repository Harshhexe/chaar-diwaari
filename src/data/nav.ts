import type { NavItem } from "./types";

export const navItems: NavItem[] = [
  { index: "01", label: "MUSIC", href: "/music", anchor: "music", preview: { src: null, seed: "nav-music", alt: "", width: 1200, height: 800 } },
  { index: "02", label: "ABOUT", href: "/about", anchor: "about", preview: { src: null, seed: "nav-about", alt: "", width: 1200, height: 800 } },
  { index: "03", label: "VISUALS", href: "/visuals", anchor: "visuals", preview: { src: null, seed: "nav-visuals", alt: "", width: 1200, height: 800 } },
  { index: "04", label: "LIVE", href: "/live", anchor: "live", preview: { src: null, seed: "nav-live", alt: "", width: 1200, height: 800 } },
  { index: "05", label: "ARCHIVE", href: "/archive", anchor: "archive", preview: { src: null, seed: "nav-archive", alt: "", width: 1200, height: 800 } },
  { index: "06", label: "END", href: "/#end", anchor: "end", preview: { src: null, seed: "nav-end", alt: "", width: 1200, height: 800 } },
];
