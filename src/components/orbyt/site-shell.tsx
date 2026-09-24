import type { ReactNode } from "react";
import { Header } from "./header";
import { Footer } from "./footer";

/**
 * Shared page frame: sticky header, flexible main, mt-auto footer.
 * Every public route renders inside this so the flex column guarantees
 * the footer sticks to the bottom on short pages.
 */
export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
