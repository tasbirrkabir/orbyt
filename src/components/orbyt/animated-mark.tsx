"use client";

import Image from "next/image";
import { useReducedMotion } from "framer-motion";
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

type AnimatedMarkProps = {
  /** Square render size of the mark, in px. */
  size?: number;
  /** 0: static. 1: one slow clockwise satellite. 2: pair with a smaller counter-orbiting companion. */
  satellites?: 0 | 1 | 2;
  /** Subtle radial halo behind the mark. The only sanctioned pulse-glow use. */
  halo?: boolean;
  className?: string;
};

const SATELLITE = "absolute left-1/2 top-1/2 bg-primary";

/**
 * The ORBYT logo animation system.
 *
 * The opaque orange mark is the planet. Satellite squares orbit it, and
 * because the image paints above them (z-10) they tuck behind the tile on
 * the far side of the pass, so the orbit reads as a real orbit instead of
 * an overlay slide. Counter-rotation is baked into the orbit keyframes,
 * which keeps the squares axis-aligned without an extra child.
 *
 * Everything is gated on prefers-reduced-motion: the static mark renders,
 * satellites are dropped (they would overlap the tile without motion) and
 * the halo, if any, loses its pulse.
 */
export function AnimatedMark({
  size = 64,
  satellites = 0,
  halo = false,
  className,
}: AnimatedMarkProps) {
  const reduced = useReducedMotion();
  const showSatellites = !reduced && satellites > 0;

  return (
    <span
      className={cn("relative inline-block", className)}
      style={{ width: size, height: size }}
    >
      {halo ? (
        <span
          aria-hidden="true"
          className={cn(
            "absolute -inset-8 rounded-full bg-primary/15 blur-2xl",
            !reduced && "animate-pulse-glow"
          )}
          style={{ "--pulse-duration": "6s" } as CSSProperties}
        />
      ) : null}

      {showSatellites ? (
        <span
          aria-hidden="true"
          className={cn(SATELLITE, "size-2 animate-orbit")}
          style={
            {
              marginLeft: -4,
              marginTop: -4,
              "--orbit-radius": `${Math.round(size * (satellites === 1 ? 0.5 : 0.72))}px`,
              "--orbit-duration": satellites === 1 ? "14s" : "16s",
            } as CSSProperties
          }
        />
      ) : null}

      {showSatellites && satellites === 2 ? (
        <span
          aria-hidden="true"
          className={cn(SATELLITE, "size-1.5 animate-orbit-reverse")}
          style={
            {
              marginLeft: -3,
              marginTop: -3,
              "--orbit-radius": `${Math.round(size * 0.52)}px`,
              "--orbit-duration": "26s",
            } as CSSProperties
          }
        />
      ) : null}

      <span className="relative z-10 block h-full w-full overflow-hidden rounded-sm">
        <Image
          src="/orbyt-mark.png"
          alt=""
          width={256}
          height={256}
          sizes={`${size}px`}
          className="h-full w-full object-cover"
        />
      </span>
    </span>
  );
}
