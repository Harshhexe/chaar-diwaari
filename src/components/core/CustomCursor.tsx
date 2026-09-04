"use client";

import { useEffect, useRef, useState } from "react";
import { useIsDesktop, usePrefersReducedMotion } from "@/lib/hooks";

/**
 * CURSOR
 * ---------------------------------------------------------------------------
 * Desktop, fine-pointer only. A 6px dot that tracks 1:1, and a ring that lags
 * behind it. Any element carrying `data-cursor="PLAY|WATCH|VIEW|OPEN|DRAG|…"`
 * swaps the ring for a labelled disc — the label is read by delegation, so new
 * sections get cursor states for free without registering anything.
 *
 * Never mounted on touch or under reduced-motion: the OS cursor stays.
 */
export function CustomCursor() {
  const desktop = useIsDesktop();
  const reduced = usePrefersReducedMotion();
  const active = desktop && !reduced;

  const ringRef = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string>("####");
  const [isHovering, setIsHovering] = useState(false);
  const [down, setDown] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!active) return;
    document.documentElement.setAttribute("data-custom-cursor", "active");
    return () => document.documentElement.removeAttribute("data-custom-cursor");
  }, [active]);

  useEffect(() => {
    if (!active) return;

    const pos = { x: innerWidth / 2, y: innerHeight / 2 };
    const ring = { x: pos.x, y: pos.y };
    const visibleRef = { current: false };
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      if (!visibleRef.current) {
        visibleRef.current = true;
        setVisible(true);
      }
    };

    const onOver = (e: PointerEvent) => {
      const el = (e.target as HTMLElement)?.closest?.(
        "[data-cursor],a,button,input,select,textarea,[role='button']",
      ) as HTMLElement | null;
      if (!el || el === document.documentElement || el === document.body) {
        setLabel("####");
        setIsHovering(false);
        return;
      }
      setIsHovering(true);
      const explicit = el.getAttribute("data-cursor");
      if (explicit && explicit !== "custom") {
        setLabel(explicit);
      } else {
        setLabel("####");
      }
    };

    const onLeave = () => {
      visibleRef.current = false;
      setVisible(false);
    };
    const onDown = () => setDown(true);
    const onUp = () => setDown(false);

    const loop = () => {
      raf = requestAnimationFrame(loop);
      ring.x += (pos.x - ring.x) * 0.18;
      ring.y += (pos.y - ring.y) * 0.18;
      if (ringRef.current)
        ringRef.current.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0) translate(-50%, -50%)`;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.addEventListener("pointerleave", onLeave);
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, [active]);

  if (!active) return null;

  const isAction = label !== "####" && label.length > 0;
  const size = isAction ? 78 : isHovering ? 56 : 46;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[120]"
      style={{ opacity: visible ? 1 : 0, transition: "opacity .25s ease" }}
    >
      <div
        ref={ringRef}
        className="absolute left-0 top-0 grid place-items-center rounded-full will-change-transform"
        style={{
          width: size,
          height: size,
          border: "1px solid rgba(215, 48, 15, 0.7)",
          background: "rgba(5, 5, 5, 0.85)",
          backdropFilter: "blur(6px)",
          boxShadow: isHovering
            ? "0 0 20px rgba(215, 48, 15, 0.45), inset 0 0 12px rgba(215, 48, 15, 0.25)"
            : "0 0 12px rgba(215, 48, 15, 0.25)",
          transition:
            "width .35s cubic-bezier(.16,1,.3,1), height .35s cubic-bezier(.16,1,.3,1), box-shadow .3s ease, border-color .3s ease, scale .2s ease",
          scale: down ? "0.86" : "1",
        }}
      >
        <span
          className="select-none font-mono font-black"
          style={{
            color: "var(--color-oxide)",
            fontSize: isAction ? "0.62rem" : "0.72rem",
            letterSpacing: isAction ? "0.18em" : "0.26em",
            textShadow: "0 0 8px rgba(215, 48, 15, 0.85)",
            paddingLeft: isAction ? "0.18em" : "0.26em", // optical centering with tracking
          }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
