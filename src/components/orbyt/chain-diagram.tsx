"use client";

import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { CHAIN_NODES, SERVICES_SECTION } from "@/content/orbyt";
import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";

/**
 * The ORBYT chain: every step of the pipeline as a chip, joined by orange
 * arrows, ending in the single orange CONVERSION chip. Chips stagger in
 * while the arrows pulse in sequence, so the chain reads as a flow, not a
 * diagram. Used on the home services overview and at the close of /services.
 */
export function ChainDiagram() {
  const last = CHAIN_NODES.length - 1;
  const reduced = useReducedMotion();

  return (
    <Reveal>
      <div className="min-w-0 border border-border bg-card/50 p-6 md:p-8">
        <div className="flex flex-wrap items-center gap-y-3">
          {CHAIN_NODES.map((node, i) => (
            <motion.span
              key={node}
              className="flex items-center"
              initial={reduced ? false : { opacity: 0, y: 8 }}
              whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -40px 0px" }}
              transition={{ duration: 0.4, delay: i * 0.06, ease: "easeOut" }}
            >
              <span
                className={cn(
                  "border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em]",
                  i === last
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground/90 transition-colors duration-200 hover:border-primary/60"
                )}
              >
                {node}
              </span>
              {i < last ? (
                <motion.span
                  aria-hidden="true"
                  className="mx-2 flex"
                  animate={
                    reduced ? undefined : { opacity: [0.25, 1, 0.25] }
                  }
                  transition={
                    reduced
                      ? undefined
                      : {
                          duration: 1.6,
                          repeat: Infinity,
                          delay: i * 0.28,
                          ease: "easeInOut",
                        }
                  }
                >
                  <ArrowRight className="size-4 shrink-0 text-primary" />
                </motion.span>
              ) : null}
            </motion.span>
          ))}
        </div>
        <p className="mt-5 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
          {SERVICES_SECTION.chainCaption}
        </p>
      </div>
    </Reveal>
  );
}
