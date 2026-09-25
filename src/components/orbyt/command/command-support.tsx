"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { COMMAND } from "@/content/command";

export function CommandSupport() {
  const reduced = useReducedMotion();
  const support = COMMAND.support;

  const channels = [
    { key: "request", href: support.channels.request.href },
    { key: "message", href: support.channels.message.href },
    { key: "contact", href: support.channels.contact.href },
  ] as const;

  return (
    <div>
      <motion.header
        initial={reduced ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="mb-10"
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">{support.eyebrow}</p>
        <h1 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">{support.title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{support.sub}</p>
      </motion.header>

      {/* The promise */}
      <section aria-label={support.promise.title} className="mb-10 border-l-2 border-primary bg-card/50 p-5 sm:p-6">
        <h2 className="font-display text-lg font-bold">{support.promise.title}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">{support.promise.body}</p>
      </section>

      {/* Channels, fastest first */}
      <section aria-label={support.channels.label} className="mb-10">
        <h2 className="mb-4 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          {support.channels.label}
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {channels.map((channel) => {
            const copy = support.channels[channel.key];
            return (
              <div key={channel.key} className="flex flex-col border border-border bg-card/50 p-5">
                <h3 className="font-display text-base font-bold">{copy.title}</h3>
                <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">{copy.desc}</p>
                <Button asChild size="sm" variant="outline" className="mt-4 self-start">
                  <Link href={channel.href}>{copy.cta}</Link>
                </Button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Emergency */}
      <section
        aria-label={support.emergency.title}
        className="mb-10 border border-destructive/40 bg-destructive/5 p-5 sm:p-6"
      >
        <h2 className="font-display text-lg font-bold">{support.emergency.title}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">{support.emergency.body}</p>
        <Button asChild size="sm" variant="outline" className="mt-4 border-destructive/50">
          <Link href="/workspace/requests">{support.emergency.cta}</Link>
        </Button>
      </section>

      {/* FAQ */}
      <section aria-label={support.faq.label}>
        <h2 className="mb-4 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          {support.faq.label}
        </h2>
        <Accordion type="single" collapsible className="border border-border bg-card/50">
          {support.faq.items.map((item, index) => (
            <AccordionItem key={item.q} value={`item-${index}`} className="border-border px-5 last:border-b-0">
              <AccordionTrigger className="text-left text-sm font-semibold hover:text-primary hover:no-underline">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </div>
  );
}
