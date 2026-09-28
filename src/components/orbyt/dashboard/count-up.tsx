"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type CountUpProps = {
  value: number;
  suffix?: string;
  /** Seconds. Kept short so numbers land, not perform. */
  duration?: number;
  className?: string;
};

/**
 * Eased count-up for the dashboard stat tiles. Starts when scrolled into
 * view, runs once, and under reduced motion (or before any animation
 * frame fires) the final value renders directly.
 */
export function CountUp({ value, suffix, duration = 1.1, className }: CountUpProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -40px 0px" });
  const [display, setDisplay] = useState(() => (reduced ? value : 0));

  useEffect(() => {
    if (!inView || reduced) return;

    let raf = 0;
    const startedAt = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - startedAt) / (duration * 1000));
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(eased * value));
      if (t < 1) raf = window.requestAnimationFrame(tick);
    };

    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [inView, reduced, value, duration]);

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {display}
      {suffix ? (
        <span className="ml-0.5 align-baseline text-[0.55em] font-semibold text-primary">
          {suffix}
        </span>
      ) : null}
    </span>
  );
}
