"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type CurtainRevealProps = {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  /** Extra classes for the img itself (e.g. hover zoom). */
  imageClassName?: string;
  /** Seconds of delay so grids can stagger. */
  delay?: number;
  priority?: boolean;
};

/**
 * CurtainReveal — smooth, reliable image display.
 * Uses safe opacity transition instead of aggressive inset clipPath wipes
 * so images can NEVER get stuck in a clipped/black state on SSR, hydration,
 * or mobile viewports.
 */
export function CurtainReveal({
  src,
  alt,
  sizes,
  className,
  imageClassName,
  delay = 0,
  priority = false,
}: CurtainRevealProps) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={cn("relative size-full overflow-hidden", className)}
      initial={priority || reduced ? false : { opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.05 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="relative size-full">
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className={cn("object-cover", imageClassName)}
        />
      </div>
    </motion.div>
  );
}
