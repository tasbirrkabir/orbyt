import { cn } from "@/lib/utils";
import { STATUS_LABELS } from "@/lib/portal/domain";

/**
 * StatusBadge: the one way every status renders in the command center.
 * Status is never communicated by color alone: each state carries a
 * glyph (check, bang, cross, ring) plus the label. Restraint: ink
 * chips by default, ember only where attention is genuinely needed.
 */
const TONE_CLASSES: Record<string, { chip: string; glyph: string; dot: string }> = {
  // Positive / running
  DONE: { chip: "bg-primary/10 text-foreground border-primary/30", glyph: "✓", dot: "bg-primary" },
  HEALTHY: { chip: "bg-primary/10 text-foreground border-primary/30", glyph: "✓", dot: "bg-primary" },
  ACTIVE: { chip: "bg-primary/10 text-foreground border-primary/30", glyph: "●", dot: "bg-primary" },
  APPROVED: { chip: "bg-primary/10 text-foreground border-primary/30", glyph: "✓", dot: "bg-primary" },
  DELIVERED: { chip: "bg-primary/10 text-foreground border-primary/30", glyph: "✓", dot: "bg-primary" },
  PAID: { chip: "bg-primary/10 text-foreground border-primary/30", glyph: "✓", dot: "bg-primary" },
  COMPLETED: { chip: "bg-primary/10 text-foreground border-primary/30", glyph: "✓", dot: "bg-primary" },
  FINAL: { chip: "bg-primary/10 text-foreground border-primary/30", glyph: "✓", dot: "bg-primary" },

  // Neutral / waiting
  UPCOMING: { chip: "bg-muted text-muted-foreground border-border", glyph: "○", dot: "bg-muted-foreground" },
  PENDING: { chip: "bg-muted text-muted-foreground border-border", glyph: "○", dot: "bg-muted-foreground" },
  PLANNING: { chip: "bg-muted text-muted-foreground border-border", glyph: "○", dot: "bg-muted-foreground" },
  DRAFT: { chip: "bg-muted text-muted-foreground border-border", glyph: "○", dot: "bg-muted-foreground" },
  SUBMITTED: { chip: "bg-muted text-muted-foreground border-border", glyph: "○", dot: "bg-muted-foreground" },
  SHARED: { chip: "bg-muted text-muted-foreground border-border", glyph: "○", dot: "bg-muted-foreground" },
  MONITORING: { chip: "bg-muted text-muted-foreground border-border", glyph: "○", dot: "bg-muted-foreground" },
  NOT_CONNECTED: { chip: "bg-muted text-muted-foreground border-border", glyph: "○", dot: "bg-muted-foreground" },
  REVIEWING: { chip: "bg-muted text-muted-foreground border-border", glyph: "○", dot: "bg-muted-foreground" },
  PAUSED: { chip: "bg-muted text-muted-foreground border-border", glyph: "‖", dot: "bg-muted-foreground" },

  // In motion
  IN_PROGRESS: { chip: "bg-foreground/[0.06] text-foreground border-border", glyph: "●", dot: "bg-foreground/60" },
  "IN PREP": { chip: "bg-foreground/[0.06] text-foreground border-border", glyph: "●", dot: "bg-foreground/60" },
  BUILD: { chip: "bg-foreground/[0.06] text-foreground border-border", glyph: "●", dot: "bg-foreground/60" },
  DISCOVER: { chip: "bg-foreground/[0.06] text-foreground border-border", glyph: "●", dot: "bg-foreground/60" },
  DESIGN: { chip: "bg-foreground/[0.06] text-foreground border-border", glyph: "●", dot: "bg-foreground/60" },
  CONNECT: { chip: "bg-foreground/[0.06] text-foreground border-border", glyph: "●", dot: "bg-foreground/60" },
  MEASURE: { chip: "bg-foreground/[0.06] text-foreground border-border", glyph: "●", dot: "bg-foreground/60" },
  IMPROVE: { chip: "bg-foreground/[0.06] text-foreground border-border", glyph: "●", dot: "bg-foreground/60" },
  IN_REVIEW: { chip: "bg-foreground/[0.06] text-foreground border-border", glyph: "●", dot: "bg-foreground/60" },
  PLANNED: { chip: "bg-foreground/[0.06] text-foreground border-border", glyph: "●", dot: "bg-foreground/60" },

  // Attention
  WAITING_FOR_CLIENT: { chip: "bg-primary text-[#1B1B1A] border-primary", glyph: "!", dot: "bg-primary" },
  BLOCKED: { chip: "bg-destructive/15 text-foreground border-destructive/40", glyph: "×", dot: "bg-destructive" },
  OVERDUE: { chip: "bg-destructive/15 text-foreground border-destructive/40", glyph: "!", dot: "bg-destructive" },
  ISSUE: { chip: "bg-destructive/15 text-foreground border-destructive/40", glyph: "×", dot: "bg-destructive" },
  OFFLINE: { chip: "bg-destructive/15 text-foreground border-destructive/40", glyph: "×", dot: "bg-destructive" },
  FAILED: { chip: "bg-destructive/15 text-foreground border-destructive/40", glyph: "×", dot: "bg-destructive" },
  CHANGES_REQUESTED: { chip: "bg-foreground/[0.06] text-foreground border-border", glyph: "!", dot: "bg-muted-foreground" },
  URGENT: { chip: "bg-primary text-[#1B1B1A] border-primary", glyph: "!", dot: "bg-primary" },
  WARNING: { chip: "bg-primary/15 text-foreground border-primary/40", glyph: "!", dot: "bg-primary" },

  // Project operations
  PROPOSED: { chip: "bg-primary text-[#1B1B1A] border-primary", glyph: "!", dot: "bg-primary" },
  ACCEPTED: { chip: "bg-primary/10 text-foreground border-primary/30", glyph: "✓", dot: "bg-primary" },
  DECLINED: { chip: "bg-foreground/[0.06] text-foreground border-border", glyph: "×", dot: "bg-muted-foreground" },
  WITHDRAWN: { chip: "bg-muted text-muted-foreground border-border", glyph: "‖", dot: "bg-muted-foreground" },
  ON_TRACK: { chip: "bg-primary/10 text-foreground border-primary/30", glyph: "✓", dot: "bg-primary" },
  AT_RISK: { chip: "bg-primary/15 text-foreground border-primary/40", glyph: "!", dot: "bg-primary" },
  OFF_TRACK: { chip: "bg-destructive/15 text-foreground border-destructive/40", glyph: "×", dot: "bg-destructive" },
  ON_HOLD: { chip: "bg-muted text-muted-foreground border-border", glyph: "‖", dot: "bg-muted-foreground" },
  EXCLUSION: { chip: "bg-muted text-muted-foreground border-border", glyph: "‖", dot: "bg-muted-foreground" },
};

const FALLBACK = { chip: "bg-muted text-muted-foreground border-border", glyph: "○", dot: "bg-muted-foreground" };

export function StatusBadge({
  status,
  className,
  glyph = true,
}: {
  status: string;
  className?: string;
  glyph?: boolean;
}) {
  const tone = TONE_CLASSES[status] ?? FALLBACK;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em]",
        tone.chip,
        className,
      )}
    >
      {glyph ? (
        <span aria-hidden="true" className="leading-none">
          {tone.glyph}
        </span>
      ) : null}
      <span>{STATUS_LABELS[status] ?? status}</span>
    </span>
  );
}

/** The bare status dot for tight rows (pulse lines, tables). */
export function StatusDot({ status, className }: { status: string; className?: string }) {
  const tone = TONE_CLASSES[status] ?? FALLBACK;
  return (
    <span
      aria-hidden="true"
      className={cn("inline-block size-1.5 shrink-0 rounded-full", tone.dot, className)}
    />
  );
}

export function statusGlyph(status: string): string {
  return (TONE_CLASSES[status] ?? FALLBACK).glyph;
}
