import type { Metadata } from "next";
import { CommandRequestDetail } from "@/components/orbyt/command/command-request-detail";

export const metadata: Metadata = {
  title: "Request · ORBYT Command Center",
};

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CommandRequestDetail requestId={id} />;
}
