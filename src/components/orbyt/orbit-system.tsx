"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import type { CSSProperties } from "react";
import { AnimatedMark } from "./animated-mark";
import { cn } from "@/lib/utils";

type Node = { label: string; angle: number };
type Ring = {
  /** Diameter as % of container. */
  size: number;
  /** Seconds per revolution. */
  duration: number;
  reverse?: boolean;
  nodes: Node[];
};

const RINGS: Ring[] = [
  {
    size: 52,
    duration: 34,
    nodes: [
      { label: "WEB", angle: 0 },
      { label: "DATA", angle: 180 },
    ],
  },
  {
    size: 78,
    duration: 52,
    reverse: true,
    nodes: [
      { label: "ADS", angle: 90 },
      { label: "AI", angle: 270 },
    ],
  },
  {
    size: 104,
    duration: 74,
    nodes: [
      { label: "OPS", angle: 45 },
      { label: "GROWTH", angle: 225 },
    ],
  },
];

/**
 * OrbitSystem — the hero visual. The ORBYT mark sits at the center of
 * three counter-rotating dashed rings; service chips (WEB, ADS, DATA, AI,
 * OPS, GROWTH) ride the rings and counter-rotate so their labels stay
 * upright. The whole composition tilts a few degrees toward the pointer
 * and drifts on scroll (handled by the hero). Pure CSS transforms plus
 * framer springs; every animation collapses under reduced motion.
 */
export function OrbitSystem() {
  const reduced = useReducedMotion();

  // Pointer tilt: normalized -0.5..0.5, springs keep it oily smooth.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [7, -7]), {
    stiffness: 90,
    damping: 18,
  });
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-7, 7]), {
    stiffness: 90,
    damping: 18,
  });

  return (
    <div
      className="relative mx-auto aspect-square w-full max-w-md select-none lg:max-w-none"
      onPointerMove={
        reduced
          ? undefined
          : (e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              px.set((e.clientX - rect.left) / rect.width - 0.5);
              py.set((e.clientY - rect.top) / rect.height - 0.5);
            }
      }
      onPointerLeave={
        reduced
          ? undefined
          : () => {
              px.set(0);
              py.set(0);
            }
      }
    >
      {/* Ambient core glow */}
      <span
        aria-hidden="true"
        className="animate-pulse-glow absolute left-1/2 top-1/2 size-2/5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-3xl"
        style={{ "--pulse-duration": "6s" } as CSSProperties}
      />

      {/* HUD corner brackets */}
      {[
        "left-0 top-0 border-l-2 border-t-2",
        "right-0 top-0 border-r-2 border-t-2",
        "bottom-0 left-0 border-b-2 border-l-2",
        "bottom-0 right-0 border-b-2 border-r-2",
      ].map((cls) => (
        <span
          key={cls}
          aria-hidden="true"
          className={`absolute size-5 border-primary/40 ${cls}`}
        />
      ))}

      {/* HUD labels */}
      <span
        aria-hidden="true"
        className="absolute -top-7 left-0 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground"
      >
        ORBIT / SYS.01
      </span>
      <span
        aria-hidden="true"
        className="absolute -top-7 right-0 hidden font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground sm:block"
      >
        FIG.01 — THE ORBYT SYSTEM
      </span>

      {/* Tilting composition */}
      <motion.div
        className="size-full"
        style={
          reduced
            ? undefined
            : { rotateX, rotateY, transformPerspective: 900 }
        }
      >
        {/* Rings + nodes */}
        {RINGS.map((ring) => (
          <div
            key={ring.size}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ width: `${ring.size}%`, height: `${ring.size}%` }}
          >
            <div
              className="animate-spin-slow absolute inset-0 rounded-full border border-dashed border-primary/25"
              style={
                {
                  "--spin-duration": `${ring.duration}s`,
                  animationDirection: ring.reverse ? "reverse" : undefined,
                } as CSSProperties
              }
            >
              {ring.nodes.map((node) => (
                <RingNode
                  key={node.label}
                  label={node.label}
                  angle={node.angle}
                  duration={ring.duration}
                  reverse={ring.reverse}
                />
              ))}
            </div>
          </div>
        ))}

        {/* The mark, at the center of it all */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <span
            aria-hidden="true"
            className="animate-spin-slow absolute left-1/2 top-1/2 size-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-primary/40"
            style={{ "--spin-duration": "22s" } as CSSProperties}
          />
          <AnimatedMark size={72} satellites={2} halo />
        </div>
      </motion.div>

      {/* Rotating action badge */}
      <SpinBadge className="absolute -bottom-6 -right-2 sm:-right-4" />
    </div>
  );
}

/**
 * A service chip riding a ring. Positioned by angle on the circle; the
 * inner chip counter-rotates at the ring's own speed so the label stays
 * upright while it travels.
 */
function RingNode({
  label,
  angle,
  duration,
  reverse,
}: {
  label: string;
  angle: number;
  duration: number;
  reverse?: boolean;
}) {
  const rad = (angle * Math.PI) / 180;
  const left = 50 + 50 * Math.sin(rad);
  const top = 50 - 50 * Math.cos(rad);

  return (
    <span
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${left}%`, top: `${top}%` }}
    >
      <span
        className="animate-spin-slow flex items-center gap-1.5 border border-border bg-background/95 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-foreground/90 shadow-[0_0_18px_rgba(0,0,0,0.45)]"
        style={
          {
            "--spin-duration": `${duration}s`,
            // Counter-rotate against the parent ring so the label stays
            // upright: ring normal → chip reverse, ring reverse → chip normal.
            animationDirection: reverse ? "normal" : "reverse",
          } as CSSProperties
        }
      >
        <span aria-hidden="true" className="size-1 shrink-0 bg-primary" />
        {label}
      </span>
    </span>
  );
}

/**
 * SpinBadge — a small circular "START A PROJECT" seal whose text rotates
 * forever around an orange action core. Links to /contact.
 */
export function SpinBadge({ className }: { className?: string }) {
  return (
    <Link
      href="/contact"
      aria-label="Start a project"
      className={cn("group relative block size-24 sm:size-28", className)}
    >
      <svg
        viewBox="0 0 100 100"
        aria-hidden="true"
        className="animate-spin-slow size-full"
        style={{ "--spin-duration": "18s" } as CSSProperties}
      >
        <defs>
          <path
            id="orbit-badge-circle"
            d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0"
          />
        </defs>
        <text className="fill-foreground font-mono text-[8px] uppercase tracking-[0.18em]">
          <textPath
            href="#orbit-badge-circle"
            textLength="236"
            lengthAdjust="spacing"
          >
            Start a project · Orbyt · Start a project ·
          </textPath>
        </text>
      </svg>
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform duration-300 group-hover:scale-110 sm:size-11">
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </span>
      </span>
    </Link>
  );
}
