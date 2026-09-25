"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { COMMAND } from "@/content/command";
import { formatDate } from "@/lib/portal/domain";
import type { ApprovalItem, ApprovalsPayload } from "@/lib/portal/types";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusBadge } from "./status-badge";
import { EmptyState, ErrorState, LoadingState, PageHeader, Section } from "./primitives";
import { usePortalFetch } from "./use-portal-fetch";
import { cn } from "@/lib/utils";

const COPY = COMMAND.approvals;

/** The closed set behind Approval.type (schema): what kind of thing is signed off. */
const TYPE_LABELS: Record<string, string> = {
  DELIVERABLE: "Deliverable",
  COPY: "Copy",
  CREATIVE: "Creative",
  DOCUMENT: "Document",
};

type Decision = "APPROVE" | "REQUEST_CHANGES";

/** The exact version on record. Ember while it waits, quiet once decided. */
function VersionChip({ version, pending = false }: { version: string; pending?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em]",
        pending ? "border-primary/40 bg-primary/10 text-primary" : "border-border text-muted-foreground",
      )}
    >
      {version}
    </span>
  );
}

function PendingCard({
  item,
  index,
  canWrite,
  busy,
  onApprove,
  onChanges,
}: {
  item: ApprovalItem;
  index: number;
  canWrite: boolean;
  busy: boolean;
  onApprove: (item: ApprovalItem) => void;
  onChanges: (item: ApprovalItem) => void;
}) {
  const reduced = useReducedMotion();
  const context = [item.projectTitle, item.deliverableTitle].filter(Boolean).join(" · ");

  return (
    <motion.li
      initial={reduced ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.03 * Math.min(index, 6), ease: "easeOut" }}
    >
      <div className="border border-border bg-card/50 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h3 className="font-display text-base font-bold leading-tight">{item.title}</h3>
            <VersionChip version={item.version} pending />
          </div>
          <time
            dateTime={item.submittedAt}
            className="shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground"
          >
            Submitted {formatDate(item.submittedAt)}
          </time>
        </div>

        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          {TYPE_LABELS[item.type] ?? item.type}
        </p>

        {item.description ? (
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">{item.description}</p>
        ) : null}

        {context ? (
          <p className="mt-3 border-l-2 border-primary/50 pl-3 text-sm text-muted-foreground">{context}</p>
        ) : null}

        {canWrite ? (
          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" disabled={busy} onClick={() => onApprove(item)}>
              {COPY.actions.approve}
            </Button>
            <Button size="sm" variant="outline" disabled={busy} onClick={() => onChanges(item)}>
              {COPY.actions.changes}
            </Button>
          </div>
        ) : null}
      </div>
    </motion.li>
  );
}

function DecidedRow({ item, index }: { item: ApprovalItem; index: number }) {
  const reduced = useReducedMotion();
  return (
    <motion.li
      initial={reduced ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.02 * Math.min(index, 8), ease: "easeOut" }}
      className="p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <h3 className="font-display text-base font-bold leading-tight">{item.title}</h3>
          <VersionChip version={item.version} />
        </div>
        {/* A decided approval is a record, not a toggle: the badge is the whole UI. */}
        <StatusBadge status={item.status} />
      </div>

      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
        {TYPE_LABELS[item.type] ?? item.type}
      </p>

      {item.decidedAt ? (
        <time
          dateTime={item.decidedAt}
          className="mt-3 block font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground"
        >
          {formatDate(item.decidedAt)}
        </time>
      ) : null}

      {item.decisionComment ? (
        <p className="mt-2 border-l-2 border-border pl-3 text-sm italic leading-relaxed text-muted-foreground">
          {`"${item.decisionComment}"`}
        </p>
      ) : null}
    </motion.li>
  );
}

/**
 * The approval center. Pending sign-offs first, then the decision
 * record. A decision is final: approve it and the version goes on
 * record; request changes and the comment travels to the crew. No
 * approver names are shown because the payload carries none.
 */
export function CommandApprovals() {
  const { data, loading, failed, retry, refresh } = usePortalFetch<ApprovalsPayload>("/api/portal/approvals");
  const { toast } = useToast();
  const [confirmFor, setConfirmFor] = useState<ApprovalItem | null>(null);
  const [commentFor, setCommentFor] = useState<ApprovalItem | null>(null);
  const [comment, setComment] = useState("");
  const [commentError, setCommentError] = useState(false);
  const [busy, setBusy] = useState(false);

  if (loading && !data) return <LoadingState />;
  if (failed && !data) return <ErrorState onRetry={retry} />;
  if (!data) return null;

  const canWrite = data.identity.canWrite;

  async function decide(item: ApprovalItem, decision: Decision, note = "") {
    setBusy(true);
    try {
      const response = await fetch(`/api/portal/approvals/${item.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, comment: note }),
      });
      if (response.ok) {
        toast({ title: decision === "APPROVE" ? "Approval recorded." : "Changes requested." });
        setConfirmFor(null);
        setCommentFor(null);
        setComment("");
        setCommentError(false);
        // Refetch without the loading flash: the card moves to the record.
        refresh();
      } else {
        let message = "That decision could not be recorded. Try again.";
        try {
          const payload = (await response.json()) as { error?: string };
          if (typeof payload.error === "string" && payload.error) message = payload.error;
        } catch {
          // Response had no JSON body; the fallback line stands.
        }
        toast({ title: message });
        setConfirmFor(null);
      }
    } catch {
      toast({ title: "That decision could not be recorded. Try again." });
    } finally {
      setBusy(false);
    }
  }

  function submitChanges() {
    if (!commentFor) return;
    const trimmed = comment.trim();
    if (trimmed.length < 4) {
      setCommentError(true);
      return;
    }
    setCommentError(false);
    void decide(commentFor, "REQUEST_CHANGES", trimmed);
  }

  return (
    <div>
      <PageHeader eyebrow={COPY.eyebrow} title={COPY.title} sub={COPY.sub} />

      {!canWrite ? (
        <p className="-mt-4 mb-8 border-l-2 border-primary/50 pl-3 text-xs leading-relaxed text-muted-foreground sm:mb-10">
          {COPY.viewerNote}
        </p>
      ) : null}

      <Section label={`${COPY.pending} · ${data.pending.length}`}>
        {data.pending.length === 0 ? (
          <EmptyState title={COPY.emptyTitle} body={COPY.empty} />
        ) : (
          <ul role="list" className="space-y-4">
            {data.pending.map((item, index) => (
              <PendingCard
                key={item.id}
                item={item}
                index={index}
                canWrite={canWrite}
                busy={busy}
                onApprove={setConfirmFor}
                onChanges={(target) => {
                  setComment("");
                  setCommentError(false);
                  setCommentFor(target);
                }}
              />
            ))}
          </ul>
        )}
      </Section>

      <Section label={`${COPY.history} · ${data.decided.length}`}>
        {data.decided.length === 0 ? (
          <div className="flex flex-col items-start gap-3 border border-dashed border-border bg-muted/30 px-6 py-10 sm:items-center sm:text-center">
            <span aria-hidden="true" className="font-mono text-lg text-primary/60">
              ◌
            </span>
            <p className="max-w-md font-display text-base font-semibold">{COPY.historyEmpty}</p>
          </div>
        ) : (
          <ul role="list" className="divide-y divide-border border border-border bg-card/50">
            {data.decided.map((item, index) => (
              <DecidedRow key={item.id} item={item} index={index} />
            ))}
          </ul>
        )}
      </Section>

      {/* Approve confirm: the record is one-way, so the click asks first. */}
      <AlertDialog
        open={confirmFor !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmFor(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{COPY.actions.confirmTitle}</AlertDialogTitle>
            <AlertDialogDescription>{COPY.actions.confirmBody}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>{COPY.actions.cancel}</AlertDialogCancel>
            <AlertDialogAction
              disabled={busy}
              className="text-[#1B1B1A]"
              onClick={(event) => {
                event.preventDefault();
                if (confirmFor) void decide(confirmFor, "APPROVE");
              }}
            >
              {busy ? COPY.actions.approving : COPY.actions.approve}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Request changes: the comment is the deliverable the crew acts on. */}
      <Dialog
        open={commentFor !== null}
        onOpenChange={(open) => {
          if (!open) {
            setCommentFor(null);
            setCommentError(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{COPY.actions.changes}</DialogTitle>
            <DialogDescription>
              {commentFor ? `${commentFor.title} ${commentFor.version}` : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="approval-change-comment">{COPY.actions.commentLabel}</Label>
            <Textarea
              id="approval-change-comment"
              value={comment}
              maxLength={1000}
              rows={3}
              placeholder={COPY.actions.commentPlaceholder}
              onChange={(event) => {
                setComment(event.target.value);
                if (commentError) setCommentError(false);
              }}
            />
            {commentError ? <p className="text-xs text-destructive">{COPY.actions.commentRequired}</p> : null}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" disabled={busy} onClick={() => setCommentFor(null)}>
              {COPY.actions.cancel}
            </Button>
            <Button size="sm" disabled={busy} onClick={submitChanges}>
              {busy ? COPY.actions.approving : COPY.actions.changes}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
