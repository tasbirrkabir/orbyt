import type { Metadata } from "next";
import { CommandReports } from "@/components/orbyt/command/command-reports";

export const metadata: Metadata = {
  title: "Reports · ORBYT Command Center",
};

export default function WorkspaceReportsPage() {
  return <CommandReports />;
}
