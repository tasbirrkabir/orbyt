import type { Metadata } from "next";
import { AdminFiles } from "@/components/orbyt/admin/admin-files";

export const metadata: Metadata = {
  title: "Files · ORBYT Staff",
};

export default function AdminFilesPage() {
  return <AdminFiles />;
}
