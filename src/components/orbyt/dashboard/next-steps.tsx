"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import { DASHBOARD } from "@/content/flows";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/orbyt/reveal";
import { cn } from "@/lib/utils";
import type { MePayload } from "./types";

const COPY = DASHBOARD.steps;

type StepState = {
  done: boolean;
  label: string;
};

/**
 * Derived, never faked: each step reflects something that actually
 * happened in the account. The fit call stays queued; that one is a
 * human decision, not a checkbox we can tick for you.
 */
export function NextSteps({ data }: { data: MePayload }) {
  const reduced = useReducedMotion();
  const submissions = data.submissions ?? [];
  const challengeCount = (data.profile?.challenges ?? []).length;

  const steps: StepState[] = [
    {
      done: data.profile !== null,
      label: data.profile ? COPY.items.onboardDone : COPY.items.onboard,
    },
    {
      done: challengeCount > 0,
      label: challengeCount > 0 ? COPY.items.mapDone : COPY.items.map,
    },
    {
      done: submissions.length > 0,
      label: submissions.length > 0 ? COPY.items.briefDone : COPY.items.brief,
    },
    {
      done: false,
      label: COPY.items.call,
    },
  ];

  const actionableDone = steps.slice(0, 3).filter((step) => step.done).length;
  const ready = actionableDone === 3;
  const cta = ready ? COPY.ctaReady : COPY.cta;

  return (
    <section aria-label={COPY.title} className="border border-border bg-card p-5 sm:p-6">
      <Reveal>
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-display text-xl font-bold tracking-tight">{COPY.title}</h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            {actionableDone} / 3
          </span>
        </div>
        <p className="mt-1.5 text-sm text-muted-foreground">{COPY.sub}</p>
      </Reveal>

      {/* Progress rail */}
      <Reveal delay={0.06}>
        <div className="mt-4 h-1 w-full overflow-hidden bg-border">
          <motion.div
            className="h-full origin-left bg-primary"
            initial={reduced ? false : { scaleX: 0 }}
            whileInView={{ scaleX: actionableDone / 3 }}
            viewport={{ once: true, margin: "0px 0px -60px 0px" }}
            transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
          />
        </div>
      </Reveal>

      <ol className="mt-5 space-y-3.5">
        {steps.map((step, index) => (
          <Reveal as="li" key={step.label} delay={0.08 * index} y={12}>
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  "mt-0.5 flex size-4 shrink-0 items-center justify-center border",
                  step.done ? "border-primary bg-primary" : "border-border bg-transparent"
                )}
              >
                {step.done ? (
                  <motion.span
                    initial={reduced ? false : { scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true, margin: "0px 0px -40px 0px" }}
                    transition={{ type: "spring", stiffness: 500, damping: 22 }}
                    className="flex"
                  >
                    <Check aria-hidden="true" className="size-3 text-primary-foreground" />
                  </motion.span>
                ) : null}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <p
                    className={cn(
                      "text-sm leading-relaxed",
                      step.done ? "text-muted-foreground" : "text-foreground"
                    )}
                  >
                    {step.label}
                  </p>
                  <span
                    className={cn(
                      "font-mono text-[9px] uppercase tracking-[0.2em]",
                      step.done ? "text-primary" : "text-muted-foreground/70"
                    )}
                  >
                    {step.done ? COPY.doneLabel : COPY.queuedLabel}
                  </span>
                </div>
                {!step.done && index === 3 ? (
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                    {COPY.items.callNote}
                  </p>
                ) : null}
              </div>
            </div>
          </Reveal>
        ))}
      </ol>

      <Button asChild className="mt-6 h-11 w-full font-semibold">
        <Link href={cta.href}>{cta.label}</Link>
      </Button>
    </section>
  );
}
