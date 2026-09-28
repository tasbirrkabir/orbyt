import type { Metadata } from "next";
import { AdminClientDetail } from "@/components/orbyt/admin/admin-client-detail";

export const metadata: Metadata = {
  title: "Client · ORBYT Staff",
};

export default async function AdminClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdminClientDetail orgId={id} />;
}
