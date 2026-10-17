import { MANIFESTO } from "@/content/orbyt";
import { Reveal } from "./reveal";
import { Section } from "./section";
import { SignalWave, StudioClock } from "./manifesto-live";

/* ── Orbyt · Field-notes wall ──────────────────────────────
   Six typographic poster cards — statements, a live studio
   clock, a ship log and a signal wave — pinned like a print
   wall. Dots ripple and an ember sweep runs on hover. */

const CARD =
  "group relative flex h-full flex-col overflow-hidden border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-pixel-orange";

/** Halftone dot footer; the pattern slides one cell on hover. */
function DotFooter({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={[
        "mt-6 h-10 bg-[radial-gradient(circle,rgba(253,90,1,0.42)_1.3px,transparent_1.4px)] [background-size:11px_11px] [background-position:0_0] transition-[background-position] duration-700 ease-out group-hover:[background-position:11px_0]",
        className,
      ].join(" ")}
    />
  );
}

function CardIndex({ n }: { n: number }) {
  return (
    <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">
      N-{String(n).padStart(2, "0")}
    </p>
  );
}

export function ManifestoWall() {
  return (
    <Section
      id="field-notes"
      eyebrow={MANIFESTO.eyebrow}
      title={MANIFESTO.title}
      lede={MANIFESTO.lede}
    >
      <div className="mt-14 columns-1 gap-4 sm:columns-2 lg:columns-3">
        {/* N-01 — statement */}
        <Reveal className="mb-4 break-inside-avoid">
          <article className={`${CARD} min-h-56`}>
            <CardIndex n={1} />
            <p className="mt-5 font-display text-2xl font-bold leading-snug tracking-tight">
              {MANIFESTO.notes.senior}
            </p>
            <DotFooter className="mt-auto" />
          </article>
        </Reveal>

        {/* N-02 — live studio clock */}
        <Reveal delay={0.05} className="mb-4 break-inside-avoid">
          <article className={`${CARD} min-h-48`}>
            <div className="flex items-center justify-between">
              <CardIndex n={2} />
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                {MANIFESTO.studioTime.label}
              </p>
            </div>
            <div className="mt-6 flex-1">
              <StudioClock />
            </div>
          </article>
        </Reveal>

        {/* N-03 — signal wave */}
        <Reveal delay={0.02} className="mb-4 break-inside-avoid">
          <article className={`${CARD} min-h-52`}>
            <div className="flex items-center justify-between">
              <CardIndex n={3} />
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                {MANIFESTO.waveCaption}
              </p>
            </div>
            <div className="relative mt-5 h-24 overflow-hidden border border-border/60 bg-[#0c0a09]">
              <SignalWave className="absolute inset-0 h-full w-full" />
            </div>
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
              {MANIFESTO.notes.wavelength}
            </p>
          </article>
        </Reveal>

        {/* N-04 — ship log */}
        <Reveal delay={0.07} className="mb-4 break-inside-avoid">
          <article className={`${CARD} min-h-48`}>
            <CardIndex n={4} />
            <div className="mt-6 flex-1 space-y-3.5 font-mono text-sm">
              {MANIFESTO.shipLog.rows.map((row) => (
                <p
                  key={row.name}
                  className="flex items-baseline gap-2 text-foreground/90"
                >
                  <span className="tracking-[0.12em]">{row.name}</span>
                  <span
                    aria-hidden="true"
                    className="flex-1 border-b border-dotted border-border/80"
                  />
                  <span className="text-primary">{row.status}</span>
                </p>
              ))}
              <p className="flex items-center gap-2 pt-1 text-xs text-muted-foreground">
                <span aria-hidden="true" className="inline-block h-3.5 w-2 animate-blink bg-primary" />
                EVERY SYSTEM ABOVE RAN THIS WEEK
              </p>
            </div>
          </article>
        </Reveal>

        {/* N-05 — statement */}
        <Reveal delay={0.04} className="mb-4 break-inside-avoid">
          <article className={`${CARD} min-h-52`}>
            <CardIndex n={5} />
            <p className="mt-5 font-display text-xl font-bold leading-snug tracking-tight md:text-2xl">
              {MANIFESTO.notes.craft}
            </p>
            <DotFooter className="mt-auto" />
          </article>
        </Reveal>

        {/* N-06 — the zero */}
        <Reveal delay={0.09} className="mb-4 break-inside-avoid">
          <article className={`${CARD} min-h-56`}>
            <CardIndex n={6} />
            <p
              aria-hidden="true"
              className="mt-2 font-display text-8xl font-bold leading-none text-primary"
            >
              0
            </p>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              {MANIFESTO.notes.zero}
            </p>
          </article>
        </Reveal>
      </div>
    </Section>
  );
}
