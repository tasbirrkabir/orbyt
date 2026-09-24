"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";

/**
 * Orange reading-progress bar pinned to the very top of the sticky header.
 * scrollYProgress, spring-smoothed, scaleX from the left. Under reduced
 * motion it renders as a static hairline: no scroll-linked movement.
 */
export function ScrollProgress() {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 30,
    mass: 0.4,
  });

  if (reduced) {
    return (
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-0.5 bg-primary/70"
      />
    );
  }

  return (
    <motion.div
      aria-hidden="true"
      className="absolute inset-x-0 top-0 h-0.5 origin-left bg-primary"
      style={{ scaleX }}
    />
  );
}
