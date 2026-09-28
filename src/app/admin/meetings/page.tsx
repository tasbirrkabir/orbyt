import type { Metadata } from "next";
import { AdminMeetings } from "@/components/orbyt/admin/admin-meetings";

export const metadata: Metadata = {
  title: "Meetings · ORBYT Staff",
};

export default function AdminMeetingsPage() {
  return <AdminMeetings />;
}
