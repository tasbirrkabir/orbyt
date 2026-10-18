import type { Metadata } from "next";
import { CommandProject } from "@/components/orbyt/command/command-project";

export const metadata: Metadata = {
  title: "Project · ORBYT Command Center",
};

export default function WorkspaceHomePage() {
  return <CommandProject />;
}
