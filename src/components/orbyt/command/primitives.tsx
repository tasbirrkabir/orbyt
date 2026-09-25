"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * PageHeader: every room opens with the same eyebrow + display title
 * + one honest sentence, and optional right-aligned actions. Same
 * rhythm on every page so the room is identifiable before reading.
 */
export function PageHeader({
  eyebrow,
  title,
  sub,
  actions,
  className,
}: {
  eyebrow: string;
  title: string;
  sub?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.header
      initial={reduced ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className={cn("mb-8 flex flex-wrap items-end justify-between gap-4 sm:mb-10", className)}
    >
      <div className="min-w-0 max-w-2xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">{eyebrow}</p>
        <h1 className="mt-2 font-display text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
          {title}
        </h1>
        {sub ? <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{sub}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </motion.header>
  );
}

/**
 * EmptyState: no blank white space anywhere in the portal. Every empty
 * room explains itself and offers the one action that makes sense.
 */
export function EmptyState({
  title,
  body,
  actionLabel,
  actionHref,
  onAction,
  className,
}: {
  title: string;
  body: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-start gap-3 border border-dashed border-border bg-muted/30 px-6 py-10 sm:items-center sm:text-center",
        className,
      )}
    >
      <span aria-hidden="true" className="font-mono text-lg text-primary/60">
        ◌
      </span>
      <div className="max-w-md">
        <p className="font-display text-base font-semibold">{title}</p>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{body}</p>
      </div>
      {actionLabel && actionHref ? (
        <Button asChild size="sm" variant="outline" className="mt-1">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      ) : null}
      {actionLabel && onAction ? (
        <Button size="sm" variant="outline" className="mt-1" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

/**
 * LoadingState: the honest skeleton. Block layout mirrors real content
 * so nothing jumps when data lands.
 */
export function LoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <div aria-busy="true" aria-label={label} className="space-y-4">
      <div className="h-4 w-40 animate-pulse bg-muted" />
      <div className="h-24 w-full animate-pulse bg-muted" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="h-40 w-full animate-pulse bg-muted" />
        <div className="h-40 w-full animate-pulse bg-muted" />
      </div>
    </div>
  );
}

/**
 * ErrorState: plain words plus one action. Technical detail logs
 * server-side and never reaches the client.
 */
export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="border border-dashed border-destructive/40 bg-destructive/5 px-6 py-10 text-center">
      <p className="font-display text-base font-semibold">We couldn&apos;t load this page.</p>
      <p className="mx-auto mt-1.5 max-w-md text-sm leading-relaxed text-muted-foreground">
        Give it a minute and try again. If it keeps failing, the support page has the fastest way to reach the desk.
      </p>
      <Button size="sm" variant="outline" className="mt-4" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}

/** Section: consistent grouping without card soup. */
export function Section({
  label,
  sub,
  action,
  children,
  className,
}: {
  label: string;
  sub?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("mt-10", className)} aria-label={label}>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            {label}
          </h2>
          {sub ? <p className="mt-1 text-sm text-muted-foreground">{sub}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}

/** ProgressBar: ink track, ember fill, labelled for screen readers. */
export function ProgressBar({
  value,
  label,
  className,
}: {
  value: number;
  label?: string;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? "Progress"}
      className={cn("h-1.5 w-full bg-muted", className)}
    >
      <div className="h-full bg-primary transition-[width] duration-700 ease-out" style={{ width: `${clamped}%` }} />
    </div>
  );
}
