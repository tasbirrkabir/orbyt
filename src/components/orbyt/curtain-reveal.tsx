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
 * CurtainReveal — images arrive like a curtain lifting: a clip-path wipe
 * left-to-right on first scroll into view while the photo settles from a
 * slight zoom. Hover scale stays on the img itself, so the reveal (clip)
 * and interactions (transform) never fight over the same property.
 * Reduced motion: no wipe, image just fades in.
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
      initial={reduced ? { opacity: 0 } : { clipPath: "inset(0 100% 0 0)" }}
      whileInView={
        reduced ? { opacity: 1 } : { clipPath: "inset(0 0% 0 0)" }
      }
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="absolute inset-0"
        initial={reduced ? undefined : { scale: 1.16 }}
        whileInView={reduced ? undefined : { scale: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 1.3, delay, ease: [0.22, 1, 0.36, 1] }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className={cn("object-cover", imageClassName)}
        />
      </motion.div>
      {/* Edge seam: a 2px ember line that rides the wipe and fades out */}
      {!reduced && (
        <motion.span
          aria-hidden="true"
          className="absolute inset-y-0 left-0 w-0.5 bg-primary"
          initial={{ opacity: 1, x: 0 }}
          whileInView={{ opacity: 0, x: "100%" }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
        />
      )}
    </motion.div>
  );
}
