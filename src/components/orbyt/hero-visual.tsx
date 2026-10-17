"use client";

import Image from "next/image";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import type { CSSProperties } from "react";
import { SpinBadge } from "./orbit-system";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * HeroVisual — the brand plates as a layered cinematic composition.
 * The beacon plate is the anchor: it wipes in like a curtain while the
 * photograph settles from a slow zoom. The momentum plate floats over it
 * on a spring, both layers drift at different depths toward the pointer,
 * and the rotating seal rides the top-right corner. Honest by design:
 * these are brand plates with practice labels, not invented case studies.
 * Reduced motion: a still composition that fades in once.
 */
export function HeroVisual() {
  const reduced = useReducedMotion();

  // Pointer depth: normalized -1..1 motion values, spring-smoothed, then
  // split so each layer travels at its own rate (parallax depth).
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 110, damping: 18, mass: 0.4 });
  const sy = useSpring(py, { stiffness: 110, damping: 18, mass: 0.4 });
  const mainX = useTransform(sx, [-1, 1], [-7, 7]);
  const mainY = useTransform(sy, [-1, 1], [-5, 5]);
  const floatX = useTransform(sx, [-1, 1], [13, -13]);
  const floatY = useTransform(sy, [-1, 1], [9, -9]);
  const sealX = useTransform(sx, [-1, 1], [-4, 4]);
  const sealY = useTransform(sy, [-1, 1], [-3, 3]);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    px.set(((e.clientX - rect.left) / rect.width) * 2 - 1);
    py.set(((e.clientY - rect.top) / rect.height) * 2 - 1);
  };
  const onLeave = () => {
    px.set(0);
    py.set(0);
  };

  return (
    <div
      className="relative mx-auto w-full max-w-[330px] sm:max-w-[380px]"
      onPointerMove={reduced ? undefined : onMove}
      onPointerLeave={reduced ? undefined : onLeave}
    >
      {/* HUD strip */}
      <motion.div
        initial={reduced ? false : { opacity: 0 }}
        animate={reduced ? undefined : { opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mb-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
      >
        <span className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="size-1.5 animate-blink bg-primary"
          />
          Signal — live
        </span>
      </motion.div>

      {/* Main plate: the beacon */}
      <motion.div
        style={reduced ? undefined : { x: mainX, y: mainY }}
        className="relative"
      >
        <motion.figure
          initial={reduced ? false : { clipPath: "inset(0 0 100% 0)" }}
          animate={reduced ? undefined : { clipPath: "inset(0 0 0% 0)" }}
          transition={{ duration: 1.05, delay: 0.3, ease: EASE }}
          className="group relative aspect-[4/5] overflow-hidden border border-border bg-card shadow-pixel-orange transition-colors duration-300 hover:border-primary/60"
        >
          {/* Ken Burns settle */}
          <motion.div
            className="absolute inset-0"
            initial={reduced ? false : { scale: 1.14 }}
            animate={reduced ? undefined : { scale: 1 }}
            transition={{ duration: 2.6, delay: 0.3, ease: EASE }}
          >
            <Image
              src="/images/brand/beacon.jpg"
              alt="A glowing orange monolith in a dark hall, a crowd gathered around its light — the work people gather around"
              fill
              priority
              sizes="(min-width: 1024px) 420px, 90vw"
              className="object-cover"
            />
          </motion.div>

          {/* Scrim for the caption */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/5 to-transparent"
          />

          {/* One-time sheen sweep after the wipe */}
          {reduced ? null : (
            <motion.div
              aria-hidden="true"
              initial={{ x: "-160%", skewX: -18 }}
              animate={{ x: "320%", skewX: -18 }}
              transition={{ duration: 1.1, delay: 1.5, ease: EASE }}
              className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-primary/25 to-transparent"
            />
          )}

          {/* Corner brackets */}
          <span
            aria-hidden="true"
            className="absolute left-2.5 top-2.5 size-4 border-l border-t border-primary/80"
          />
          <span
            aria-hidden="true"
            className="absolute right-2.5 top-2.5 size-4 border-r border-t border-primary/80"
          />

          <figcaption className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-3 p-4 pl-28 sm:pl-36">
            {/* Right-aligned so the floating plate never covers the words */}
            <span
              aria-hidden="true"
              className="mb-1 size-1.5 shrink-0 bg-primary transition-transform duration-300 group-hover:scale-[2.2]"
              style={{ transitionTimingFunction: "cubic-bezier(0.22,1,0.36,1)" }}
            />
            <span className="min-w-0 text-right">
              <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                Plate 01 — The beacon
              </span>
              <span className="mt-1 block text-sm font-medium text-foreground/90">
                Build the thing people gather around.
              </span>
            </span>
          </figcaption>
        </motion.figure>

        {/* Floating plate: momentum */}
        <motion.div
          style={reduced ? undefined : { x: floatX, y: floatY }}
          className="absolute -bottom-10 -left-6 z-20 w-28 sm:-left-10 sm:w-36"
        >
          <motion.figure
            initial={reduced ? false : { opacity: 0, y: 28, rotate: -9 }}
            animate={reduced ? undefined : { opacity: 1, y: 0, rotate: -4 }}
            transition={{ type: "spring", stiffness: 120, damping: 15, delay: 0.85 }}
            className="relative aspect-[3/4] overflow-hidden border border-border bg-card shadow-pixel-orange"
          >
            {/* CSS float lives on its own layer so framer's entrance
                transform and the keyframe transform never fight. */}
            <div
              className="animate-float absolute inset-x-0 -inset-y-[5%]"
              style={{ "--float-duration": "9s" } as CSSProperties}
            >
              <Image
                src="/images/brand/ember.jpg"
                alt="A long-exposure streak of fire in a dark frame — momentum that keeps its heat"
                fill
                sizes="160px"
                className="object-cover"
              />
            </div>
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-background/85 via-transparent to-transparent"
            />
            <figcaption className="absolute bottom-2 left-2.5 right-2 font-mono text-[9px] uppercase tracking-[0.18em] text-primary">
              02 · Momentum
            </figcaption>
          </motion.figure>
        </motion.div>

        {/* Rotating seal */}
        <motion.div
          style={reduced ? undefined : { x: sealX, y: sealY }}
          className="absolute -top-9 right-1 z-30 sm:-right-6"
        >
          <SpinBadge className="size-20 sm:size-24" />
        </motion.div>
      </motion.div>

      {/* Closing mono line */}
      <motion.p
        initial={reduced ? false : { opacity: 0 }}
        animate={reduced ? undefined : { opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.15 }}
        className="mt-16 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
      >
        <span aria-hidden="true" className="h-px flex-1 bg-border" />
        One system — every channel in orbit
        <span aria-hidden="true" className="h-px flex-1 bg-border" />
      </motion.p>
    </div>
  );
}
