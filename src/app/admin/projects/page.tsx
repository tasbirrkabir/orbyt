import type { Metadata } from "next";
import { AdminProjects } from "@/components/orbyt/admin/admin-projects";

export const metadata: Metadata = {
  title: "Projects · ORBYT Staff",
};

export default function AdminProjectsPage() {
  return <AdminProjects />;
}
