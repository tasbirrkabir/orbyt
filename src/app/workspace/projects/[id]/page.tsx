import type { Metadata } from "next";
import { CommandProjectDetail } from "@/components/orbyt/command/command-project-detail";

export const metadata: Metadata = {
  title: "Project · ORBYT Command Center",
};

const TABS = [
  "overview",
  "milestones",
  "scope",
  "changes",
  "decisions",
  "updates",
  "deliverables",
  "files",
] as const;

type ProjectTab = (typeof TABS)[number];

export default async function WorkspaceProjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const { tab } = await searchParams;
  const initialTab: ProjectTab = TABS.includes(tab as ProjectTab) ? (tab as ProjectTab) : "overview";
  return <CommandProjectDetail projectId={id} initialTab={initialTab} />;
}
