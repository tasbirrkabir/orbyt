import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Essay } from "@/content/insights";
import { Reveal } from "../reveal";

/**
 * Essay reading page. Focus-first typography: narrow measure, generous
 * leading, display headings, quotes on an orange left border.
 */
export function EssayView({ essay, nextEssay }: { essay: Essay; nextEssay: Essay }) {
  return (
    <article
      aria-labelledby="essay-heading"
      className="mx-auto w-full max-w-2xl px-4 py-14 sm:px-6 md:py-20"
    >
      <Reveal>
        <Link
          href="/insights"
          className="inline-flex h-11 items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Insights
        </Link>

        <p className="mt-10 font-mono text-xs uppercase tracking-[0.18em] text-primary">
          {essay.minutes} MIN READ
        </p>
        <h1
          id="essay-heading"
          className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl"
        >
          {essay.title}
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          {essay.dek}
        </p>

        {/* Cover render, clipped to the brand's pixel corner */}
        <div className="relative mt-10 aspect-[16/9] w-full overflow-hidden border border-border bg-card [clip-path:polygon(0_0,calc(100%-22px)_0,100%_22px,100%_100%,0_100%)]">
          <Image
            src={`/images/essays/${essay.slug}.jpg`}
            alt=""
            fill
            priority
            sizes="(min-width: 768px) 672px, 100vw"
            className="object-cover"
          />
        </div>
      </Reveal>

      <div className="mt-12 border-t border-border pt-10">
        {essay.blocks.map((block, i) => {
          switch (block.type) {
            case "h2":
              return (
                <h2
                  key={i}
                  className="mt-12 font-display text-2xl font-bold tracking-tight first:mt-0"
                >
                  {block.text}
                </h2>
              );
            case "quote":
              return (
                <blockquote
                  key={i}
                  className="mt-10 border-l-2 border-primary pl-6 font-display text-xl font-medium leading-relaxed md:text-2xl"
                >
                  {block.text}
                </blockquote>
              );
            case "list":
              return (
                <ul key={i} className="mt-6 space-y-3">
                  {block.items?.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span
                        aria-hidden="true"
                        className="mt-[10px] size-1.5 shrink-0 bg-primary"
                      />
                      <span className="min-w-0 text-base leading-7 text-foreground/90">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              );
            default:
              return (
                <p
                  key={i}
                  className="mt-6 text-lg leading-8 text-foreground/90 first:mt-0"
                >
                  {block.text}
                </p>
              );
          }
        })}
      </div>

      <div className="mt-16 border-t border-border pt-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Next essay
        </p>
        <Link
          href={`/insights/${nextEssay.slug}`}
          className="group mt-3 flex items-baseline justify-between gap-6"
        >
          <span className="min-w-0 font-display text-xl font-bold tracking-tight transition-colors group-hover:text-primary">
            {nextEssay.title}
          </span>
          <ArrowRight
            aria-hidden="true"
            className="size-5 shrink-0 translate-y-1 text-primary"
          />
        </Link>
      </div>
    </article>
  );
}
