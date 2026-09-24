import type { LegalDoc } from "@/content/legal";
import { Reveal } from "../reveal";

/**
 * Legal reading layout: narrow measure, plain sections, square-mark lists.
 * Copy comes verbatim from src/content/legal.ts.
 */
export function LegalView({ doc }: { doc: LegalDoc }) {
  return (
    <article
      aria-labelledby="legal-heading"
      className="mx-auto w-full max-w-2xl px-4 py-14 sm:px-6 md:py-20"
    >
      <Reveal>
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
          Updated {doc.updated}
        </p>
        <h1
          id="legal-heading"
          className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl"
        >
          {doc.title}
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          {doc.intro}
        </p>
      </Reveal>

      <div className="mt-12 border-t border-border">
        {doc.sections.map((section, i) => (
          <Reveal
            key={section.heading}
            delay={Math.min(i * 0.03, 0.12)}
            className="border-b border-border py-8 last:border-b-0"
          >
            <h2 className="font-display text-xl font-bold tracking-tight md:text-2xl">
              {section.heading}
            </h2>
            <div className="mt-4 space-y-4">
              {section.body.map((paragraph, j) => (
                <p
                  key={j}
                  className="text-base leading-7 text-foreground/85"
                >
                  {paragraph}
                </p>
              ))}
            </div>
            {section.list ? (
              <ul className="mt-4 space-y-3">
                {section.list.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span
                      aria-hidden="true"
                      className="mt-[9px] size-1.5 shrink-0 bg-primary"
                    />
                    <span className="min-w-0 text-base leading-7 text-foreground/85">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
          </Reveal>
        ))}
      </div>
    </article>
  );
}
