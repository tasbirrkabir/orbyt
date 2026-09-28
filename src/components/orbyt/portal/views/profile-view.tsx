"use client";

import { PORTAL } from "@/content/flows";
import { ProfilePanel } from "@/components/orbyt/dashboard/profile-panel";
import { SystemMap } from "@/components/orbyt/dashboard/system-map";
import { usePortalData } from "../use-portal";
import { PortalLoading, PortalLoadError } from "../portal-states";
import { PortalPageHeader } from "../portal-page-header";

const COPY = PORTAL.profilePage;

export function ProfileView() {
  const { data, failed } = usePortalData();

  if (!data) {
    return failed ? <PortalLoadError /> : <PortalLoading />;
  }

  return (
    <div>
      <PortalPageHeader eyebrow={COPY.eyebrow} title={COPY.title} sub={COPY.sub} />

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <SystemMap profile={data.profile} />
        </div>
        <div className="lg:col-span-2">
          <ProfilePanel
            profile={data.profile}
            updatedAt={data.profile?.updatedAt ?? null}
          />
        </div>
      </div>
    </div>
  );
}
