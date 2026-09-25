"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PORTAL } from "@/content/flows";
import { cn } from "@/lib/utils";

const ITEMS = [
  PORTAL.nav.overview,
  PORTAL.nav.project,
  PORTAL.nav.deliverables,
  PORTAL.nav.messages,
  PORTAL.nav.support,
  PORTAL.nav.profile,
];

/**
 * The portal's section rail: six rooms, one row of mono tabs. Full bleed
 * against the console plate, scrollable on phones, and the active room
 * carries the ember underline. Labels stay short so the row never feels
 * like a second nav bar.
 */
export function PortalNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label={PORTAL.nav.label}
      className="-mx-4 mb-6 border-b border-border px-2 sm:-mx-6 sm:mb-8 sm:px-4 lg:-mx-10 lg:mb-10 lg:px-6"
    >
      <ul
        role="list"
        className="flex gap-0.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <li key={item.href} className="shrink-0">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex h-11 items-center px-3 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors sm:px-4",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
                {active ? (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-2 bottom-0 h-0.5 bg-primary sm:inset-x-3"
                  />
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
