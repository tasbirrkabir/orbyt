"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  Bell,
  ReceiptText,
  Mail,
  FolderKanban,
  CheckCircle2,
  Circle,
} from "lucide-react";
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

/**
 * PortalPreview — an honest, animated miniature of the ORBYT client
 * panel (the real product behind the login). Labels mirror the actual
 * workspace rooms: project, invoices, contact. No fake brands, no
 * invented numbers beyond the demo data's own shapes.
 *
 * Motion: window springs in, rows stagger up, the progress bar and chart
 * bars grow once on view, status dots breathe. All of it collapses under
 * prefers-reduced-motion.
 */

const EASE = [0.22, 1, 0.36, 1] as const;

const NAV: { icon: typeof FolderKanban; label: string; active?: boolean }[] = [
  { icon: FolderKanban, label: "Project", active: true },
  { icon: ReceiptText, label: "Invoices" },
  { icon: Mail, label: "Contact" },
];

const CHART_BARS = [38, 52, 44, 66, 58, 80, 92] as const;

const MILESTONES = [
  { label: "Design approved", done: true },
  { label: "Staging deploy", done: true },
  { label: "Content load-in", done: false },
  { label: "Launch", done: false },
] as const;

const ACTIVITY = [
  { who: "Studio", what: "posted build update #14", when: "2h" },
  { who: "You", what: "approved the homepage motion", when: "1d" },
  { who: "Studio", what: "shipped staging build 0.9.3", when: "2d" },
] as const;

export function PortalPreview() {
  const reduced = useReducedMotion();

  const row = (delay: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 10 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true },
          transition: { duration: 0.5, delay, ease: EASE },
        };

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 20, scale: 0.97 }}
      animate={reduced ? undefined : { opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.25, ease: EASE }}
      className="relative"
    >
      {/* Window */}
      <div
        className={cn(
          "relative overflow-hidden rounded-lg border border-border bg-card shadow-pixel-orange",
          !reduced && "animate-float"
        )}
        style={{ "--float-duration": "9s" } as CSSProperties}
      >
        {/* Chrome */}
        <div className="flex items-center gap-2 border-b border-border bg-background/80 px-4 py-2.5">
          <span className="flex gap-1.5" aria-hidden="true">
            <span className="size-2 rounded-full bg-border" />
            <span className="size-2 rounded-full bg-border" />
            <span className="size-2 rounded-full bg-primary/70" />
          </span>
          <span className="ml-2 flex-1 truncate rounded border border-border bg-background px-2.5 py-1 font-mono text-[10px] tracking-wide text-muted-foreground">
            orbyt.app/workspace
          </span>
          <Bell
            aria-hidden="true"
            className="size-3.5 text-muted-foreground"
          />
        </div>

        <div className="grid grid-cols-[92px_1fr] sm:grid-cols-[120px_1fr]">
          {/* Sidebar */}
          <nav
            aria-label="Portal preview navigation"
            className="border-r border-border bg-background/60 p-2.5 sm:p-3"
          >
            <ul className="space-y-1">
              {NAV.map((item, i) => (
                <motion.li key={item.label} {...row(0.45 + i * 0.06)}>
                  <span
                    className={cn(
                      "flex items-center gap-2 rounded px-2 py-1.5 text-[11px] font-medium",
                      item.active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground"
                    )}
                  >
                    <item.icon
                      aria-hidden="true"
                      className="size-3.5 shrink-0"
                    />
                    <span className="hidden truncate sm:inline">
                      {item.label}
                    </span>
                  </span>
                </motion.li>
              ))}
            </ul>
          </nav>

          {/* Main panel */}
          <div className="min-w-0 p-3 sm:p-4">
            <motion.div {...row(0.4)} className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate font-display text-sm font-bold tracking-tight sm:text-base">
                  Storefront rebuild
                </p>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  BUILD · WEEK 6
                </p>
              </div>
              <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-primary">
                <span
                  aria-hidden="true"
                  className={cn(
                    "size-1.5 rounded-full bg-primary",
                    !reduced && "animate-pulse"
                  )}
                />
                On track
              </span>
            </motion.div>

            {/* Progress */}
            <motion.div {...row(0.5)} className="mt-3">
              <div className="flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                <span>Progress</span>
                <span className="text-primary">68%</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-border">
                <motion.div
                  className="h-full rounded-full bg-primary"
                  initial={reduced ? false : { width: "0%" }}
                  whileInView={reduced ? undefined : { width: "68%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.1, delay: 0.7, ease: EASE }}
                />
              </div>
            </motion.div>

            {/* Chart + milestones */}
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <motion.div {...row(0.6)}>
                <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
                  Ship velocity
                </p>
                <div className="mt-2 flex h-16 items-end gap-1.5">
                  {CHART_BARS.map((h, i) => (
                    <motion.span
                      key={i}
                      className="flex-1 rounded-sm bg-primary/80"
                      initial={reduced ? false : { height: 4, opacity: 0.4 }}
                      whileInView={
                        reduced ? undefined : { height: `${h}%`, opacity: 1 }
                      }
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.6,
                        delay: 0.8 + i * 0.07,
                        ease: EASE,
                      }}
                      style={{ height: reduced ? `${h}%` : undefined }}
                    />
                  ))}
                </div>
              </motion.div>

              <motion.div {...row(0.68)}>
                <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
                  Milestones
                </p>
                <ul className="mt-2 space-y-1.5">
                  {MILESTONES.map((m, i) => (
                    <motion.li
                      key={m.label}
                      className="flex items-center gap-2 text-[11px] leading-none"
                      initial={reduced ? false : { opacity: 0, x: 8 }}
                      whileInView={reduced ? undefined : { opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.4,
                        delay: 0.85 + i * 0.08,
                        ease: EASE,
                      }}
                    >
                      {m.done ? (
                        <CheckCircle2
                          aria-hidden="true"
                          className="size-3.5 shrink-0 text-primary"
                        />
                      ) : (
                        <Circle
                          aria-hidden="true"
                          className="size-3.5 shrink-0 text-muted-foreground/60"
                        />
                      )}
                      <span
                        className={cn(
                          "truncate",
                          m.done
                            ? "text-foreground/85"
                            : "text-muted-foreground"
                        )}
                      >
                        {m.label}
                      </span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </div>

            {/* Activity */}
            <motion.div {...row(0.78)} className="mt-4 border-t border-dashed border-border pt-3">
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
                Activity
              </p>
              <ul className="mt-2 space-y-1.5">
                {ACTIVITY.map((a, i) => (
                  <motion.li
                    key={i}
                    className="flex items-baseline gap-2 text-[11px]"
                    initial={reduced ? false : { opacity: 0, y: 6 }}
                    whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.4,
                      delay: 0.95 + i * 0.09,
                      ease: EASE,
                    }}
                  >
                    <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.1em] text-primary">
                      {a.who}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-muted-foreground">
                      {a.what}
                    </span>
                    <span className="shrink-0 font-mono text-[9px] text-muted-foreground/70">
                      {a.when}
                    </span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Floating chips */}
      <motion.div
        aria-hidden="true"
        className={cn(
          "absolute -right-3 top-20 flex items-center gap-1.5 rounded border border-border bg-background px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] shadow-pixel-orange",
          !reduced && "animate-float"
        )}
        style={{ "--float-duration": "6.5s" } as CSSProperties}
        initial={reduced ? false : { opacity: 0, y: -8 }}
        animate={reduced ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.05, ease: EASE }}
      >
        <CheckCircle2 className="size-3 text-primary" />
        2 approvals cleared
      </motion.div>

      <motion.div
        aria-hidden="true"
        className={cn(
          "absolute -bottom-4 left-6 flex items-center gap-1.5 rounded border border-border bg-background px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] shadow-pixel-orange",
          !reduced && "animate-float"
        )}
        style={{ "--float-duration": "7.5s" } as CSSProperties}
        initial={reduced ? false : { opacity: 0, y: 8 }}
        animate={reduced ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.2, ease: EASE }}
      >
        <ReceiptText className="size-3 text-primary" />
        Invoice due
      </motion.div>
    </motion.div>
  );
}
