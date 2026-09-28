import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { AUTH } from "@/content/flows";
import { FOOTER, HERO } from "@/content/orbyt";
import { SiteShell } from "@/components/orbyt/site-shell";

function LogoTile() {
  return (
    <div className="shadow-pixel-orange">
      <div
        className="overflow-hidden rounded-md border border-border"
        style={{
          clipPath:
            "polygon(0 0, calc(100% - 22px) 0, 100% 22px, 100% 100%, 0 100%)",
        }}
      >
        <Image
          src="/orbyt-logo.png"
          alt="ORBYT logo: a black pixel runner on an orange tile"
          width={1189}
          height={1323}
          sizes="(min-width: 1024px) 320px, 60vw"
          className="h-auto w-full"
        />
      </div>
    </div>
  );
}

/**
 * Left brand rail: logo tile, the promise, the tag. Desktop only.
 * Copied from the /login page composition so /forgot-password and
 * /reset-password read as the same surface; the login page keeps its
 * own local copy.
 */
function BrandRail() {
  return (
    <aside className="relative hidden border-b border-border bg-blueprint lg:flex lg:flex-col lg:justify-between lg:gap-12 lg:border-b-0 lg:border-r lg:p-12">
      <Link
        href="/"
        className="inline-flex h-11 items-center self-start font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-primary"
      >
        {AUTH.shared.backHome}
      </Link>

      <div className="mx-auto w-full max-w-xs py-16">
        <LogoTile />
        <p className="mt-10 font-display text-2xl font-bold leading-snug tracking-tight">
          {HERO.titleA} {HERO.titleB}
        </p>
        <p className="mt-5 font-mono text-xs tracking-widest text-muted-foreground">
          {FOOTER.tag}
        </p>
      </div>

      <p
        aria-hidden="true"
        className="select-none font-mono text-lg leading-none text-foreground/15"
      >
        +
      </p>
    </aside>
  );
}

/**
 * Full-page frame for the auth routes that sit beside /login: the same
 * SiteShell, the same two-column grid, the same centered card column.
 * Children render in the right column, max-w-md cards align with the
 * login card.
 */
export function AuthPageShell({ children }: { children: ReactNode }) {
  return (
    <SiteShell>
      <main className="flex-1">
        <div className="mx-auto grid w-full max-w-6xl flex-1 lg:grid-cols-2">
          <BrandRail />
          <div className="flex items-center justify-center px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
            {children}
          </div>
        </div>
      </main>
    </SiteShell>
  );
}
