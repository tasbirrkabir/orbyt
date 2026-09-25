"use client";

import { cn } from "@/lib/utils";

/**
 * The six-stage ORBYT loop as a horizontal rail. The current stage
 * carries the ember tick; completed stages carry a check. The same
 * component everywhere a stage is shown, so "where are we" always
 * looks the same.
 */
const STAGES = ["DISCOVER", "DESIGN", "BUILD", "CONNECT", "MEASURE", "IMPROVE"] as const;

export function StageRail({
  current,
  className,
  compact = false,
}: {
  current: string;
  className?: string;
  compact?: boolean;
}) {
  const index = STAGES.indexOf(current as (typeof STAGES)[number]);

  return (
    <ol
      role="list"
      aria-label={`Project stage: ${current.toLowerCase()}`}
      className={cn("flex w-full min-w-0 items-stretch gap-0", className)}
    >
      {STAGES.map((stage, i) => {
        const done = index >= 0 && i < index;
        const active = i === index;
        return (
          <li key={stage} className="min-w-0 flex-1">
            <div
              aria-hidden="true"
              className={cn(
                "h-0.5 w-full",
                done || active ? "bg-primary" : "bg-border",
              )}
            />
            <p
              className={cn(
                "mt-1.5 truncate font-mono uppercase tracking-[0.14em]",
                compact ? "text-[8px]" : "text-[9px] sm:text-[10px]",
                active ? "text-primary" : done ? "text-foreground/70" : "text-muted-foreground/60",
              )}
            >
              {done ? "✓ " : ""}{stage}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
