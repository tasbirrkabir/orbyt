"use client";

import { type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { PROTECTED } from "@/content/flows";
import { ConsoleFrame } from "@/components/orbyt/dashboard/console-frame";
import { PortalGate } from "./portal-gate";
import { PortalNav } from "./portal-nav";

function SessionSpinner() {
  return (
    <div className="flex flex-col items-center gap-4 py-24">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
        {PROTECTED.redirecting}
      </p>
    </div>
  );
}

/**
 * The multi-room portal shell, mounted once above all six workspace
 * routes. Locked session renders the login gate in place (any deep link
 * remembers where it was headed); a live session renders the console
 * plate with the section rail, and the room's content inside it. Zero
 * redirects anywhere in the flow.
 */
export function WorkspaceShell({ children }: { children: ReactNode }) {
  const { status, update } = useSession();
  const pathname = usePathname();

  if (status === "loading") {
    return <SessionSpinner />;
  }

  if (status === "unauthenticated") {
    return (
      <PortalGate
        next={pathname}
        onSignedIn={() => {
          // Refresh the session in place; the portal replaces the gate on
          // this same page, no redirect.
          void update();
        }}
      />
    );
  }

  return (
    <ConsoleFrame>
      <PortalNav />
      {children}
    </ConsoleFrame>
  );
}
