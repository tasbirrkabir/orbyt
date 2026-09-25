import type { Metadata } from "next";
import { CommandBilling } from "@/components/orbyt/command/command-billing";

export const metadata: Metadata = {
  title: "Billing · ORBYT Command Center",
};

export default function BillingPage() {
  return <CommandBilling />;
}
