import type { Metadata } from "next";
import { CommandTeam } from "@/components/orbyt/command/command-team";

export const metadata: Metadata = {
  title: "Team · ORBYT Command Center",
};

export default function TeamPage() {
  return <CommandTeam />;
}
