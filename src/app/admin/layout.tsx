import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SiteShell } from "@/components/orbyt/site-shell";
import { AdminShell } from "@/components/orbyt/admin/admin-shell";

export const metadata: Metadata = {
  title: "Staff Console · ORBYT",
};

/**
 * The staff console layout: site chrome around the ORBYT desk. The
 * shell handles the staff gate in place; every room below it fetches
 * its own data from /api/admin.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SiteShell>
      <main className="flex-1">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
          <AdminShell>{children}</AdminShell>
        </div>
      </main>
    </SiteShell>
  );
}
