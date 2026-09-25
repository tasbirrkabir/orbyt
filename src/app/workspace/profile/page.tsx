import type { Metadata } from "next";
import { ProfileView } from "@/components/orbyt/portal/views/profile-view";

export const metadata: Metadata = {
  title: "Profile · Workspace · ORBYT",
};

export default function WorkspaceProfilePage() {
  return <ProfileView />;
}
