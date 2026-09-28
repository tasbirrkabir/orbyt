import type { Metadata } from "next";
import { ProjectView } from "@/components/orbyt/portal/views/project-view";

export const metadata: Metadata = {
  title: "Project · Workspace · ORBYT",
};

export default function WorkspaceProjectPage() {
  return <ProjectView />;
}
