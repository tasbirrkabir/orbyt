import type { Metadata } from "next";
import { AdminApprovals } from "@/components/orbyt/admin/admin-approvals";

export const metadata: Metadata = {
  title: "Approvals · ORBYT Staff",
};

export default function AdminApprovalsPage() {
  return <AdminApprovals />;
}
