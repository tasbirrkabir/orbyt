"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Clock, MessageSquare, PenLine, ShieldCheck } from "lucide-react";
import { PORTAL } from "@/content/flows";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/orbyt/reveal";
import { CheckInForm } from "../check-in-form";
import { PortalPageHeader } from "../portal-page-header";

const COPY = PORTAL.support;

export function SupportView() {
  const reduced = useReducedMotion();

  return (
    <div>
      <PortalPageHeader eyebrow={COPY.eyebrow} title={COPY.title} sub={COPY.sub} />

      {/* The response promise: one card, stated once, held honestly. */}
      <Reveal className="mt-8">
        <section
          aria-label={COPY.promise.title}
          className="rounded-md border border-primary/30 bg-primary/5 p-5 sm:p-6"
        >
          <div className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className="mt-0.5 flex size-9 shrink-0 items-center justify-center border border-primary/50 text-primary"
            >
              <Clock className="size-4" />
            </span>
            <div className="min-w-0">
              <h2 className="font-display text-xl font-bold tracking-tight">
                {COPY.promise.title}
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                {COPY.promise.body}
              </p>
            </div>
          </div>
        </section>
      </Reveal>

      {/* The two channels, side by side. */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {[
          { icon: MessageSquare, ...COPY.channels.portal, href: "/workspace/messages" },
          { icon: PenLine, ...COPY.channels.contact, href: "/contact" },
        ].map((channel, index) => (
          <Reveal key={channel.href} delay={0.06 * index} y={14}>
            <section
              aria-label={channel.title}
              className="flex h-full flex-col border border-border bg-card p-5"
            >
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="flex size-8 shrink-0 items-center justify-center border border-border text-muted-foreground"
                >
                  <channel.icon className="size-4" />
                </span>
                <h3 className="font-display text-base font-bold tracking-tight">
                  {channel.title}
                </h3>
              </div>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                {channel.desc}
              </p>
              <Button asChild variant="outline" className="mt-4 h-10 w-full font-semibold sm:w-auto">
                <Link href={channel.href}>{channel.cta}</Link>
              </Button>
            </section>
          </Reveal>
        ))}
      </div>

      {/* The check-in request, structured so the desk can act on it. */}
      <Reveal className="mt-6">
        <CheckInForm />
      </Reveal>

      {/* Straight answers, no hedging. */}
      <Reveal className="mt-6">
        <section aria-label={COPY.faq.label} className="border border-border bg-card p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="flex size-8 shrink-0 items-center justify-center border border-border text-muted-foreground"
            >
              <ShieldCheck className="size-4" />
            </span>
            <h2 className="font-display text-xl font-bold tracking-tight">
              {COPY.faq.label}
            </h2>
          </div>

          <motion.div
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1, ease: "easeOut" }}
            className="mt-4"
          >
            <Accordion type="single" collapsible className="w-full">
              {COPY.faq.items.map((item, index) => (
                <AccordionItem key={item.q} value={`faq-${index}`}>
                  <AccordionTrigger className="text-left font-display text-base font-bold tracking-tight hover:text-primary hover:no-underline">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </section>
      </Reveal>
    </div>
  );
}
