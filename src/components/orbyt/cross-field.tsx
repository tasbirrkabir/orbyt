"use client";

import { useReducedMotion } from "framer-motion";
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

/** Varied positions, durations and delays: structural, never rhythmic. */
const CROSSES = [
  { left: "6%", top: "16%", duration: 4.4, delay: 0 },
  { left: "38%", top: "9%", duration: 5.2, delay: 1.1 },
  { left: "82%", top: "22%", duration: 3.8, delay: 0.6 },
  { left: "14%", top: "72%", duration: 6.0, delay: 1.8 },
  { left: "58%", top: "84%", duration: 4.8, delay: 0.3 },
  { left: "90%", top: "62%", duration: 5.6, delay: 1.4 },
] as const;

/**
 * Blueprint cross marks (+) that slowly twinkle in the background of a
 * section. Purely structural texture: aria-hidden, pointer-events none,
 * and parked entirely under reduced motion.
 */
export function CrossField() {
  const reduced = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 select-none"
    >
      {CROSSES.map((cross) => (
        <span
          key={`${cross.left}-${cross.top}`}
          className={cn(
            "absolute font-mono text-lg leading-none text-foreground/20",
            !reduced && "animate-twinkle"
          )}
          style={
            {
              left: cross.left,
              top: cross.top,
              "--twinkle-duration": `${cross.duration}s`,
              animationDelay: `${cross.delay}s`,
            } as CSSProperties
          }
        >
          +
        </span>
      ))}
    </div>
  );
}
