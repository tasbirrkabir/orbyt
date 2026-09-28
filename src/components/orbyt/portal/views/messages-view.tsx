"use client";

import { PORTAL } from "@/content/flows";
import { MessageComposer } from "@/components/orbyt/portal/message-composer";
import { ConversationLog } from "@/components/orbyt/dashboard/conversation-log";
import { usePortalData } from "../use-portal";
import { PortalLoading, PortalLoadError } from "../portal-states";
import { PortalPageHeader } from "../portal-page-header";

const COPY = PORTAL.messagesPage;

export function MessagesView() {
  const { data, failed, refresh } = usePortalData();

  if (!data) {
    return failed ? <PortalLoadError /> : <PortalLoading />;
  }

  return (
    <div>
      <PortalPageHeader eyebrow={COPY.eyebrow} title={COPY.title} sub={COPY.sub} />

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <MessageComposer projects={data.projects} onSent={refresh} />
        </div>
        <div className="lg:col-span-3">
          <ConversationLog
            submissions={data.submissions ?? []}
            projects={data.projects}
          />
        </div>
      </div>
    </div>
  );
}
