import type { Metadata } from "next";
import { DeliverablesView } from "@/components/orbyt/portal/views/deliverables-view";

export const metadata: Metadata = {
  title: "Deliverables · Workspace · ORBYT",
};

export default function WorkspaceDeliverablesPage() {
  return <DeliverablesView />;
}
