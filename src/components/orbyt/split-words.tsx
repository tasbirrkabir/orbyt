"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

const containerVariants = (delay: number): Variants => ({
  hidden: {},
  show: {
    transition: { staggerChildren: 0.055, delayChildren: delay },
  },
});

const wordVariants: Variants = {
  hidden: { y: "112%" },
  show: { y: 0, transition: { duration: 0.6, ease: EASE } },
};

/**
 * SplitWords — word-by-word masked rise for display headings.
 *
 * Implementation note: the visibility trigger lives on the *container*
 * (which is fully visible), never on the masked word spans themselves.
 * A word span translated 112% down sits outside its own overflow-hidden
 * mask, and IntersectionObserver counts clipped-away elements as "not
 * intersecting" — so observing the words directly would never fire.
 * The container fires once and staggers the words via variants.
 *
 * Under reduced motion the plain string renders untouched. Renders inline
 * content so it can sit inside an existing h1/h2 without changing
 * semantics.
 */
export function SplitWords({
  text,
  className,
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  const words = text.split(" ");

  if (reduced) {
    return <span className={className}>{text}</span>;
  }

  return (
    <motion.span
      className={cn("inline", className)}
      aria-label={text}
      role="text"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      variants={containerVariants(delay)}
    >
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          aria-hidden="true"
          className="inline-block overflow-hidden pb-1 align-bottom"
        >
          <motion.span className="inline-block" variants={wordVariants}>
            {word}
            {i < words.length - 1 ? "\u00A0" : null}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}
