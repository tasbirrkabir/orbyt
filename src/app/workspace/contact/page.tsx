import type { Metadata } from "next";
import { CommandContact } from "@/components/orbyt/command/command-contact";

export const metadata: Metadata = {
  title: "Contact · ORBYT Command Center",
};

export default function ContactPage() {
  return <CommandContact />;
}
