import type { Metadata } from "next";
import { CommandMeetings } from "@/components/orbyt/command/command-meetings";

export const metadata: Metadata = {
  title: "Meetings · ORBYT Command Center",
};

export default function MeetingsPage() {
  return <CommandMeetings />;
}
