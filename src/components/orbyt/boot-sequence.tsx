"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import { BOOT } from "@/content/orbyt";

const SESSION_KEY = "orbyt-booted";

/**
 * Boot sequence: a once-per-session brand boot on the homepage. Ink plate,
 * the wordmark assembling letter by letter, mono boot lines, an orange
 * progress line, then the curtain lifts. Click anywhere to skip. Never
 * shown twice in one session and never shown under reduced motion.
 */
export function BootSequence() {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<"idle" | "boot" | "exit">("idle");

  useEffect(() => {
    if (reduced) return;
    let seen = false;
    try {
      seen = window.sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      seen = false;
    }
    if (seen) return;

    // Start one frame after hydration: visually identical, and it keeps
    // the effect free of synchronous setState.
    const raf = window.requestAnimationFrame(() => setPhase("boot"));
    document.documentElement.style.overflow = "hidden";
    const exitAt = window.setTimeout(() => setPhase("exit"), 2100);
    return () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(exitAt);
      document.documentElement.style.overflow = "";
    };
  }, [reduced]);

  useEffect(() => {
    if (phase !== "exit") return;
    const doneAt = window.setTimeout(() => {
      setPhase("idle");
      document.documentElement.style.overflow = "";
      try {
        window.sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        /* private mode: the boot simply replays next visit */
      }
    }, 650);
    return () => window.clearTimeout(doneAt);
  }, [phase]);

  const skip = useCallback(() => {
    setPhase((p) => (p === "boot" ? "exit" : p));
  }, []);

  if (reduced) return null;

  return (
    <AnimatePresence>
      {phase !== "idle" ? (
        <motion.div
          key="boot"
          role="presentation"
          onClick={skip}
          className="fixed inset-0 z-[100] flex cursor-pointer flex-col items-center justify-center bg-background"
          initial={{ y: 0 }}
          exit={{
            y: "-100%",
            transition: { duration: 0.6, ease: [0.76, 0, 0.24, 1] },
          }}
        >
          {/* Wordmark assembles */}
          <div className="flex items-end overflow-hidden">
            {"ORBYT".split("").map((ch, i) => (
              <motion.span
                key={`${ch}-${i}`}
                className="font-display text-5xl font-bold tracking-tight sm:text-6xl"
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: 0.1 + i * 0.07,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                {ch}
              </motion.span>
            ))}
            <motion.span
              aria-hidden="true"
              className="mb-1.5 ml-2 inline-block size-3 bg-primary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
              style={{ animation: "blink 1.2s steps(2, start) infinite" }}
            />
          </div>

          {/* Boot lines */}
          <div className="mt-7 space-y-1.5">
            {BOOT.lines.map((line, i) => (
              <motion.p
                key={line}
                className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground"
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.55 + i * 0.42, duration: 0.3 }}
              >
                <span className="text-primary">{">"}</span> {line}
              </motion.p>
            ))}
          </div>

          {/* Progress line */}
          <div className="mt-9 h-px w-44 overflow-hidden bg-border">
            <motion.div
              className="h-full origin-left bg-primary"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.85, delay: 0.2, ease: "easeInOut" }}
            />
          </div>

          <motion.p
            className="absolute bottom-8 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/60"
            animate={{ opacity: [0.3, 0.85, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {BOOT.skip}
          </motion.p>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
