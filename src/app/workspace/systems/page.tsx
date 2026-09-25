import type { Metadata } from "next";
import { CommandSystems } from "@/components/orbyt/command/command-systems";

export const metadata: Metadata = {
  title: "Systems · ORBYT Command Center",
};

export default function WorkspaceSystemsPage() {
  return <CommandSystems />;
}
