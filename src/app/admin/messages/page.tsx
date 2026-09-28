import type { Metadata } from "next";
import { AdminMessages } from "@/components/orbyt/admin/admin-messages";

export const metadata: Metadata = {
  title: "Messages · ORBYT Staff",
};

export default function AdminMessagesPage() {
  return <AdminMessages />;
}
