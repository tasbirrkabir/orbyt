import { ArrowRight } from "lucide-react";
import { CHAIN_NODES, SERVICES_SECTION } from "@/content/orbyt";
import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";

/**
 * The ORBYT chain: every step of the pipeline as a chip, joined by orange
 * arrows, ending in the single orange CONVERSION chip. Used on the home
 * services overview and at the close of /services.
 */
export function ChainDiagram() {
  const last = CHAIN_NODES.length - 1;

  return (
    <Reveal>
      <div className="min-w-0 border border-border bg-card/50 p-6 md:p-8">
        <div className="flex flex-wrap items-center gap-y-3">
          {CHAIN_NODES.map((node, i) => (
            <span key={node} className="flex items-center">
              <span
                className={cn(
                  "border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em]",
                  i === last
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground/90"
                )}
              >
                {node}
              </span>
              {i < last ? (
                <ArrowRight
                  aria-hidden="true"
                  className="mx-2 size-4 shrink-0 text-primary"
                />
              ) : null}
            </span>
          ))}
        </div>
        <p className="mt-5 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
          {SERVICES_SECTION.chainCaption}
        </p>
      </div>
    </Reveal>
  );
}
