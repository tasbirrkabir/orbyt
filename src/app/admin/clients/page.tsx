import type { Metadata } from "next";
import { AdminClients } from "@/components/orbyt/admin/admin-clients";

export const metadata: Metadata = {
  title: "Clients · ORBYT Staff",
};

export default function AdminClientsPage() {
  return <AdminClients />;
}
