"use client";

import { motion, useReducedMotion } from "framer-motion";

const LETTERS = "ORBYT".split("");
const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * The closing moment: ORBYT spelled across the footer as architecture.
 * Letters rise in one after another when the wall scrolls into view,
 * and each one lifts and warms under the cursor. Reduced motion gets
 * the wall instantly, no rise.
 */
export function FooterWordmark() {
  const reduced = useReducedMotion();

  return (
    <div aria-hidden="true" className="select-none border-t border-border">
      <div className="mx-auto flex w-full max-w-6xl items-baseline justify-between overflow-hidden px-4 pb-2 pt-8 sm:px-6 lg:px-8">
        {LETTERS.map((letter, i) => (
          <span
            key={`${letter}-${i}`}
            className="inline-block transition-transform duration-300 hover:-translate-y-2"
          >
            <motion.span
              className="block cursor-default font-display text-6xl font-bold leading-[0.9] tracking-tight text-foreground/[0.1] transition-colors duration-300 hover:text-primary/70 sm:text-7xl md:text-8xl"
              initial={reduced ? false : { y: 44, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: "0px 0px -40px 0px" }}
              transition={{ duration: 0.7, delay: i * 0.07, ease: EASE }}
            >
              {letter}
            </motion.span>
          </span>
        ))}
      </div>
    </div>
  );
}
