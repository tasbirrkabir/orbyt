import type { Metadata } from "next";
import { CommandMessages } from "@/components/orbyt/command/command-messages";

export const metadata: Metadata = {
  title: "Messages · ORBYT Command Center",
};

export default function WorkspaceMessagesPage() {
  return <CommandMessages />;
}
