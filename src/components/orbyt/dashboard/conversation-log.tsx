"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { motion, useReducedMotion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import { DASHBOARD } from "@/content/flows";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/orbyt/reveal";
import { cn } from "@/lib/utils";
import type { MeSubmission } from "./types";

const COPY = DASHBOARD.conversations;
const PREVIEW_CHARS = 140;

function ConversationRow({ submission, index }: { submission: MeSubmission; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = submission.message.length > PREVIEW_CHARS;
  const sentAt = new Date(submission.createdAt);

  return (
    <Reveal as="li" delay={0.06 * Math.min(index, 6)} y={16} className="relative flex gap-4 pb-6 last:pb-0">
      {/* Square node on the rail */}
      <span
        aria-hidden="true"
        className="relative z-10 mt-1 size-3 shrink-0 border-2 border-primary bg-background"
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <time
            dateTime={submission.createdAt}
            className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground"
          >
            {COPY.sent} {format(sentAt, "MMM d, yyyy · HH:mm")}
          </time>
          {submission.topic ? <Badge variant="outline">{submission.topic}</Badge> : null}
        </div>
        <p
          className={cn(
            "mt-2 text-sm leading-relaxed",
            !expanded && "line-clamp-2 text-muted-foreground"
          )}
        >
          {submission.message}
        </p>
        {isLong ? (
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            aria-expanded={expanded}
            className="mt-2 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-primary transition-colors hover:text-ember-tint"
          >
            {expanded ? (
              <Minus aria-hidden="true" className="size-3" />
            ) : (
              <Plus aria-hidden="true" className="size-3" />
            )}
            {expanded ? COPY.hide : COPY.show}
          </button>
        ) : null}
      </div>
    </Reveal>
  );
}

/**
 * Every brief the account has sent, as a timeline: the rail draws in,
 * entries stagger after it, long messages expand in place. Newest first.
 */
export function ConversationLog({ submissions }: { submissions: MeSubmission[] }) {
  const reduced = useReducedMotion();

  return (
    <section aria-label={COPY.title} className="border border-border bg-card p-5 sm:p-6">
      <Reveal>
        <h2 className="font-display text-2xl font-bold tracking-tight">{COPY.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{COPY.sub}</p>
      </Reveal>

      {submissions.length > 0 ? (
        <div
          className="mt-6 max-h-[460px] overflow-y-auto pr-1"
          role="list"
          aria-label={COPY.title}
        >
          <div className="relative">
            {/* Rail: muted track, ember line draws over it */}
            <span
              aria-hidden="true"
              className="absolute bottom-3 left-[5px] top-3 w-px bg-border"
            />
            {!reduced ? (
              <motion.span
                aria-hidden="true"
                className="absolute bottom-3 left-[5px] top-3 w-px origin-top bg-primary/70"
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true, margin: "0px 0px -120px 0px" }}
                transition={{ duration: 0.9, ease: "easeOut" }}
              />
            ) : null}
            <ul className="space-y-0">
              {submissions.map((submission, index) => (
                <ConversationRow key={submission.id} submission={submission} index={index} />
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <Reveal className="mt-6 border-t border-border pt-5">
          <p className="text-sm leading-relaxed text-muted-foreground">{COPY.empty}</p>
          <Button asChild className="mt-4 h-11 font-semibold">
            <Link href="/contact">{COPY.emptyCta}</Link>
          </Button>
        </Reveal>
      )}
    </section>
  );
}
