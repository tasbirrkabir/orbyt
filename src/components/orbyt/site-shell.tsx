import type { ReactNode } from "react";
import { Cursor } from "./cursor";
import { Footer } from "./footer";
import { Grain } from "./grain";
import { Header } from "./header";

/**
 * Shared page frame: sticky header, flexible main, mt-auto footer.
 * Every public route renders inside this so the flex column guarantees
 * the footer sticks to the bottom on short pages. The orbiter cursor and
 * the film grain ride above everything, on every route.
 */
export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Cursor />
      <Grain />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
