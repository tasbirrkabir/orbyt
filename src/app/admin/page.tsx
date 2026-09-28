import type { Metadata } from "next";
import { StaffConsole } from "@/components/orbyt/admin/staff-console";

export const metadata: Metadata = {
  title: "Staff console · ORBYT",
  // Internal operations surface: never indexed, never linked.
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <StaffConsole />;
}
