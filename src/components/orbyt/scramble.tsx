"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

const GLYPHS = "#$%&@*+=<>{}";

type ScrambleProps = {
  text: string;
  className?: string;
  /** Milliseconds per decode frame. */
  speed?: number;
};

/**
 * Decode effect for mono labels: characters resolve out of glyph noise
 * into the real text once the element scrolls into view. Runs exactly
 * once, never under reduced motion (the plain text renders immediately).
 * Screen readers always get the real string.
 */
export function Scramble({ text, className, speed = 28 }: ScrambleProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -40px 0px" });
  const [output, setOutput] = useState("");
  const frame = useRef(0);

  useEffect(() => {
    if (reduced || !inView) return;

    const interval = setInterval(() => {
      frame.current += 1;
      const revealed = Math.floor(frame.current / 2);
      if (revealed >= text.length + 2) {
        setOutput(text);
        clearInterval(interval);
        return;
      }
      let next = "";
      for (let i = 0; i < text.length; i += 1) {
        const ch = text[i];
        if (ch === " " || i < revealed) {
          next += ch;
        } else {
          next += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
      }
      setOutput(next);
    }, speed);

    return () => clearInterval(interval);
  }, [inView, reduced, text, speed]);

  const display = reduced ? text : output;

  return (
    <span ref={ref} className={cn("inline-block", className)}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">{display}</span>
    </span>
  );
}
