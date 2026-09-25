import Link from "next/link";
import { FOOTER, NAV_LINKS } from "@/content/orbyt";
import { AnimatedMark } from "./animated-mark";
import { FooterAccountLinks } from "./account-links";

const linkClass =
  "flex h-11 items-center font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground transition-all hover:translate-x-0.5 hover:text-primary";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-background">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {/* Identity */}
          <div>
            <div className="flex items-center gap-2.5">
              <AnimatedMark size={24} satellites={1} />
              <span className="font-display text-lg font-bold tracking-tight">
                ORBYT
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {FOOTER.philosophy}
            </p>
            <p className="mt-4 font-display text-lg font-bold text-primary">
              {FOOTER.onward}
            </p>
          </div>

          {/* Site */}
          <nav aria-label="Footer">
            <ul>
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Account + legal */}
          <div>
            <nav aria-label="Account">
              <FooterAccountLinks itemClassName={linkClass} />
            </nav>
            <nav aria-label="Legal" className="mt-6">
              <ul>
                {FOOTER.legalLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className={linkClass}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </div>

      {/* Giant letter wall: the wordmark, architectural, playful on hover */}
      <div aria-hidden="true" className="select-none border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl items-baseline justify-between overflow-hidden px-4 pb-2 pt-8 sm:px-6 lg:px-8">
          {"ORBYT".split("").map((letter, i) => (
            <span
              key={`${letter}-${i}`}
              className="cursor-default font-display text-6xl font-bold leading-[0.9] tracking-tight text-foreground/[0.06] transition-all duration-300 hover:-translate-y-2 hover:text-primary/60 sm:text-7xl md:text-8xl"
            >
              {letter}
            </span>
          ))}
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 pt-6 pb-[max(env(safe-area-inset-bottom),1.5rem)] font-mono text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>{FOOTER.tag}</p>
          <p>{FOOTER.legal}</p>
        </div>
      </div>
    </footer>
  );
}
