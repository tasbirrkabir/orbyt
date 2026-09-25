import type { Metadata } from "next";
import { CommandRequests } from "@/components/orbyt/command/command-requests";

export const metadata: Metadata = {
  title: "Requests · ORBYT Command Center",
};

export default function RequestsPage() {
  return <CommandRequests />;
}
