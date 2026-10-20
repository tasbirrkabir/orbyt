"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { STAFF } from "@/content/admin";
import {
  REQUEST_PRIORITIES,
  REQUEST_STATUSES,
  STATUS_LABELS,
  formatAge,
  formatDateTime,
} from "@/lib/portal/domain";
import type { AdminRequestComment, AdminRequestItem, AdminRequestsPayload } from "@/lib/admin/types";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/orbyt/command/status-badge";
import { ErrorState, LoadingState, PageHeader } from "@/components/orbyt/command/primitives";
import { usePortalFetch } from "@/components/orbyt/command/use-portal-fetch";
import { AreaField, ChoiceField, ListLabel } from "./admin-kit";

const COPY = STAFF.requests;

/** The closed sets behind Request.status and Request.priority, labelled for tabs and selects. */
const STATUS_OPTIONS = REQUEST_STATUSES.map((status) => ({
  value: status,
  label: STATUS_LABELS[status] ?? status,
}));
const PRIORITY_OPTIONS = REQUEST_PRIORITIES.map((priority) => ({
  value: priority,
  label: STATUS_LABELS[priority] ?? priority,
}));

/** Local filter sentinel; the visible All label comes from COPY.filterAll. */
const FILTER_ALL = "ALL";

/** One reply on the record. The desk's voice carries the ember edge; the client's sits indented. */
function CommentBlock({ comment }: { comment: AdminRequestComment }) {
  const fromOrbyt = comment.authorRole === "ORBYT";
  return (
    <div
      className={cn(
        "border-l-2 px-4 py-3",
        fromOrbyt ? "border-l-primary" : "border-l-transparent sm:ml-10",
      )}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
        <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
          {comment.authorName}
          <span
            className={cn(
              "border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em]",
              fromOrbyt
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border bg-muted/40 text-muted-foreground",
            )}
          >
            {comment.authorRole}
          </span>
        </p>
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          {formatDateTime(comment.createdAt)}
        </p>
      </div>
      <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed">{comment.body}</p>
    </div>
  );
}

/**
 * The whole request queue across clients. Every row expands in place:
 * the conversation on record, the desk's reply, and the lifecycle
 * controls. A deep link with ?open={id} opens that request directly
 * from the overview.
 */
export function AdminRequests() {
  const { data, loading, failed, retry, refresh } = usePortalFetch<AdminRequestsPayload>(
    "/api/admin/requests",
  );
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState<string>(FILTER_ALL);
  const [openId, setOpenId] = useState<string | null>(() => searchParams.get("open"));
  const [statusDraft, setStatusDraft] = useState("");
  const [priorityDraft, setPriorityDraft] = useState("");
  const [reply, setReply] = useState("");
  const [replyBusy, setReplyBusy] = useState(false);
  const [updateBusy, setUpdateBusy] = useState(false);
  const { toast } = useToast();
  const reduced = useReducedMotion();

  if (loading && !data) return <LoadingState />;
  if (failed && !data) return <ErrorState onRetry={retry} />;
  if (!data) return null;

  const requests = data.requests;
  const visible = filter === FILTER_ALL ? requests : requests.filter((request) => request.status === filter);

  function toggle(request: AdminRequestItem) {
    if (openId === request.id) {
      setOpenId(null);
      return;
    }
    setOpenId(request.id);
    setStatusDraft(request.status);
    setPriorityDraft(request.priority);
    setReply("");
  }

  async function sendReply(requestId: string) {
    const body = reply.trim();
    if (body.length < 2 || replyBusy) return;
    setReplyBusy(true);
    try {
      const response = await fetch(`/api/admin/requests/${requestId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      if (response.ok) {
        toast({ title: COPY.replySent });
        setReply("");
        refresh();
      } else {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        toast({ title: payload?.error || STAFF.states.errorTitle });
      }
    } catch {
      toast({ title: STAFF.states.errorTitle });
    } finally {
      setReplyBusy(false);
    }
  }

  async function sendUpdate(requestId: string, status: string, priority: string) {
    if (updateBusy) return;
    setUpdateBusy(true);
    try {
      const response = await fetch(`/api/admin/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, priority }),
      });
      if (response.ok) {
        toast({ title: COPY.updated });
        refresh();
      } else {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        toast({ title: payload?.error || STAFF.states.errorTitle });
      }
    } catch {
      toast({ title: STAFF.states.errorTitle });
    } finally {
      setUpdateBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow={COPY.eyebrow} title={COPY.title} sub={COPY.sub} />

      {/* Status filter: All plus the lifecycle, one mono tab each. */}
      <div
        role="group"
        aria-label={COPY.colStatus}
        className="flex gap-4 overflow-x-auto border-b border-border [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {[FILTER_ALL, ...REQUEST_STATUSES].map((status) => (
          <button
            key={status}
            type="button"
            aria-pressed={filter === status}
            onClick={() => setFilter(status)}
            className={cn(
              "shrink-0 border-b-2 pb-2 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors",
              filter === status
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {status === FILTER_ALL ? COPY.filterAll : STATUS_LABELS[status] ?? status}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-6 text-sm text-muted-foreground">
          {COPY.empty}
        </p>
      ) : (
        <ul role="list" className="space-y-3">
          {visible.map((request, index) => {
            const isOpen = request.id === openId;
            const statusValue = statusDraft || request.status;
            const priorityValue = priorityDraft || request.priority;
            return (
              <motion.li
                key={request.id}
                initial={reduced ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: Math.min(index, 8) * 0.03, ease: "easeOut" }}
                className="rounded-xl border border-border bg-card/60"
              >
                <button
                  type="button"
                  onClick={() => toggle(request)}
                  aria-expanded={isOpen}
                  className="flex w-full flex-wrap items-center gap-x-3 gap-y-1.5 px-4 py-3.5 text-left transition-colors hover:bg-accent/40 sm:px-5"
                >
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-foreground">
                    {request.code}
                  </span>
                  <span className="text-sm font-semibold">{request.title}</span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    {request.organizationName} · {request.clientId}
                  </span>
                  <span className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={request.status} />
                    <StatusBadge status={request.priority} />
                  </span>
                  <span className="ml-auto flex items-center gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      {formatAge(request.updatedAt)}
                    </span>
                    <span
                      aria-hidden="true"
                      className={cn(
                        "text-muted-foreground transition-transform",
                        isOpen && "rotate-180",
                      )}
                    >
                      ▾
                    </span>
                  </span>
                </button>

                {isOpen ? (
                  <div className="space-y-5 border-t border-border px-4 py-5 sm:px-5">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{request.description}</p>

                    <div className="flex flex-wrap gap-x-6 gap-y-1">
                      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                        {COPY.requesterLabel} {request.requesterName}
                      </p>
                      {request.projectTitle ? (
                        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                          {COPY.projectLabel} {request.projectTitle}
                        </p>
                      ) : null}
                    </div>

                    {/* Conversation on record, oldest to newest. */}
                    <div>
                      <ListLabel>{COPY.commentsLabel}</ListLabel>
                      {request.comments.length === 0 ? (
                        <p className="border border-dashed border-border bg-muted/30 px-4 py-4 text-sm text-muted-foreground">
                          {COPY.noComments}
                        </p>
                      ) : (
                        <div className="divide-y divide-border border border-border bg-background/40">
                          {request.comments.map((comment) => (
                            <CommentBlock key={comment.id} comment={comment} />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* The desk reply, on the record. */}
                    <div className="border-t border-border pt-4">
                      <AreaField
                        id={`request-reply-${request.id}`}
                        label={COPY.replyLabel}
                        value={reply}
                        onChange={setReply}
                        placeholder={COPY.replyPlaceholder}
                        rows={3}
                        hint={reply.trim().length === 1 ? COPY.replyMin : undefined}
                      />
                      <div className="mt-3 flex justify-end">
                        <Button
                          type="button"
                          size="sm"
                          disabled={replyBusy || reply.trim().length < 2}
                          onClick={() => void sendReply(request.id)}
                        >
                          {replyBusy ? COPY.replySending : COPY.replySend}
                        </Button>
                      </div>
                    </div>

                    {/* Lifecycle controls: status, priority, then one commit. */}
                    <div className="grid gap-4 border-t border-border pt-4 sm:grid-cols-2 lg:grid-cols-3">
                      <ChoiceField
                        id={`request-status-${request.id}`}
                        label={COPY.statusLabel}
                        value={statusValue}
                        onChange={setStatusDraft}
                        options={STATUS_OPTIONS}
                      />
                      <ChoiceField
                        id={`request-priority-${request.id}`}
                        label={COPY.priorityLabel}
                        value={priorityValue}
                        onChange={setPriorityDraft}
                        options={PRIORITY_OPTIONS}
                      />
                      <div className="flex items-end">
                        <Button
                          type="button"
                          size="sm"
                          disabled={updateBusy}
                          onClick={() => void sendUpdate(request.id, statusValue, priorityValue)}
                          className="w-full sm:w-auto"
                        >
                          {updateBusy ? STAFF.states.working : COPY.update}
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : null}
              </motion.li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
