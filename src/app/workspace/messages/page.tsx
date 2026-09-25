import type { Metadata } from "next";
import { MessagesView } from "@/components/orbyt/portal/views/messages-view";

export const metadata: Metadata = {
  title: "Messages · Workspace · ORBYT",
};

export default function WorkspaceMessagesPage() {
  return <MessagesView />;
}
