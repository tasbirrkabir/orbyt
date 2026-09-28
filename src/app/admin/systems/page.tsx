import type { Metadata } from "next";
import { AdminSystems } from "@/components/orbyt/admin/admin-systems";

export const metadata: Metadata = {
  title: "Systems · ORBYT Staff",
};

export default function AdminSystemsPage() {
  return <AdminSystems />;
}
