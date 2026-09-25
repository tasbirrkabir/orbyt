import type { Metadata } from "next";
import { SupportView } from "@/components/orbyt/portal/views/support-view";

export const metadata: Metadata = {
  title: "Support · Workspace · ORBYT",
};

export default function WorkspaceSupportPage() {
  return <SupportView />;
}
