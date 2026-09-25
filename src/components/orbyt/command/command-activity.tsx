"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { COMMAND } from "@/content/command";
import { formatAge } from "@/lib/portal/domain";
import type { ActivityPayload } from "@/lib/portal/types";
import { usePortalFetch } from "./use-portal-fetch";
import { EmptyState, ErrorState, LoadingState, PageHeader } from "./primitives";
import { cn } from "@/lib/utils";

const FILTER_KEYS = ["all", "PROJECT", "REQUEST", "APPROVAL", "SYSTEM", "FILE", "REPORT", "BILLING", "MEETING", "MESSAGE"] as const;
type FilterKey = (typeof FILTER_KEYS)[number];

export function CommandActivity() {
  const [filter, setFilter] = useState<FilterKey>("all");
  const endpoint = filter === "all" ? "/api/portal/activity" : `/api/portal/activity?type=${filter}`;
  const { data, loading, failed, retry } = usePortalFetch<ActivityPayload>(endpoint);
  const reduced = useReducedMotion();

  return (
    <div>
      <PageHeader
        eyebrow={COMMAND.activity.eyebrow}
        title={COMMAND.activity.title}
        sub={COMMAND.activity.sub}
      />

      <div className="mb-6 flex flex-wrap gap-1.5" role="tablist" aria-label={COMMAND.activity.title}>
        {FILTER_KEYS.map((key) => {
          const label =
            key === "all"
              ? COMMAND.activity.filters.all
              : COMMAND.activity.filters[key as keyof typeof COMMAND.activity.filters];
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={filter === key}
              onClick={() => setFilter(key)}
              className={cn(
                "border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors",
                filter === key
                  ? "border-primary/50 bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      {loading && !data ? (
        <LoadingState />
      ) : failed && !data ? (
        <ErrorState onRetry={retry} />
      ) : !data || data.events.length === 0 ? (
        <EmptyState title={COMMAND.activity.emptyTitle} body={COMMAND.activity.empty} />
      ) : (
        <ul role="list" className="border-t border-border">
          {data.events.map((event, index) => (
            <motion.li
              key={event.id}
              initial={reduced ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(index * 0.02, 0.25), ease: "easeOut" }}
              className="border-b border-border"
            >
              <div className="flex items-baseline gap-3 px-1 py-3">
                <span
                  aria-hidden="true"
                  className="w-4 shrink-0 text-center font-mono text-xs text-primary/70"
                >
                  {event.actorRole === "CLIENT" ? "›" : "·"}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-snug">
                    {event.link ? (
                      <Link href={event.link} className="underline-offset-4 hover:underline">
                        {event.title}
                      </Link>
                    ) : (
                      event.title
                    )}
                  </p>
                  <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
                    {event.actorName}
                    {event.targetLabel ? ` · ${event.targetLabel}` : ""}
                  </p>
                </div>
                <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                  {formatAge(event.createdAt)}
                </span>
              </div>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}
