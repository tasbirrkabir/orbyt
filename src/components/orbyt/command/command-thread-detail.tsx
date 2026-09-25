"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { COMMAND } from "@/content/command";
import { formatDateTime } from "@/lib/portal/domain";
import type { ThreadDetailPayload } from "@/lib/portal/types";
import { cn } from "@/lib/utils";
import { ErrorState, LoadingState } from "./primitives";
import { usePortalFetch } from "./use-portal-fetch";

/**
 * Thread detail: the whole conversation, oldest to newest, inside a
 * capped scrollback so the reply box never leaves reach. ORBYT notes
 * carry the ember edge; the client's own notes sit indented. Reading
 * marks ORBYT messages as read (the API does that on GET), so there
 * are no invented read receipts here.
 */

type ThreadMessage = ThreadDetailPayload["messages"][number];

function MessageBlock({ message }: { message: ThreadMessage }) {
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
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          {formatDateTime(message.createdAt)}
        </p>
      </div>
      <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed">{message.body}</p>
    </div>
  );
}

export function CommandThreadDetail({ threadId }: { threadId: string }) {
  const { data, loading, failed, retry } = usePortalFetch<ThreadDetailPayload>(
    `/api/portal/messages/${threadId}`,
  );
  // Locally appended replies; null until the first send so the fetched
  // record stays the source of truth.
  const [appended, setAppended] = useState<ThreadMessage[] | null>(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [denied, setDenied] = useState(false);
  const [sendFailed, setSendFailed] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
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

  const messages = [...data.messages, ...(appended ?? [])];
  const canReply = data.identity.canWrite && !denied;

  async function sendReply() {
    const body = reply.trim();
    if (body.length < 2 || sending) return;
    setSending(true);
    setSendFailed(false);
    try {
      const response = await fetch(`/api/portal/messages/${threadId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      if (response.status === 403) {
        // Read-only seat: the composer steps aside for the explanation.
        setDenied(true);
        return;
      }
      if (!response.ok) {
        setSendFailed(true);
        return;
      }
      const payload = (await response.json()) as { message: ThreadMessage };
      setAppended([...(appended ?? []), payload.message]);
      setReply("");
    } catch {
      setSendFailed(true);
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
          href="/workspace/messages"
          className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground"
        >
          <span aria-hidden="true">&larr;</span>
          {COMMAND.nav.messages.label}
        </Link>
        <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.22em] text-primary">
          {COMMAND.messages.eyebrow}
        </p>
        <h1 className="mt-2 max-w-2xl font-display text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
          {data.thread.subject}
        </h1>
        {data.thread.projectTitle ? (
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            {data.thread.projectTitle}
          </p>
        ) : null}
      </motion.header>

      {/* Conversation scrollback: capped, so long threads stay usable. */}
      <div className="border border-border bg-card/50">
        <div ref={scrollRef} className="max-h-96 divide-y divide-border overflow-y-auto">
          {messages.map((message) => (
            <MessageBlock key={message.id} message={message} />
          ))}
        </div>
      </div>

      {canReply ? (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void sendReply();
          }}
          className="border border-border bg-card/50 p-5"
        >
          <div className="space-y-1.5">
            <Label htmlFor="thread-reply">{COMMAND.messages.composer.message}</Label>
            <Textarea
              id="thread-reply"
              rows={4}
              value={reply}
              onChange={(event) => setReply(event.target.value)}
              placeholder={COMMAND.messages.reply.placeholder}
              maxLength={4000}
              disabled={sending}
            />
          </div>
          {sendFailed ? (
            <p className="mt-3 border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
              {COMMAND.states.errorBody}
            </p>
          ) : null}
          <div className="mt-3 flex justify-end">
            <Button type="submit" size="sm" disabled={sending || reply.trim().length < 2}>
              {sending ? COMMAND.messages.reply.sending : COMMAND.messages.reply.send}
            </Button>
          </div>
        </form>
      ) : (
        <p className="border border-border bg-muted/40 px-4 py-3 text-sm leading-relaxed text-muted-foreground">
          {COMMAND.messages.viewerNote}
        </p>
      )}
    </div>
  );
}
