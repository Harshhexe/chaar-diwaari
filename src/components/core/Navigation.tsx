"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { navItems } from "@/data/nav";
import { artist } from "@/data/artist";
import { useEscape, useFocusTrap, useScrollLock } from "@/lib/hooks";
import { SafeImage } from "@/components/media/SafeImage";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { useSmoothScroll } from "./SmoothScroll";

const EASE = [0.83, 0, 0.17, 1] as const;

/**
 * NAVIGATION
 * ---------------------------------------------------------------------------
 * No permanent navbar. Two marks float over the film — the CD monogram and
 * MENU — and everything else lives in a fullscreen overlay.
 *
 * The overlay is built from three simultaneous gestures: a clip-path curtain,
 * masked type rising per item, and a preview plate that cross-dissolves as the
 * pointer moves between items. On the homepage an item scrolls to its section
 * instead of routing, so the experience stays continuous.
 */
export function Navigation() {
  const pathname = usePathname();
  // The menu remembers which route it was opened on, so a route change closes
  // it by definition rather than through an effect that fires after paint.
  const [openedOn, setOpenedOn] = useState<string | null>(null);
  const open = openedOn === pathname;
  const setOpen = useCallback(
    (v: boolean | ((prev: boolean) => boolean)) => {
      setOpenedOn((prev) => {
        const wasOpen = prev === pathname;
        const nextOpen = typeof v === "function" ? v(wasOpen) : v;
        return nextOpen ? pathname : null;
      });
    },
    [pathname],
  );
  const [hovered, setHovered] = useState<string | null>(null);
  const router = useRouter();
  const { scrollTo } = useSmoothScroll();

  const trapRef = useFocusTrap<HTMLDivElement>(open);
  useScrollLock(open);
  useEscape(() => setOpen(false), open);

  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const checkModal = () => {
      const dialog = document.querySelector('[role="dialog"]:not(#cd-menu)');
      setModalOpen(!!dialog);
    };
    checkModal();
    const observer = new MutationObserver(checkModal);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  const go = useCallback(
    (href: string, anchor?: string) => {
      setOpen(false);
      const onHome = pathname === "/";
      if (onHome && anchor && document.getElementById(anchor)) {
        // Wait for the curtain to clear before moving the page under it.
        window.setTimeout(() => scrollTo(`#${anchor}`, -8), 620);
        return;
      }
      router.push(href);
    },
    [pathname, router, scrollTo, setOpen],
  );

  const preview = navItems.find((i) => i.label === hovered)?.preview;

  return (
    <>
      {/* --- floating marks ------------------------------------------- */}
      <div
        data-nav-header
        style={{
          opacity: modalOpen ? 0 : 1,
          pointerEvents: modalOpen ? "none" : undefined,
          visibility: modalOpen ? "hidden" : "visible",
        }}
        className="pointer-events-none fixed inset-x-0 top-0 z-[100] flex items-start justify-between edge-x pt-5 mix-blend-difference transition-opacity duration-300 sm:pt-7"
      >
        <Link
          href="/"
          className="pointer-events-auto tap-safe -m-2 grid place-items-center p-2 t-display text-[1.6rem] leading-none tracking-[0.02em] text-bone sm:text-[1.9rem]"
          aria-label={`${artist.name} — home`}
          data-cursor="HOME"
        >
          CD
        </Link>

        <div className="pointer-events-auto flex items-center gap-3 sm:gap-6">
          <a
            href="https://www.instagram.com/har3hhhhh/"
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="@HARSH"
            className="t-label align-middle tap-safe border border-bone/20 bg-void/40 backdrop-blur-sm px-2.5 py-1 text-[0.64rem] sm:text-[0.68rem] tracking-[0.16em] text-bone/85 transition-all hover:border-oxide hover:bg-oxide hover:text-void"
            aria-label="Made by Harsh on Instagram"
          >
            MADE BY HARSH ↗
          </a>


          <MagneticButton
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="cd-menu"
            className="pointer-events-auto tap-safe t-label px-1 py-1 text-bone"
            data-cursor={open ? "CLOSE" : "OPEN"}
          >
            <span className="relative block overflow-hidden text-right" style={{ width: "52px" }}>
              <span
                className="block transition-transform duration-500"
                style={{ transform: open ? "translateY(-110%)" : "translateY(0)" }}
              >
                MENU
              </span>
              <span
                className="absolute inset-0 block transition-transform duration-500"
                style={{ transform: open ? "translateY(0)" : "translateY(110%)" }}
              >
                CLOSE
              </span>
            </span>
          </MagneticButton>
        </div>
      </div>

      {/* --- overlay --------------------------------------------------- */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="cd-menu"
            ref={trapRef}
            role="dialog"
            aria-modal="true"
            aria-label="Main navigation"
            className="fixed inset-0 z-[99] bg-void overflow-y-auto"
            initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
            animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
            exit={{ clipPath: "inset(100% 0% 0% 0%)" }}
            transition={{ duration: 0.85, ease: EASE }}
          >
            {/* preview plate */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <AnimatePresence mode="wait">
                {preview && (
                  <motion.div
                    key={hovered}
                    className="absolute inset-0"
                    initial={{ opacity: 0, scale: 1.1, filter: "blur(18px)" }}
                    animate={{ opacity: 0.34, scale: 1, filter: "blur(2px)" }}
                    exit={{ opacity: 0, scale: 1.04, filter: "blur(18px)" }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <SafeImage image={preview} kind="still" intensity={0.55} sizes="100vw" />
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-r from-void via-void/60 to-transparent" />
            </div>

            <nav
              className="relative flex min-h-full flex-col justify-between overflow-y-auto edge-x pt-20 pb-6 sm:pt-24 sm:pb-8"
              onPointerLeave={() => setHovered(null)}
            >
              <ul className="space-y-0.5 sm:space-y-1">
                {navItems.map((item, i) => (
                  <li key={item.label} className="overflow-hidden">
                    <motion.div
                      initial={{ y: "110%" }}
                      animate={{ y: 0 }}
                      exit={{ y: "110%", transition: { duration: 0.4, delay: (5 - i) * 0.03 } }}
                      transition={{ duration: 0.9, ease: EASE, delay: 0.18 + i * 0.06 }}
                    >
                      <button
                        onClick={() => go(item.href, item.anchor)}
                        onPointerEnter={() => setHovered(item.label)}
                        onFocus={() => setHovered(item.label)}
                        data-cursor="VIEW"
                        className="group flex w-full items-baseline gap-3 py-0.5 text-left sm:gap-6 sm:py-1"
                      >
                        <span className="t-label w-6 shrink-0 text-[0.7rem] text-dust transition-colors group-hover:text-oxide sm:w-8 sm:text-[0.78rem]">
                          {item.index}
                        </span>
                        <span
                          className="t-display t-hang text-[clamp(1.85rem,6.6vh,4.8rem)] leading-[0.92] text-bone transition-[color,transform,-webkit-text-stroke] duration-500 group-hover:translate-x-3 motion-reduce:group-hover:translate-x-0"
                          style={{
                            WebkitTextStroke:
                              hovered && hovered !== item.label
                                ? "1px rgba(237,232,224,0.42)"
                                : undefined,
                            color:
                              hovered && hovered !== item.label ? "transparent" : undefined,
                          }}
                        >
                          {item.label}
                        </span>
                      </button>
                    </motion.div>
                  </li>
                ))}
              </ul>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.55, duration: 0.6 }}
                className="mt-6 flex flex-wrap items-end justify-between gap-6 border-t border-bone/10 pt-4 sm:mt-8 sm:pt-6"
              >
                <div className="t-meta leading-relaxed">
                  <p>{artist.name}</p>
                  <p lang="hi" className="font-deva text-paper/70">{artist.nameDevanagari}</p>
                  <div className="mt-2">
                    <a
                      href="https://www.instagram.com/har3hhhhh/"
                      target="_blank"
                      rel="noopener noreferrer"
                      data-cursor="@HARSH"
                      className="t-label inline-flex items-center gap-1.5 text-paper/90 transition-colors hover:text-oxide"
                      aria-label="Made by Harsh on Instagram"
                    >
                      <span>MADE BY @ HARSH</span>
                      <span className="text-oxide">↗</span>
                    </a>
                  </div>
                </div>
                <ul className="flex flex-wrap gap-x-6 gap-y-2">
                  {artist.socialLinks.map((s) => (
                    <li key={s.label}>
                      {s.href ? (
                        <a
                          href={s.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          data-cursor="OPEN"
                          className="t-label text-paper transition-colors hover:text-oxide"
                        >
                          {s.label}
                        </a>
                      ) : (
                        <span className="t-label text-dust">
                          {s.label}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
