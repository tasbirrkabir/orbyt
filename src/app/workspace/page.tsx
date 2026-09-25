import type { Metadata } from "next";
import { OverviewView } from "@/components/orbyt/portal/views/overview-view";

export const metadata: Metadata = {
  title: "Workspace · ORBYT",
};

export default function WorkspacePage() {
  return <OverviewView />;
}
