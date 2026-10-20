"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { STAFF } from "@/content/admin";
import { formatDateTime } from "@/lib/portal/domain";
import type { AdminMessageItem, AdminThreadDetailPayload } from "@/lib/admin/types";
import { cn } from "@/lib/utils";
import { ErrorState, LoadingState } from "@/components/orbyt/command/primitives";
import { usePortalFetch } from "@/components/orbyt/command/use-portal-fetch";
import { AdminPanel, AreaField } from "./admin-kit";

const COPY = STAFF.messages;

/**
 * One side of the exchange. The desk's voice carries the ember edge
 * plus the read receipt; the client's message sits indented. Read
 * state comes from the record, never invented here.
 */
function MessageBlock({ message }: { message: AdminMessageItem }) {
  const fromOrbyt = message.senderRole === "ORBYT";
  return (
    <div
      className={cn(
        "border-l-2 px-5 py-4",
        fromOrbyt ? "border-l-primary" : "border-l-transparent sm:ml-14",
      )}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
        <p className="text-sm font-semibold">{message.senderName}</p>
        <div className="flex flex-wrap items-center gap-3">
          {fromOrbyt ? (
            <span
              className={cn(
                "border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em]",
                message.readByClient
                  ? "border-border bg-muted text-muted-foreground"
                  : "border-primary/40 bg-primary/10 text-primary",
              )}
            >
              {message.readByClient ? COPY.clientHasRead : COPY.clientUnread}
            </span>
          ) : null}
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            {formatDateTime(message.createdAt)}
          </p>
        </div>
      </div>
      <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed">{message.body}</p>
    </div>
  );
}

/**
 * The desk side of one conversation: the whole exchange in a capped
 * scrollback and the reply box on record below it.
 */
export function AdminThreadDetail({ threadId }: { threadId: string }) {
  const { data, loading, failed, retry } = usePortalFetch<AdminThreadDetailPayload>(
    `/api/admin/messages/${threadId}`,
  );
  // Locally appended replies; null until the first send so the fetched record stays the source of truth.
  const [appended, setAppended] = useState<AdminMessageItem[] | null>(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const { toast } = useToast();
  const reduced = useReducedMotion();

  const fetchedCount = data?.messages.length ?? 0;
  const totalMessages = fetchedCount + (appended?.length ?? 0);

  // The scrollback opens at the latest message, like the desk reads it.
  useEffect(() => {
    const element = scrollRef.current;
    if (element) element.scrollTop = element.scrollHeight;
  }, [totalMessages]);

  if (loading && !data) return <LoadingState />;
  if (failed && !data) return <ErrorState onRetry={retry} />;
  if (!data) return null;

  const thread = data.thread;
  const messages = [...data.messages, ...(appended ?? [])];

  async function sendReply() {
    const body = reply.trim();
    if (body.length < 2 || sending) return;
    setSending(true);
    try {
      const response = await fetch(`/api/admin/messages/${threadId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      if (response.ok) {
        const payload = (await response.json()) as { message: AdminMessageItem };
        setAppended([...(appended ?? []), payload.message]);
        setReply("");
        toast({ title: COPY.replySent });
      } else {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        toast({ title: payload?.error || STAFF.states.errorTitle });
      }
    } catch {
      toast({ title: STAFF.states.errorTitle });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-8">
      <motion.header
        initial={reduced ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <Link
          href="/admin/messages"
          className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground"
        >
          <span aria-hidden="true">&larr;</span>
          {STAFF.nav.items.messages.label}
        </Link>
        <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.22em] text-primary">{COPY.eyebrow}</p>
        <h1 className="mt-2 max-w-2xl font-display text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
          {thread.subject}
        </h1>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          {thread.organizationName} · {thread.clientId}
        </p>
        <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          {thread.projectTitle ?? COPY.generalContext}
        </p>
      </motion.header>

      {/* Capped scrollback. The negative margin cancels the panel padding
          so the exchange runs edge to edge and the reply box stays in reach. */}
      <AdminPanel>
        <div ref={scrollRef} className="-m-5 max-h-96 divide-y divide-border overflow-y-auto">
          {messages.map((message) => (
            <MessageBlock key={message.id} message={message} />
          ))}
        </div>
      </AdminPanel>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void sendReply();
        }}
        className="rounded-xl border border-border bg-card/60 p-5"
      >
        <AreaField
          id="admin-thread-reply"
          label={COPY.replyLabel}
          value={reply}
          onChange={setReply}
          placeholder={COPY.replyPlaceholder}
          rows={4}
          hint={reply.trim().length === 1 ? COPY.replyMin : undefined}
        />
        <div className="mt-3 flex justify-end">
          <Button type="submit" size="sm" disabled={sending || reply.trim().length < 2}>
            {sending ? COPY.replySending : COPY.replySend}
          </Button>
        </div>
      </form>
    </div>
  );
}
