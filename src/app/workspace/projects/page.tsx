import type { Metadata } from "next";
import { CommandProjects } from "@/components/orbyt/command/command-projects";

export const metadata: Metadata = {
  title: "Projects · ORBYT Command Center",
};

export default function WorkspaceProjectsPage() {
  return <CommandProjects />;
}
