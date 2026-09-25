"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const QUERY = "(pointer: fine) and (prefers-reduced-motion: no-preference)";

function subscribe(callback: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

/**
 * The orbiter: a small orange ring that trails the pointer and tightens
 * over interactive elements. The native cursor stays exactly where it is;
 * this is an accent, not a replacement. Renders on pointer:fine screens
 * only and never under reduced motion.
 */
export function Cursor() {
  const enabled = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );
  const [active, setActive] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [visible, setVisible] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const rx = useSpring(x, { stiffness: 520, damping: 42, mass: 0.6 });
  const ry = useSpring(y, { stiffness: 520, damping: 42, mass: 0.6 });

  useEffect(() => {
    if (!enabled) return;

    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
    };
    const over = (e: MouseEvent) => {
      const target = e.target as Element | null;
      setActive(
        Boolean(
          target?.closest(
            "a, button, [role='button'], input, textarea, select, label, summary, [data-cursor]"
          )
        )
      );
    };
    const down = () => setPressed(true);
    const up = () => setPressed(false);
    const leave = () => setVisible(false);

    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("mouseover", over, { passive: true });
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    document.documentElement.addEventListener("mouseleave", leave);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
      document.documentElement.removeEventListener("mouseleave", leave);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[95]"
      style={{ x: rx, y: ry, opacity: visible ? 1 : 0 }}
    >
      <motion.div
        className="-ml-4 -mt-4 size-8 rounded-full border border-primary/70"
        animate={{
          scale: pressed ? 0.6 : active ? 1.7 : 1,
          opacity: active ? 0.9 : 0.55,
        }}
        transition={{ type: "spring", stiffness: 320, damping: 22 }}
      />
    </motion.div>
  );
}
