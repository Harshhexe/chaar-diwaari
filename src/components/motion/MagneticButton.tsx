"use client";

import { useRef, type ComponentPropsWithoutRef, type ElementType, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";
import { useIsDesktop, usePrefersReducedMotion } from "@/lib/hooks";
import { cx } from "@/lib/utils";

type Props<T extends ElementType> = {
  as?: T;
  children: ReactNode;
  strength?: number;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

/**
 * MAGNETIC — the control leans toward the cursor inside its own hit area and
 * springs back on exit. Small numbers only; anything over ~0.4 feels gimmicky.
 * Inert on touch and under reduced motion.
 */
export function MagneticButton<T extends ElementType = "button">({
  as,
  children,
  strength = 0.28,
  className,
  ...rest
}: Props<T>) {
  const ref = useRef<HTMLElement>(null);
  const desktop = useIsDesktop();
  const reduced = usePrefersReducedMotion();
  const live = desktop && !reduced;

  const onMove = (e: React.PointerEvent) => {
    if (!live || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    gsap.to(ref.current, {
      x: (e.clientX - (r.left + r.width / 2)) * strength,
      y: (e.clientY - (r.top + r.height / 2)) * strength,
      duration: 0.6,
      ease: "power3.out",
    });
  };

  const onLeave = () => {
    if (!live || !ref.current) return;
    gsap.to(ref.current, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1, 0.4)" });
  };

  const El = (as ?? "button") as ElementType;

    const isBlockOrFlex = className && /\b(flex|grid|block|inline-flex)\b/.test(className);
    return (
      <El
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className={cx(!isBlockOrFlex && "inline-block", "will-change-transform", className)}
        {...rest}
      >
        {children}
      </El>
    );
}
