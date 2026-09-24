"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { PROCESS_STEPS } from "@/content/orbyt";

const RAIL = "absolute left-[4px] top-1 bottom-1 w-[2px]";

/**
 * The six process steps along a scroll-linked vertical rail: an orange
 * 2px progress line (scaleY, origin top) tracks reading position, and each
 * step's square dot lights up as the line passes it. Decorative layers are
 * aria-hidden; under reduced motion the rail is static and all dots lit.
 */
export function ProcessTimeline() {
  const ref = useRef<HTMLOListElement | null>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 80%", "end 55%"],
  });
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 28,
    mass: 0.4,
  });

  return (
    <ol ref={ref} aria-label="The six process steps" className="relative">
      <div aria-hidden="true" className={`${RAIL} bg-border`} />
      {!reduced ? (
        <motion.div
          aria-hidden="true"
          className={`${RAIL} origin-top bg-primary`}
          style={{ scaleY }}
        />
      ) : null}

      {PROCESS_STEPS.map((step, i) => (
        <li
          key={step.step}
          className="relative pb-14 pl-10 last:pb-0 md:pl-12"
        >
          <StepDot
            progress={scrollYProgress}
            index={i}
            total={PROCESS_STEPS.length}
            reduced={Boolean(reduced)}
          />
          <div className="flex items-baseline gap-4">
            <p className="font-mono text-xs tracking-[0.18em] text-primary">
              {step.step}
            </p>
            <h3 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
              {step.name}
            </h3>
          </div>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
            {step.what}
          </p>
          <div className="mt-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
              Output
            </p>
            <p className="mt-1.5 max-w-xl text-sm leading-relaxed">
              {step.output}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function StepDot({
  progress,
  index,
  total,
  reduced,
}: {
  progress: MotionValue<number>;
  index: number;
  total: number;
  reduced: boolean;
}) {
  const start = index / total;
  const end = (index + 0.75) / total;
  const opacity = useTransform(progress, [start, end], [0.2, 1]);
  const scale = useTransform(progress, [start, end], [0.7, 1]);

  return (
    <span
      aria-hidden="true"
      className="absolute left-0 top-[3px] flex size-[10px] items-center justify-center border border-border bg-background"
    >
      {reduced ? (
        <span className="size-1 bg-primary" />
      ) : (
        <motion.span className="size-1 bg-primary" style={{ opacity, scale }} />
      )}
    </span>
  );
}
