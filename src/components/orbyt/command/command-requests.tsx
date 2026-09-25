"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { COMMAND } from "@/content/command";
import { CATEGORY_LABELS, formatAge, PROJECT_TYPE_LABELS } from "@/lib/portal/domain";
import type { ProjectSummary, RequestItem } from "@/lib/portal/types";
import { usePortalFetch } from "./use-portal-fetch";
import { EmptyState, ErrorState, LoadingState, PageHeader } from "./primitives";
import { StatusBadge } from "./status-badge";
import { cn } from "@/lib/utils";

const CATEGORIES = ["WEBSITE", "DESIGN", "MARKETING", "TRACKING", "AUTOMATION", "AI", "TECHNICAL", "OTHER"] as const;
const PRIORITIES = ["NORMAL", "IMPORTANT", "URGENT"] as const;

type Filter = "all" | "open" | "waiting" | "closed";

const OPEN_STATUSES = ["SUBMITTED", "REVIEWING", "IN_PROGRESS"];
const CLOSED_STATUSES = ["COMPLETED", "CLOSED"];

function NewRequestDialog({
  open,
  onOpenChange,
  onFiled,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFiled: () => void;
}) {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>("OTHER");
  const [priority, setPriority] = useState<string>("NORMAL");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState<string>("none");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    let active = true;
    void (async () => {
      try {
        const response = await fetch("/api/portal/projects");
        if (response.ok && active) {
          const payload = (await response.json()) as { projects: ProjectSummary[] };
          setProjects(payload.projects);
        }
      } catch {
        // No project context then; the request still files fine.
      }
    })();
    return () => {
      active = false;
    };
  }, [open]);

  const reset = () => {
    setTitle("");
    setCategory("OTHER");
    setPriority("NORMAL");
    setDescription("");
    setProjectId("none");
    setError("");
  };

  const submit = async () => {
    setError("");
    if (title.trim().length < 4) {
      setError(COMMAND.requests.fields.title);
      return;
    }
    if (description.trim().length < 10) {
      setError(COMMAND.requests.fields.description);
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch("/api/portal/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          category,
          priority,
          description: description.trim(),
          ...(projectId !== "none" ? { projectId } : {}),
        }),
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      if (response.status === 201) {
        toast("Request filed.");
        reset();
        onOpenChange(false);
        onFiled();
      } else {
        setError(payload?.error ?? COMMAND.states.errorBody);
      }
    } catch {
      setError(COMMAND.states.errorBody);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto border-border bg-background sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-lg font-bold">{COMMAND.requests.newTitle}</DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
            {COMMAND.requests.newSub}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="request-title">{COMMAND.requests.fields.title}</Label>
            <Input
              id="request-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={COMMAND.requests.fields.titlePlaceholder}
              maxLength={120}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>{COMMAND.requests.fields.category}</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger aria-label={COMMAND.requests.fields.category}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {CATEGORY_LABELS[item]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{COMMAND.requests.fields.project}</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger aria-label={COMMAND.requests.fields.project}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{COMMAND.requests.fields.projectNone}</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">{COMMAND.requests.fields.priority}</legend>
            <RadioGroup value={priority} onValueChange={setPriority} className="grid gap-2 sm:grid-cols-3">
              {PRIORITIES.map((item) => (
                <Label
                  key={item}
                  htmlFor={`priority-${item}`}
                  className={cn(
                    "flex cursor-pointer flex-col gap-1 border p-3 text-sm font-normal transition-colors",
                    priority === item ? "border-primary bg-primary/5" : "border-border hover:bg-accent/50",
                  )}
                >
                  <span className="flex items-center gap-2">
                    <RadioGroupItem id={`priority-${item}`} value={item} />
                    <span className="font-mono text-[11px] uppercase tracking-[0.14em]">
                      {COMMAND.requests.priorities[item]}
                    </span>
                  </span>
                  <span className="pl-6 text-xs text-muted-foreground">{COMMAND.requests.priorityHints[item]}</span>
                </Label>
              ))}
            </RadioGroup>
          </fieldset>

          <div className="space-y-1.5">
            <Label htmlFor="request-description">{COMMAND.requests.fields.description}</Label>
            <Textarea
              id="request-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder={COMMAND.requests.fields.descriptionPlaceholder}
              rows={5}
              maxLength={4000}
            />
          </div>

          {error ? (
            <p role="status" className="border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-foreground">
              {error}
            </p>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            {COMMAND.approvals.actions.cancel}
          </Button>
          <Button onClick={() => void submit()} disabled={submitting} className="text-[#1B1B1A]">
            {submitting ? COMMAND.requests.fields.submitting : COMMAND.requests.fields.submit}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "open", label: "Open" },
  { key: "waiting", label: "Waiting for you" },
  { key: "closed", label: "Closed" },
];

export function CommandRequests() {
  const { data, loading, failed, refresh, retry } = usePortalFetch<{ requests: RequestItem[] }>("/api/portal/requests");
  const [filter, setFilter] = useState<Filter>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const reduced = useReducedMotion();
  const router = useRouter();

  const filtered = useMemo(() => {
    const requests = data?.requests ?? [];
    if (filter === "open") return requests.filter((r) => OPEN_STATUSES.includes(r.status));
    if (filter === "waiting") return requests.filter((r) => r.status === "WAITING_FOR_CLIENT");
    if (filter === "closed") return requests.filter((r) => CLOSED_STATUSES.includes(r.status));
    return requests;
  }, [data, filter]);

  return (
    <div>
      <PageHeader
        eyebrow={COMMAND.requests.eyebrow}
        title={COMMAND.requests.title}
        sub={COMMAND.requests.sub}
        actions={
          <Button onClick={() => setDialogOpen(true)} className="text-[#1B1B1A]">
            {COMMAND.requests.newButton}
          </Button>
        }
      />

      {loading && !data ? (
        <LoadingState />
      ) : failed && !data ? (
        <ErrorState onRetry={retry} />
      ) : (
        <>
          <div className="mb-5 flex flex-wrap gap-1.5" role="tablist" aria-label={COMMAND.requests.title}>
            {FILTERS.map((item) => (
              <button
                key={item.key}
                type="button"
                role="tab"
                aria-selected={filter === item.key}
                onClick={() => setFilter(item.key)}
                className={cn(
                  "border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors",
                  filter === item.key
                    ? "border-primary/50 bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            data && data.requests.length === 0 && filter === "all" ? (
              <EmptyState
                title={COMMAND.requests.emptyTitle}
                body={COMMAND.requests.empty}
                actionLabel={COMMAND.requests.newButton}
                onAction={() => setDialogOpen(true)}
              />
            ) : (
              <EmptyState title="Nothing under this filter." body="Switch filters to see the rest." />
            )
          ) : (
            <ul role="list" className="divide-y divide-border border border-border bg-card/50">
              {filtered.map((request, index) => (
                <motion.li
                  key={request.id}
                  initial={reduced ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: Math.min(index * 0.03, 0.3), ease: "easeOut" }}
                >
                  <Link
                    href={`/workspace/requests/${request.id}`}
                    className="group block px-5 py-4 transition-colors hover:bg-accent/50"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span className="shrink-0 font-mono text-[11px] uppercase tracking-[0.12em] text-primary">
                          {request.code}
                        </span>
                        <p className="min-w-0 truncate text-sm font-semibold">{request.title}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {request.priority === "URGENT" ? (
                          <StatusBadge status="URGENT" />
                        ) : (
                          <span className="hidden font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground sm:inline">
                            {COMMAND.requests.priorities[request.priority as keyof typeof COMMAND.requests.priorities]}
                          </span>
                        )}
                        <StatusBadge status={request.status} />
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {CATEGORY_LABELS[request.category] ?? request.category}
                      {request.projectTitle ? ` · ${request.projectTitle}` : ""}
                      {request.commentCount > 0 ? ` · ${request.commentCount} ${request.commentCount === 1 ? "reply" : "replies"}` : ""}
                      {" · "}
                      {COMMAND.requests.detail.updated} {formatAge(request.updatedAt)}
                    </p>
                  </Link>
                </motion.li>
              ))}
            </ul>
          )}

          <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
            {COMMAND.requests.detail.slaNote}
          </p>
        </>
      )}

      <NewRequestDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onFiled={() => {
          refresh();
          router.refresh();
        }}
      />
    </div>
  );
}
