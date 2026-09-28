import type { Metadata } from "next";
import { AdminProjectDetail } from "@/components/orbyt/admin/admin-project-detail";

export const metadata: Metadata = {
  title: "Project · ORBYT Staff",
};

export default async function AdminProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdminProjectDetail projectId={id} />;
}
