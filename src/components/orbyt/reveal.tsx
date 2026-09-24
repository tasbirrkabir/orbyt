"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Stagger delay in seconds. Keep subtle (≤ 0.2s). */
  delay?: number;
  /** Entrance y-offset in px. Small by design (16 to 24). */
  y?: number;
  /** Render as a list item when used inside <ol>/<ul>. */
  as?: "div" | "li";
};

const VIEWPORT = { once: true, margin: "0px 0px -80px 0px" } as const;

export function Reveal({
  children,
  className,
  delay = 0,
  y = 20,
  as = "div",
}: RevealProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    return as === "li" ? (
      <li className={className}>{children}</li>
    ) : (
      <div className={className}>{children}</div>
    );
  }

  const shared = {
    className,
    initial: { opacity: 0, y },
    whileInView: { opacity: 1, y: 0 },
    viewport: VIEWPORT,
    transition: { duration: 0.55, delay, ease: "easeOut" as const },
  };

  return as === "li" ? (
    <motion.li {...shared}>{children}</motion.li>
  ) : (
    <motion.div {...shared}>{children}</motion.div>
  );
}

/** Same reveal, tuned for above-the-fold entrances (slightly deeper offset). */
export function FadeUp({ y = 24, ...props }: RevealProps) {
  return <Reveal y={y} {...props} />;
}
