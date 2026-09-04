"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/hooks";

/**
 * ROUTE TRANSITION
 * ---------------------------------------------------------------------------
 * Routes are cuts inside one film, not separate pages: a bone curtain wipes
 * over the outgoing view and lifts off the incoming one, while `data-distort`
 * briefly arms the scanline and RGB-split layers so the cut has texture.
 * Nothing glitches outside those ~700ms.
 *
 * The curtain deliberately does NOT run on first load — the preloader already
 * owns that moment, and a white wipe immediately after it reads as a flash.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduced = usePrefersReducedMotion();
  // Captured once at mount and never updated — safe to read while rendering.
  const [firstPath] = useState(pathname);
  // Derived, not stateful: the curtain exists from the moment the pathname
  // differs from the one this provider mounted on.
  const navigated = pathname !== firstPath;

  useEffect(() => {
    if (!navigated) return;

    window.scrollTo(0, 0);
    if (reduced) return;

    const root = document.documentElement;
    root.setAttribute("data-distort", "on");
    const t = window.setTimeout(() => root.setAttribute("data-distort", "off"), 520);
    return () => window.clearTimeout(t);
  }, [pathname, reduced, navigated]);

  if (reduced) return <>{children}</>;

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      </AnimatePresence>

      {navigated && (
        <AnimatePresence>
          <motion.div
            key={`curtain-${pathname}`}
            aria-hidden
            className="pointer-events-none fixed inset-0 z-[110] bg-bone"
            initial={{ scaleY: 1, transformOrigin: "bottom" }}
            animate={{ scaleY: 0, transformOrigin: "top" }}
            transition={{ duration: 0.75, ease: [0.83, 0, 0.17, 1] }}
          />
        </AnimatePresence>
      )}
    </>
  );
}
