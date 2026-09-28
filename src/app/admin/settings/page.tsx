import type { Metadata } from "next";
import { AdminSettings } from "@/components/orbyt/admin/admin-settings";

export const metadata: Metadata = {
  title: "Settings · ORBYT Staff",
};

export default function AdminSettingsPage() {
  return <AdminSettings />;
}
