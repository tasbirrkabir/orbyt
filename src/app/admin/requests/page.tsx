import { Suspense } from "react";
import type { Metadata } from "next";
import { LoadingState } from "@/components/orbyt/command/primitives";
import { AdminRequests } from "@/components/orbyt/admin/admin-requests";

export const metadata: Metadata = {
  title: "Requests · ORBYT Staff",
};

/**
 * The desk's request queue. AdminRequests reads ?open={id} to
 * auto-expand a deep-linked request, which needs a Suspense boundary.
 */
export default function AdminRequestsPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <AdminRequests />
    </Suspense>
  );
}
