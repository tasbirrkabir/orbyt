import type { Metadata } from "next";
import { CommandFiles } from "@/components/orbyt/command/command-files";

export const metadata: Metadata = {
  title: "Files · ORBYT Command Center",
};

export default function WorkspaceFilesPage() {
  return <CommandFiles />;
}
