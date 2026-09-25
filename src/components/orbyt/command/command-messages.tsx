"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { COMMAND } from "@/content/command";
import { formatAge } from "@/lib/portal/domain";
import type { ProjectSummary, ThreadSummary } from "@/lib/portal/types";
import { cn } from "@/lib/utils";
import { EmptyState, ErrorState, LoadingState, PageHeader } from "./primitives";
import { usePortalFetch } from "./use-portal-fetch";

/**
 * Messages: project-linked conversations with the desk. The list is
 * the record; the composer opens a thread that lands on the desk and
 * in email. Unread markers come straight from the payload, never
 * invented on the client.
 */

const NO_PROJECT = "none";

/** The last-sender tag: ember when the desk spoke last, ink when you did. */
function SenderRoleTag({ role }: { role: string }) {
  const fromOrbyt = role === "ORBYT";
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em]",
        fromOrbyt
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-border bg-muted/40 text-muted-foreground",
      )}
    >
      {role}
    </span>
  );
}

function NewConversationDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [projectId, setProjectId] = useState(NO_PROJECT);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [projectsLoaded, setProjectsLoaded] = useState(false);
  const [sending, setSending] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [submitFailed, setSubmitFailed] = useState(false);

  // Project context is optional; the list loads the first time the
  // dialog opens. If it fails, the composer stays usable with
  // "No specific project" selected. Nothing is faked.
  useEffect(() => {
    if (!open || projectsLoaded) return;
    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch("/api/portal/projects");
        if (!response.ok) return;
        const payload = (await response.json()) as { projects: ProjectSummary[] };
        if (!cancelled) {
          setProjects(payload.projects);
          setProjectsLoaded(true);
        }
      } catch {
        // Left honest: only the no-project option is offered.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, projectsLoaded]);

  const canSubmit = subject.trim().length >= 3 && body.trim().length >= 2 && !sending;

  function reset() {
    setSubject("");
    setBody("");
    setProjectId(NO_PROJECT);
    setBlocked(false);
    setSubmitFailed(false);
  }

  async function submit() {
    setSending(true);
    setBlocked(false);
    setSubmitFailed(false);
    try {
      const response = await fetch("/api/portal/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject.trim(),
          body: body.trim(),
          ...(projectId !== NO_PROJECT ? { projectId } : {}),
        }),
      });
      if (response.status === 403) {
        // Read-only seat: the record explains itself.
        setBlocked(true);
        return;
      }
      if (!response.ok) {
        setSubmitFailed(true);
        return;
      }
      const payload = (await response.json()) as { threadId: string };
      toast({ title: COMMAND.messages.composer.sent });
      onOpenChange(false);
      reset();
      router.push(`/workspace/messages/${payload.threadId}`);
    } catch {
      setSubmitFailed(true);
    } finally {
      setSending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{COMMAND.messages.composer.newTitle}</DialogTitle>
          <DialogDescription>{COMMAND.messages.sub}</DialogDescription>
        </DialogHeader>
        {blocked ? (
          <p className="border border-border bg-muted/40 px-3 py-2.5 text-sm leading-relaxed text-muted-foreground">
            {COMMAND.messages.viewerNote}
          </p>
        ) : (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void submit();
            }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="thread-subject">{COMMAND.messages.composer.subject}</Label>
              <Input
                id="thread-subject"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                placeholder={COMMAND.messages.composer.subjectPlaceholder}
                maxLength={120}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="thread-project">{COMMAND.messages.composer.project}</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger id="thread-project" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_PROJECT}>
                    {COMMAND.messages.composer.projectNone}
                  </SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="thread-body">{COMMAND.messages.composer.message}</Label>
              <Textarea
                id="thread-body"
                rows={5}
                value={body}
                onChange={(event) => setBody(event.target.value)}
                placeholder={COMMAND.messages.composer.messagePlaceholder}
                maxLength={4000}
              />
            </div>

            {submitFailed ? (
              <p className="border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
                {COMMAND.states.errorBody}
              </p>
            ) : null}

            <div className="flex justify-end">
              <Button type="submit" disabled={!canSubmit}>
                {sending ? COMMAND.messages.composer.submitting : COMMAND.messages.composer.submit}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function CommandMessages() {
  const { data, loading, failed, retry } = usePortalFetch<{ threads: ThreadSummary[] }>(
    "/api/portal/messages",
  );
  const [composerOpen, setComposerOpen] = useState(false);
  const reduced = useReducedMotion();

  if (loading && !data) return <LoadingState />;
  if (failed && !data) return <ErrorState onRetry={retry} />;
  if (!data) return null;

  const threads = data.threads;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={COMMAND.messages.eyebrow}
        title={COMMAND.messages.title}
        sub={COMMAND.messages.sub}
        actions={
          <Button size="sm" onClick={() => setComposerOpen(true)}>
            {COMMAND.messages.composer.newButton}
          </Button>
        }
      />

      {threads.length === 0 ? (
        <EmptyState
          title={COMMAND.messages.emptyTitle}
          body={COMMAND.messages.empty}
          actionLabel={COMMAND.messages.composer.newButton}
          onAction={() => setComposerOpen(true)}
        />
      ) : (
        <ul role="list" className="divide-y divide-border border border-border bg-card/50">
          {threads.map((thread, index) => {
            const fromOrbyt = thread.lastSenderRole === "ORBYT";
            const unread = thread.unreadForClient > 0;
            return (
              <motion.li
                key={thread.id}
                initial={reduced ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: Math.min(index, 8) * 0.03, ease: "easeOut" }}
                className={cn(
                  fromOrbyt && "border-l-2 border-l-primary/50",
                  fromOrbyt && unread && "border-l-primary",
                )}
              >
                <Link
                  href={`/workspace/messages/${thread.id}`}
                  className="group block px-4 py-4 transition-colors hover:bg-accent/50 sm:px-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p
                          className={cn(
                            "truncate text-sm",
                            unread ? "font-bold text-foreground" : "font-semibold",
                          )}
                        >
                          {thread.subject}
                        </p>
                        {unread ? (
                          <span className="shrink-0 bg-primary px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-[#1B1B1A]">
                            {COMMAND.messages.threads.unread}
                          </span>
                        ) : null}
                        <SenderRoleTag role={thread.lastSenderRole} />
                      </div>
                      {thread.projectTitle ? (
                        <p className="mt-0.5 truncate font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                          {thread.projectTitle}
                        </p>
                      ) : null}
                      <p className="mt-0.5 truncate text-sm text-muted-foreground">
                        {thread.lastMessageBody}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        {formatAge(thread.lastMessageAt)}
                      </p>
                      <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                        {COMMAND.messages.threads.messages(thread.messageCount)}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.li>
            );
          })}
        </ul>
      )}

      <NewConversationDialog open={composerOpen} onOpenChange={setComposerOpen} />
    </div>
  );
}
