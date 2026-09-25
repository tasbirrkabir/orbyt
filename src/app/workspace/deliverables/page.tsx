import type { Metadata } from "next";
import { CommandDeliverables } from "@/components/orbyt/command/command-deliverables";

export const metadata: Metadata = {
  title: "Deliverables · ORBYT Command Center",
};

export default function WorkspaceDeliverablesPage() {
  return <CommandDeliverables />;
}
