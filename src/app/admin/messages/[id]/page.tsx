import type { Metadata } from "next";
import { AdminThreadDetail } from "@/components/orbyt/admin/admin-thread-detail";

export const metadata: Metadata = {
  title: "Conversation · ORBYT Staff",
};

export default async function AdminThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminThreadDetail threadId={id} />;
}
