"use client";

import { useEffect, useState, type ReactNode } from "react";
import { DASHBOARD } from "@/content/flows";

/**
 * Live wall clock, Asia/Dhaka. Ticks every second; renders a placeholder
 * until mounted so server and client markup always match.
 */
function DhakaClock() {
  const [time, setTime] = useState("--:--:--");

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Dhaka",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    // One frame deferred: identical pixels, lint-clean effect.
    const raf = window.requestAnimationFrame(() => setTime(formatter.format(new Date())));
    const interval = window.setInterval(() => setTime(formatter.format(new Date())), 1000);

    return () => {
      window.cancelAnimationFrame(raf);
      window.clearInterval(interval);
    };
  }, []);

  return (
    <span className="tabular-nums">
      {DASHBOARD.console.zone} {time}
    </span>
  );
}

const CORNER = "pointer-events-none absolute font-mono text-sm leading-none text-primary/50 select-none";

/**
 * The workspace console: blueprint-textured plate with corner ticks and a
 * mono status bar (live system dot, session state, ticking Dhaka clock).
 * Everything inside the dashboard renders on this plate.
 */
export function ConsoleFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative border border-border bg-card/40 bg-blueprint">
      {/* Corner ticks: registration marks, not decoration */}
      <span aria-hidden="true" className={`${CORNER} -left-2 -top-3`}>+</span>
      <span aria-hidden="true" className={`${CORNER} -right-2 -top-3`}>+</span>
      <span aria-hidden="true" className={`${CORNER} -bottom-3 -left-2`}>+</span>
      <span aria-hidden="true" className={`${CORNER} -bottom-3 -right-2`}>+</span>

      {/* Status bar */}
      <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground sm:px-6">
        <span className="flex items-center gap-2">
          <span aria-hidden="true" className="size-1.5 animate-blink bg-primary" />
          {DASHBOARD.console.active}
        </span>
        <span className="flex items-center gap-4">
          <span className="hidden sm:inline">{DASHBOARD.console.verified}</span>
          <DhakaClock />
        </span>
      </div>

      <div className="p-4 sm:p-6 lg:p-10">{children}</div>
    </div>
  );
}
