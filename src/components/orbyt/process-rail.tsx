"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * The process rail: one hairline with an ember pulse traveling it,
 * left to right, forever. Hidden entirely for reduced motion.
 */
export function ProcessRail() {
  const reduced = useReducedMotion();
  return (
    <div
      aria-hidden="true"
      className="absolute -top-px left-0 hidden h-px w-full lg:block"
    >
      <div className="h-px w-full bg-border" />
      {reduced ? null : (
        <motion.span
          className="absolute -top-[2.5px] h-[5px] w-[5px] rounded-full bg-primary shadow-[0_0_12px_2px_rgba(253,90,1,0.55)]"
          animate={{ left: ["0%", "100%"], opacity: [0.4, 1, 1, 0.4] }}
          transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
        />
      )}
    </div>
  );
}
