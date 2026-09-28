import type { Metadata } from "next";
import { AdminActivity } from "@/components/orbyt/admin/admin-activity";

export const metadata: Metadata = {
  title: "Audit Log · ORBYT Staff",
};

export default function AdminActivityPage() {
  return <AdminActivity />;
}
