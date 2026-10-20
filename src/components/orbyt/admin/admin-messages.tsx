"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { STAFF } from "@/content/admin";
import { formatAge } from "@/lib/portal/domain";
import type { AdminThreadItem, AdminThreadsPayload } from "@/lib/admin/types";
import { cn } from "@/lib/utils";
import { ErrorState, LoadingState, PageHeader } from "@/components/orbyt/command/primitives";
import { usePortalFetch } from "@/components/orbyt/command/use-portal-fetch";
import { AreaField, ChoiceField, Field, OrgSelect, ProjectSelect, TextField } from "./admin-kit";

const COPY = STAFF.messages;

/** The closed set behind MessageThread.context: what a conversation hangs on. */
const CONTEXTS = ["PROJECT", "REQUEST", "APPROVAL", "DELIVERABLE", "MEETING", "GENERAL"] as const;
const CONTEXT_OPTIONS = CONTEXTS.map((context) => ({ value: context, label: context }));

/**
 * The desk opens the conversation, so the desk picks the client and
 * the optional project, then writes the first message on record.
 */
function NewThreadDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [orgId, setOrgId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [subject, setSubject] = useState("");
  const [context, setContext] = useState<string>("GENERAL");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  const canSubmit = orgId !== "" && subject.trim().length >= 3 && body.trim().length >= 2 && !busy;

  function reset() {
    setOrgId("");
    setProjectId("");
    setSubject("");
    setContext("GENERAL");
    setBody("");
  }

  async function submit() {
    if (!canSubmit) return;
    setBusy(true);
    try {
      const response = await fetch("/api/admin/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: orgId,
          ...(projectId ? { projectId } : {}),
          subject: subject.trim(),
          context,
          body: body.trim(),
        }),
      });
      if (response.ok) {
        const payload = (await response.json()) as { thread: AdminThreadItem };
        toast({ title: COPY.created });
        onOpenChange(false);
        reset();
        onCreated();
        router.push(`/admin/messages/${payload.thread.id}`);
      } else {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        toast({ title: payload?.error || STAFF.states.errorTitle });
      }
    } catch {
      toast({ title: STAFF.states.errorTitle });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{COPY.newTitle}</DialogTitle>
          <DialogDescription>{COPY.sub}</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
          className="space-y-4"
        >
          <Field id="admin-thread-org" label={COPY.clientLabel}>
            <OrgSelect
              id="admin-thread-org"
              value={orgId}
              onChange={(next) => {
                setOrgId(next);
                setProjectId("");
              }}
            />
          </Field>

          <Field id="admin-thread-project" label={COPY.projectLabel}>
            <ProjectSelect
              id="admin-thread-project"
              orgId={orgId}
              value={projectId}
              onChange={setProjectId}
            />
          </Field>

          <TextField id="admin-thread-subject" label={COPY.subjectLabel} value={subject} onChange={setSubject} />

          <ChoiceField
            id="admin-thread-context"
            label={COPY.contextLabel}
            value={context}
            onChange={setContext}
            options={CONTEXT_OPTIONS}
          />

          <AreaField id="admin-thread-body" label={COPY.firstMessageLabel} value={body} onChange={setBody} rows={4} />

          <DialogFooter>
            <Button type="submit" disabled={!canSubmit}>
              {busy ? COPY.creating : COPY.create}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Every conversation across clients. An ember edge means the client
 * spoke last and is waiting on the desk; the unread count comes from
 * the record, never invented here.
 */
export function AdminMessages() {
  const { data, loading, failed, retry, refresh } = usePortalFetch<AdminThreadsPayload>("/api/admin/messages");
  const [composerOpen, setComposerOpen] = useState(false);
  const reduced = useReducedMotion();

  if (loading && !data) return <LoadingState />;
  if (failed && !data) return <ErrorState onRetry={retry} />;
  if (!data) return null;

  const threads = data.threads;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={COPY.eyebrow}
        title={COPY.title}
        sub={COPY.sub}
        actions={
          <Button size="sm" onClick={() => setComposerOpen(true)}>
            {COPY.newThread}
          </Button>
        }
      />

      {threads.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-6 text-sm text-muted-foreground">
          {COPY.empty}
        </p>
      ) : (
        <ul role="list" className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card/60">
          {threads.map((thread, index) => {
            const clientWaiting = thread.lastSenderRole === "CLIENT";
            const unread = thread.unreadForClient > 0;
            return (
              <motion.li
                key={thread.id}
                initial={reduced ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: Math.min(index, 8) * 0.03, ease: "easeOut" }}
                className={cn("border-l-2 border-l-transparent", clientWaiting && "border-l-primary")}
              >
                <Link
                  href={`/admin/messages/${thread.id}`}
                  className="block px-4 py-4 transition-colors hover:bg-accent/50 sm:px-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                        {thread.organizationName} · {thread.clientId}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-semibold">{thread.subject}</p>
                        {unread ? (
                          <span className="shrink-0 bg-primary px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-[#1B1B1A]">
                            {thread.unreadForClient} {COPY.colUnread}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-0.5 truncate font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                        {thread.projectTitle ?? COPY.generalContext}
                      </p>
                      <p className="mt-0.5 truncate text-sm text-muted-foreground">{thread.lastMessageBody}</p>
                    </div>
                    <p className="shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      {formatAge(thread.updatedAt)}
                    </p>
                  </div>
                </Link>
              </motion.li>
            );
          })}
        </ul>
      )}

      <NewThreadDialog open={composerOpen} onOpenChange={setComposerOpen} onCreated={refresh} />
    </div>
  );
}
