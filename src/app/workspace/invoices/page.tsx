import type { Metadata } from "next";
import { CommandInvoices } from "@/components/orbyt/command/command-invoices";

export const metadata: Metadata = {
  title: "Invoices · ORBYT Command Center",
};

export default function InvoicesPage() {
  return <CommandInvoices />;
}
