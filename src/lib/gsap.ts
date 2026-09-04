"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Single registration point. Importing gsap anywhere else in the app should go
 * through this module so ScrollTrigger is guaranteed to be registered once.
 */
let registered = false;

if (typeof window !== "undefined") {
  if (!registered) {
    registered = true;
    gsap.registerPlugin(ScrollTrigger);
    // Batched reads/writes; ScrollTrigger updates are driven by Lenis' RAF.
    ScrollTrigger.config({ ignoreMobileResize: true });
    // Always sort triggers by DOM order prior to calculating positions and pin spacing.
    ScrollTrigger.addEventListener("refreshInit", () => {
      ScrollTrigger.sort();
    });
    gsap.defaults({ ease: "power3.out" });
  }
}

export { gsap, ScrollTrigger };

/** Motion levels from the brief — kept in one place so timing stays coherent. */
export const MOTION = {
  micro: { duration: 0.4, ease: "power2.out" },
  section: { duration: 1.0, ease: "expo.out" },
  cinematic: { duration: 1.6, ease: "expo.inOut" },
} as const;
