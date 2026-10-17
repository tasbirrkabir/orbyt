"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

type MarqueeProps = {
  /** Content of ONE half: it is rendered exactly twice for the seamless loop. */
  children: ReactNode;
  /** Duration of one full loop, in seconds. */
  duration?: number;
  className?: string;
  /** Scroll the track the opposite way. */
  reverse?: boolean;
  /** Pause the loop while the pointer hovers the strip. */
  pauseOnHover?: boolean;
  /** Skew the strip with scroll velocity — the band leans as you scroll. */
  reactive?: boolean;
};

/**
 * Accessible CSS marquee.
 * - Wrapper clips overflow (min-w-0 / max-w-full / overflow-hidden) so the
 *   w-max track can never leak horizontal scroll at 375px.
 * - Track duplicates the content exactly twice; the keyframe translates
 *   -50% (one half), so the loop is seamless. The duplicate is aria-hidden.
 * - Optional reverse direction and hover pause.
 * - `reactive`: a spring-smoothed scroll velocity drives a skewX on an
 *   outer layer (transform isolation — the CSS translate animation owns
 *   the track's own transform, so they never fight).
 * - Reduced motion: animation class is not applied (CSS guard also parks it).
 */
export function Marquee({
  children,
  duration = 30,
  className,
  reverse = false,
  pauseOnHover = false,
  reactive = false,
}: MarqueeProps) {
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smooth = useSpring(velocity, { damping: 60, stiffness: 380 });
  const skew = useTransform(smooth, [-2400, 0, 2400], [-6, 0, 6]);
  const live = reactive && !reduced;

  return (
    <div
      className={cn(
        "min-w-0 max-w-full overflow-hidden",
        pauseOnHover && "group",
        className
      )}
    >
      <motion.div style={live ? { skewX: skew } : undefined}>
        <div
          className={cn(
            "flex w-max min-w-0",
            !reduced && "animate-marquee",
            pauseOnHover && "group-hover:[animation-play-state:paused]"
          )}
          style={
            {
              "--marquee-duration": `${duration}s`,
              ...(reverse && !reduced ? { animationDirection: "reverse" } : {}),
            } as CSSProperties
          }
        >
          <div className="flex shrink-0 items-center">{children}</div>
          <div className="flex shrink-0 items-center" aria-hidden="true">
            {children}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
