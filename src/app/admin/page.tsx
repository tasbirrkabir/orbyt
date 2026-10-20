import type { Metadata } from "next";
import { AdminOverview } from "@/components/orbyt/admin/admin-overview";

export const metadata: Metadata = {
  title: "Staff console · ORBYT",
  // Internal operations surface: never indexed, never linked.
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminOverview />;
}
