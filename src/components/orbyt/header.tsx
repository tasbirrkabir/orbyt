"use client";

import { useState } from "react";
import Image from "next/image";
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
import { NAV_LINKS } from "@/content/orbyt";

function Wordmark() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="block size-7 overflow-hidden rounded-sm">
        <Image
          src="/orbyt-mark.png"
          alt=""
          width={28}
          height={28}
          className="h-full w-full object-cover"
        />
      </span>
      <span className="font-display text-lg font-bold tracking-tight">
        ORBYT
      </span>
    </div>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="#top" className="flex items-center">
          <Wordmark />
        </a>

        <nav aria-label="Primary" className="hidden md:flex md:items-center md:gap-1">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="flex h-11 items-center px-3 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild className="hidden h-11 px-5 font-semibold sm:inline-flex">
            <a href="#contact">Start a project</a>
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
            <SheetContent side="right" className="w-full sm:max-w-xs">
              <SheetHeader className="border-b border-border p-6">
                <SheetTitle className="sr-only">ORBYT menu</SheetTitle>
                <SheetDescription className="sr-only">
                  Site navigation
                </SheetDescription>
                <Wordmark />
              </SheetHeader>
              <nav aria-label="Mobile" className="flex flex-col px-6">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="flex h-11 items-center border-b border-border font-mono text-sm uppercase tracking-[0.18em] text-foreground/90 transition-colors hover:text-primary"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
              <div className="mt-auto p-6 pt-0">
                <Button asChild className="h-12 w-full font-semibold">
                  <a href="#contact" onClick={() => setOpen(false)}>
                    Start a project
                  </a>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
