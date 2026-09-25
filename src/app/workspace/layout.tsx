import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SiteShell } from "@/components/orbyt/site-shell";
import { WorkspaceShell } from "@/components/orbyt/portal/workspace-shell";

export const metadata: Metadata = {
  title: "Workspace · ORBYT",
};

/**
 * The workspace layout: site chrome around a client-rendered portal shell.
 * The shell handles the session gate in place and the console plate with
 * the section rail; each room below it fetches its own data.
 */
export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SiteShell>
      <main className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
          <WorkspaceShell>{children}</WorkspaceShell>
        </div>
      </main>
    </SiteShell>
  );
}
