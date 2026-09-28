"use client";

import { useState } from "react";
import { STAFF } from "@/content/admin";
import { formatDateTime } from "@/lib/portal/domain";
import type { AdminActivityPayload } from "@/lib/admin/types";
import { usePortalFetch } from "@/components/orbyt/command/use-portal-fetch";
import { EmptyState, ErrorState, LoadingState, PageHeader } from "@/components/orbyt/command/primitives";
import { AdminPanel } from "./admin-kit";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const COPY = STAFF.activity;

/** The closed actor-role filter the API accepts. */
type RoleFilter = "ALL" | "ADMIN" | "CLIENT";

function endpointFor(role: RoleFilter): string {
  return role === "ALL" ? "/api/admin/activity" : `/api/admin/activity?role=${role}`;
}

function ActivityFeed({ endpoint }: { endpoint: string }) {
  const { data, loading, failed, retry } = usePortalFetch<AdminActivityPayload>(endpoint);

  if (loading && !data) return <LoadingState />;
  if (failed && !data) return <ErrorState onRetry={retry} />;
  if (!data) return null;

  if (data.audit.length === 0) {
    return <EmptyState title={COPY.title} body={COPY.empty} />;
  }

  return (
    <AdminPanel className="max-h-[36rem] overflow-y-auto">
      <div className="hidden border-b border-border pb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground md:grid md:grid-cols-[1.2fr_1.5fr_1fr_1.5fr] md:gap-3">
        <span>{COPY.colWhen}</span>
        <span>{COPY.colActor}</span>
        <span>{COPY.colAction}</span>
        <span>{COPY.colTarget}</span>
      </div>
      <ul role="list" className="divide-y divide-border">
        {data.audit.map((row) => (
          <li
            key={row.id}
            className="py-3 md:grid md:grid-cols-[1.2fr_1.5fr_1fr_1.5fr] md:items-start md:gap-3"
          >
            <p className="font-mono text-xs tabular-nums text-muted-foreground">
              {formatDateTime(row.createdAt)}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2 md:mt-0">
              <span className="truncate font-mono text-xs text-foreground">{row.actorEmail}</span>
              <span className="inline-flex shrink-0 items-center border border-border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                {row.actorRole}
              </span>
            </div>
            <p className="mt-1 font-mono text-xs text-foreground md:mt-0">{row.action}</p>
            <div className="mt-1 min-w-0 md:mt-0">
              <p className="truncate text-xs text-foreground">{row.targetLabel || row.targetType}</p>
              {row.organizationName ? (
                <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  {row.organizationName}
                </p>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </AdminPanel>
  );
}

/**
 * The audit log: append-only, read-only. Every staff and client
 * security-relevant action, filterable by who acted. Nothing here is
 * editable, so the room offers no forms and takes no actions.
 */
export function AdminActivity() {
  const [role, setRole] = useState<RoleFilter>("ALL");

  return (
    <div>
      <PageHeader eyebrow={COPY.eyebrow} title={COPY.title} sub={COPY.sub} />

      <Tabs value={role} onValueChange={(value) => setRole(value as RoleFilter)} className="mb-6">
        <TabsList aria-label={COPY.title}>
          <TabsTrigger value="ALL">{COPY.all}</TabsTrigger>
          <TabsTrigger value="ADMIN">{COPY.orbyt}</TabsTrigger>
          <TabsTrigger value="CLIENT">{COPY.client}</TabsTrigger>
        </TabsList>
      </Tabs>

      <ActivityFeed key={role} endpoint={endpointFor(role)} />
    </div>
  );
}
