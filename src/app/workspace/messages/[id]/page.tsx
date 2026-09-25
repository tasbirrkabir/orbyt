import type { Metadata } from "next";
import { CommandThreadDetail } from "@/components/orbyt/command/command-thread-detail";

export const metadata: Metadata = {
  title: "Conversation · ORBYT Command Center",
};

export default async function WorkspaceThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CommandThreadDetail threadId={id} />;
}
