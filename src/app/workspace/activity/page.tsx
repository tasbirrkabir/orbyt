import type { Metadata } from "next";
import { CommandActivity } from "@/components/orbyt/command/command-activity";

export const metadata: Metadata = {
  title: "Activity · ORBYT Command Center",
};

export default function ActivityPage() {
  return <CommandActivity />;
}
