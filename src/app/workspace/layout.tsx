import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SiteShell } from "@/components/orbyt/site-shell";
import { CommandShell } from "@/components/orbyt/command/command-shell";

export const metadata: Metadata = {
  title: "Command Center · ORBYT",
};

/**
 * The workspace layout: site chrome around the client-rendered Command
 * Center shell. The shell handles the session gate in place, the
 * console plate, the sidebar and the mobile navigation; each room
 * below it fetches its own data.
 */
export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SiteShell>
      <main className="flex-1">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
          <CommandShell>{children}</CommandShell>
        </div>
      </main>
    </SiteShell>
  );
}
