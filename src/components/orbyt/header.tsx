"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { FOOTER, NAV_LINKS, SITE } from "@/content/orbyt";
import { AnimatedMark } from "./animated-mark";
import { ScrollProgress } from "./scroll-progress";
import { cn } from "@/lib/utils";

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function Wordmark() {
  return (
    <span className="flex items-center gap-2.5">
      <AnimatedMark size={28} satellites={1} />
      <span className="font-display text-lg font-bold tracking-tight">
        ORBYT
      </span>
    </span>
  );
}

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur">
      <ScrollProgress />
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="ORBYT home" className="flex items-center">
          <Wordmark />
        </Link>

        <nav
          aria-label="Primary"
          className="hidden md:flex md:items-center md:gap-1"
        >
          {NAV_LINKS.map((link) => {
            const active = isActivePath(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex h-11 items-center px-3 font-mono text-xs uppercase tracking-[0.18em] transition-colors",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {active ? (
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-1/2 size-1.5 -translate-y-1/2 bg-primary"
                  />
                ) : null}
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <nav
            aria-label="Account"
            className="hidden items-center gap-1 md:flex"
          >
            {FOOTER.accountLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex h-11 items-center px-3 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <Button
            asChild
            className="hidden h-11 px-5 font-semibold sm:inline-flex"
          >
            <Link href={SITE.cta.href}>{SITE.cta.label}</Link>
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="size-11 md:hidden"
                aria-label="Open menu"
              >
                <Menu aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex w-full flex-col sm:max-w-xs">
              <SheetHeader className="border-b border-border p-6">
                <SheetTitle className="sr-only">ORBYT menu</SheetTitle>
                <SheetDescription className="sr-only">
                  Site navigation
                </SheetDescription>
                <Wordmark />
              </SheetHeader>
              <nav aria-label="Mobile" className="flex flex-col px-6">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    aria-current={
                      isActivePath(pathname, link.href) ? "page" : undefined
                    }
                    className={cn(
                      "flex h-11 items-center border-b border-border font-mono text-sm uppercase tracking-[0.18em] transition-colors hover:text-primary",
                      isActivePath(pathname, link.href)
                        ? "text-primary"
                        : "text-foreground/90"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                <p className="pt-6 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  Account
                </p>
                {FOOTER.accountLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="flex h-11 items-center border-b border-border font-mono text-sm uppercase tracking-[0.18em] text-foreground/90 transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-auto p-6 pt-6">
                <Button asChild className="h-12 w-full font-semibold">
                  <Link href={SITE.cta.href} onClick={() => setOpen(false)}>
                    {SITE.cta.label}
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
