import Image from "next/image";
import { FOOTER, NAV_LINKS } from "@/content/orbyt";

const FOOTER_LINKS = [...NAV_LINKS, { label: "Start a project", href: "#contact" }];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-background">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {/* Identity */}
          <div>
            <div className="flex items-center gap-2.5">
              <span className="block size-7 overflow-hidden rounded-sm">
                <Image
                  src="/orbyt-mark.png"
                  alt="ORBYT mark — black pixel runner on orange"
                  width={28}
                  height={28}
                  className="h-full w-full object-cover"
                />
              </span>
              <span className="font-display text-lg font-bold tracking-tight">
                ORBYT
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {FOOTER.philosophy}
            </p>
          </div>

          {/* Navigation */}
          <nav aria-label="Footer">
            <ul className="space-y-1">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="flex h-9 items-center font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Sign-off */}
          <div>
            <p className="font-mono text-xs tracking-[0.18em] text-muted-foreground">
              {FOOTER.tag}
            </p>
            <p className="mt-3 font-display text-lg font-bold text-primary">
              {FOOTER.onward}
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col justify-between gap-2 px-4 pt-6 pb-[max(env(safe-area-inset-bottom),1.5rem)] text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <p>{FOOTER.legal}</p>
          <p>Built as one system.</p>
        </div>
      </div>
    </footer>
  );
}
