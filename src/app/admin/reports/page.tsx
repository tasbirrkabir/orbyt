import type { Metadata } from "next";
import { AdminReports } from "@/components/orbyt/admin/admin-reports";

export const metadata: Metadata = {
  title: "Reports · ORBYT Staff",
};

export default function AdminReportsPage() {
  return <AdminReports />;
}
