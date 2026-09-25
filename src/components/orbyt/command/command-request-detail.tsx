"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { COMMAND } from "@/content/command";
import {
  CATEGORY_LABELS,
  formatAge,
  formatDateTime,
} from "@/lib/portal/domain";
import type { RequestDetailPayload } from "@/lib/portal/types";
import { usePortalFetch } from "./use-portal-fetch";
import { ErrorState, LoadingState } from "./primitives";
import { StatusBadge } from "./status-badge";
import { cn } from "@/lib/utils";

export function CommandRequestDetail({ requestId }: { requestId: string }) {
  const { data, loading, failed, refresh, retry } = usePortalFetch<RequestDetailPayload>(
    `/api/portal/requests/${requestId}`,
  );
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [replyError, setReplyError] = useState("");

  if (loading && !data) return <LoadingState />;
  if (failed && !data) return <ErrorState onRetry={retry} />;
  if (!data) return null;

  const { request, comments, identity } = data;
  const canReply = identity.canWrite;

  const sendReply = async () => {
    if (reply.trim().length < 2) {
      setReplyError("Write a line or two first");
      return;
    }
    setSending(true);
    setReplyError("");
    try {
      const response = await fetch(`/api/portal/requests/${request.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: reply.trim() }),
      });
      if (response.status === 201) {
        setReply("");
        refresh();
      } else {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setReplyError(payload?.error ?? COMMAND.states.errorBody);
      }
    } catch {
      setReplyError(COMMAND.states.errorBody);
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <Link
        href="/workspace/requests"
        className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
      >
        <span aria-hidden="true">&larr;</span> {COMMAND.requests.detail.back}
      </Link>

      <header className="mt-5 border-b border-border pb-6">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-primary">{request.code}</span>
          <StatusBadge status={request.status} />
          {request.priority !== "NORMAL" ? <StatusBadge status={request.priority} /> : null}
        </div>
        <h1 className="mt-2.5 font-display text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
          {request.title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {CATEGORY_LABELS[request.category] ?? request.category}
          {request.projectTitle ? ` · ${request.projectTitle}` : ""}
          {" · "}
          {COMMAND.requests.detail.requester} {request.requesterName}
          {" · "}
          {COMMAND.requests.detail.updated} {formatAge(request.updatedAt)}
        </p>
      </header>

      <div className="mt-6 grid gap-8 lg:grid-cols-3">
        <div className="min-w-0 lg:col-span-2">
          {/* Description */}
          <section aria-label={COMMAND.requests.fields.description}>
            <h2 className="mb-3 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              {COMMAND.requests.fields.description}
            </h2>
            <p className="whitespace-pre-wrap border border-border bg-card/50 p-5 text-sm leading-relaxed">
              {request.description}
            </p>
          </section>

          {/* Conversation */}
          <section aria-label={COMMAND.requests.comments.label} className="mt-10">
            <h2 className="mb-3 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              {COMMAND.requests.comments.label}
            </h2>
            {comments.length === 0 ? (
              <p className="border border-dashed border-border bg-muted/30 px-5 py-6 text-sm text-muted-foreground">
                {COMMAND.requests.comments.empty}
              </p>
            ) : (
              <ul role="list" className="divide-y divide-border border border-border bg-card/50">
                {comments.map((comment) => (
                  <li
                    key={comment.id}
                    className={cn(
                      "px-5 py-4",
                      comment.authorRole === "ORBYT" && "border-l-2 border-l-primary",
                    )}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold">{comment.authorName}</span>
                      <span
                        className={cn(
                          "border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em]",
                          comment.authorRole === "ORBYT"
                            ? "border-primary/40 bg-primary/10 text-primary"
                            : "border-border text-muted-foreground",
                        )}
                      >
                        {comment.authorRole === "ORBYT" ? "ORBYT" : "You"}
                      </span>
                      <span className="ml-auto font-mono text-[10px] text-muted-foreground">
                        {formatDateTime(comment.createdAt)}
                      </span>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{comment.body}</p>
                  </li>
                ))}
              </ul>
            )}

            {canReply ? (
              <div className="mt-5 space-y-2">
                <Label htmlFor="reply" className="sr-only">
                  {COMMAND.requests.comments.replyPlaceholder}
                </Label>
                <Textarea
                  id="reply"
                  value={reply}
                  onChange={(event) => setReply(event.target.value)}
                  placeholder={COMMAND.requests.comments.replyPlaceholder}
                  rows={3}
                  maxLength={2000}
                />
                {replyError ? (
                  <p role="status" className="text-sm text-destructive">
                    {replyError}
                  </p>
                ) : null}
                <Button
                  onClick={() => void sendReply()}
                  disabled={sending || reply.trim().length < 2}
                  className="text-[#1B1B1A]"
                >
                  {sending ? COMMAND.requests.comments.replying : COMMAND.requests.comments.reply}
                </Button>
              </div>
            ) : (
              <p className="mt-5 border border-border bg-muted/30 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
                {COMMAND.requests.viewerNote}
              </p>
            )}
          </section>
        </div>

        {/* Side facts */}
        <aside className="space-y-4">
          <div className="border border-border bg-card/50 p-5">
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">Filed</dt>
                <dd className="mt-0.5">{formatDateTime(request.createdAt)}</dd>
              </div>
              <div>
                <dt className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                  {COMMAND.requests.detail.updated}
                </dt>
                <dd className="mt-0.5">{formatDateTime(request.updatedAt)}</dd>
              </div>
              {request.projectTitle ? (
                <div>
                  <dt className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">Project</dt>
                  <dd className="mt-0.5">{request.projectTitle}</dd>
                </div>
              ) : null}
            </dl>
          </div>
          <p className="border border-border bg-muted/30 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
            {COMMAND.requests.detail.slaNote}
          </p>
        </aside>
      </div>
    </div>
  );
}
