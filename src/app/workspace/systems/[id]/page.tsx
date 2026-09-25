import type { Metadata } from "next";
import { CommandSystemDetail } from "@/components/orbyt/command/command-system-detail";

export const metadata: Metadata = {
  title: "System · ORBYT Command Center",
};

export default async function WorkspaceSystemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CommandSystemDetail systemId={id} />;
}
