import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SectionProps = {
  id: string;
  eyebrow?: string;
  title?: string;
  /** Rendered in text-primary on its own line under the title. */
  titleAccent?: string;
  lede?: string;
  /**
   * Custom heading block. Pass null to skip the default heading entirely
   * (e.g. Contact renders its own heading inside a split grid) and keep
   * the shared outer shell (scroll offset, rhythm, container).
   */
  header?: ReactNode;
  children: ReactNode;
  className?: string;
  containerClassName?: string;
};

/**
 * Shared section shell: anchor target + aria-labelledby + scroll offset,
 * consistent vertical rhythm (py-20 md:py-28) and max-width container.
 */
export function Section({
  id,
  eyebrow,
  title,
  titleAccent,
  lede,
  header,
  children,
  className,
  containerClassName,
}: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={cn("scroll-mt-20 py-20 md:py-28", className)}
    >
      <div
        className={cn(
          "mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8",
          containerClassName
        )}
      >
        {header === undefined ? (
          eyebrow || title ? (
            <div className="max-w-3xl">
              {eyebrow ? (
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
                  {eyebrow}
                </p>
              ) : null}
              {title ? (
                <h2
                  id={`${id}-heading`}
                  className="mt-4 font-display text-3xl font-bold leading-[1.05] tracking-tight sm:text-4xl md:text-5xl"
                >
                  {title}
                  {titleAccent ? (
                    <span className="block text-primary">{titleAccent}</span>
                  ) : null}
                </h2>
              ) : null}
              {lede ? (
                <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
                  {lede}
                </p>
              ) : null}
            </div>
          ) : null
        ) : (
          header
        )}
        {children}
      </div>
    </section>
  );
}
