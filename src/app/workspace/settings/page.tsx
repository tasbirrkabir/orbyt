import type { Metadata } from "next";
import { CommandSettings } from "@/components/orbyt/command/command-settings";

export const metadata: Metadata = {
  title: "Settings · ORBYT Command Center",
};

export default function SettingsPage() {
  return <CommandSettings />;
}
