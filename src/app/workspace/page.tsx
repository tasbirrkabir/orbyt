import type { Metadata } from "next";
import { CommandOverview } from "@/components/orbyt/command/command-overview";

export const metadata: Metadata = {
  title: "Overview · ORBYT Command Center",
};

export default function WorkspacePage() {
  return <CommandOverview />;
}
