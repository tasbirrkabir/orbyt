import type { Metadata } from "next";
import { CommandApprovals } from "@/components/orbyt/command/command-approvals";

export const metadata: Metadata = {
  title: "Approvals · ORBYT Command Center",
};

export default function WorkspaceApprovalsPage() {
  return <CommandApprovals />;
}
