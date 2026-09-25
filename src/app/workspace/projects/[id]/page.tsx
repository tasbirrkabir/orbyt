import type { Metadata } from "next";
import { CommandProjectDetail } from "@/components/orbyt/command/command-project-detail";

export const metadata: Metadata = {
  title: "Project · ORBYT Command Center",
};

export default async function WorkspaceProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CommandProjectDetail projectId={id} />;
}
