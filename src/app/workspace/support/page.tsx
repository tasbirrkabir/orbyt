import type { Metadata } from "next";
import { CommandSupport } from "@/components/orbyt/command/command-support";

export const metadata: Metadata = {
  title: "Support · ORBYT Command Center",
};

export default function SupportPage() {
  return <CommandSupport />;
}
