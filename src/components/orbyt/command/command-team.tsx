"use client";

import { motion, useReducedMotion } from "framer-motion";
import { COMMAND } from "@/content/command";
import { ROLE_LABELS, formatDate } from "@/lib/portal/domain";
import type { TeamPayload } from "@/lib/portal/types";
import { usePortalFetch } from "./use-portal-fetch";
import { EmptyState, ErrorState, LoadingState, PageHeader } from "./primitives";
import { cn } from "@/lib/utils";

export function CommandTeam() {
  const { data, loading, failed, retry } = usePortalFetch<TeamPayload>("/api/portal/team");
  const reduced = useReducedMotion();

  if (loading && !data) return <LoadingState />;
  if (failed && !data) return <ErrorState onRetry={retry} />;
  if (!data) return null;

  return (
    <div>
      <PageHeader eyebrow={COMMAND.team.eyebrow} title={COMMAND.team.title} sub={COMMAND.team.sub} />

      {data.members.length === 0 ? (
        <EmptyState title={COMMAND.team.emptyTitle} body={COMMAND.team.empty} />
      ) : (
        <ul role="list" className="divide-y divide-border border border-border bg-card/50">
          {data.members.map((member, index) => (
            <motion.li
              key={member.id}
              initial={reduced ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.04, ease: "easeOut" }}
              className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2 px-5 py-4"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold">{member.name}</p>
                <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">{member.email}</p>
                <p className="mt-1.5 max-w-md text-xs leading-relaxed text-muted-foreground">
                  {COMMAND.team.roleNotes[member.role as keyof typeof COMMAND.team.roleNotes]}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-foreground">
                  {ROLE_LABELS[member.role] ?? member.role}
                </p>
                <p
                  className={cn(
                    "mt-1.5 font-mono text-[9px] uppercase tracking-[0.16em]",
                    member.active ? "text-muted-foreground" : "text-primary",
                  )}
                >
                  {member.active ? COMMAND.team.active : COMMAND.team.pending}
                  {member.active && member.joinedAt ? ` · ${formatDate(member.joinedAt)}` : ""}
                </p>
              </div>
            </motion.li>
          ))}
        </ul>
      )}

      <p className="mt-6 max-w-2xl text-xs leading-relaxed text-muted-foreground">{COMMAND.team.note}</p>
    </div>
  );
}
