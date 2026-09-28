import type { Metadata } from "next";
import { AdminBilling } from "@/components/orbyt/admin/admin-billing";

export const metadata: Metadata = {
  title: "Billing · ORBYT Staff",
};

export default function AdminBillingPage() {
  return <AdminBilling />;
}
