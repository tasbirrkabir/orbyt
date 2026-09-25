"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { COMMAND } from "@/content/command";
import { CATEGORY_LABELS, formatAge } from "@/lib/portal/domain";
import type { FileItem, FilesPayload } from "@/lib/portal/types";
import { cn } from "@/lib/utils";
import { EmptyState, ErrorState, LoadingState, PageHeader } from "./primitives";
import { StatusBadge } from "./status-badge";
import { usePortalFetch } from "./use-portal-fetch";

/**
 * Files: the honest index. Files travel by email; this room records
 * what was sent, when, and in which version. A row links out only when
 * a real, client-reachable URL exists in the payload. No fake
 * downloads, ever.
 */

function formatSize(sizeKb: number): string {
  return sizeKb < 1024 ? `${sizeKb} KB` : `${(sizeKb / 1024).toFixed(1)} MB`;
}

function MobileLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground sm:hidden">
      {children}
    </p>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors",
        active
          ? "border-primary/50 text-primary underline underline-offset-4"
          : "border-border text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function FileRow({ file, index, reduced }: { file: FileItem; index: number; reduced: boolean | null }) {
  return (
    <motion.li
      initial={reduced ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index, 8) * 0.03, ease: "easeOut" }}
      className="border-b border-border px-4 py-4 last:border-b-0 sm:px-5"
    >
      <div className="grid gap-3 sm:grid-cols-12 sm:items-center sm:gap-4">
        {/* Name + kind, project context underneath */}
        <div className="min-w-0 sm:col-span-3">
          <p className="truncate font-mono text-sm font-medium">
            {file.name}
            <span className="font-normal text-muted-foreground"> · {file.kind}</span>
          </p>
          {file.projectTitle ? (
            <p className="mt-0.5 truncate font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              {file.projectTitle}
            </p>
          ) : null}
        </div>

        <div className="sm:col-span-1">
          <MobileLabel>{COMMAND.files.labels.version}</MobileLabel>
          <p className="mt-0.5 inline-flex border border-border bg-muted/40 px-1.5 py-0.5 font-mono text-[10px] tracking-[0.08em] sm:mt-0">
            {file.version}
          </p>
        </div>

        <div className="sm:col-span-2">
          <MobileLabel>{COMMAND.files.labels.category}</MobileLabel>
          <p className="mt-0.5 text-sm sm:mt-0">{CATEGORY_LABELS[file.category] ?? file.category}</p>
        </div>

        <div className="sm:col-span-2">
          <MobileLabel>{COMMAND.files.labels.status}</MobileLabel>
          <p className="mt-1 sm:mt-0">
            <StatusBadge status={file.status} />
          </p>
        </div>

        <div className="sm:col-span-1">
          <MobileLabel>{COMMAND.files.labels.size}</MobileLabel>
          <p className="mt-0.5 font-mono text-xs tabular-nums sm:mt-0">{formatSize(file.sizeKb)}</p>
        </div>

        <div className="sm:col-span-2">
          <MobileLabel>{COMMAND.files.labels.by}</MobileLabel>
          <p className="mt-0.5 truncate text-sm sm:mt-0">{file.uploadedBy}</p>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            {formatAge(file.uploadedAt)}
          </p>
        </div>

        {/* Only a real link earns the Open action. */}
        <div className="sm:col-span-1 sm:text-right">
          {file.link ? (
            <a
              href={file.link}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-[11px] uppercase tracking-[0.14em] text-primary underline-offset-4 hover:underline"
            >
              {COMMAND.files.labels.open}
            </a>
          ) : null}
        </div>
      </div>
    </motion.li>
  );
}

export function CommandFiles() {
  const { data, loading, failed, retry } = usePortalFetch<FilesPayload>("/api/portal/files");
  const [active, setActive] = useState<string | null>(null);
  const reduced = useReducedMotion();

  if (loading && !data) return <LoadingState />;
  if (failed && !data) return <ErrorState onRetry={retry} />;
  if (!data) return null;

  const files = data.files;
  const categories = [...new Set(files.map((file) => file.category))];
  // A filter that no longer matches anything (refresh swapped the list)
  // falls back to the honest full index.
  const current = active && categories.includes(active) ? active : null;
  const filtered = current ? files.filter((file) => file.category === current) : files;
  const anyLink = files.some((file) => file.link !== null);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow={COMMAND.files.eyebrow} title={COMMAND.files.title} sub={COMMAND.files.sub} />

      {/* The honesty note: how files actually travel. */}
      <p className="border border-border border-l-2 border-l-primary bg-muted/40 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
        {COMMAND.files.note}
      </p>

      {files.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2" role="group">
          <FilterChip active={current === null} onClick={() => setActive(null)}>
            {COMMAND.files.filters.all}
          </FilterChip>
          {categories.map((category) => (
            <FilterChip
              key={category}
              active={current === category}
              onClick={() => setActive(category)}
            >
              {CATEGORY_LABELS[category] ?? category}
            </FilterChip>
          ))}
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <EmptyState title={COMMAND.files.emptyTitle} body={COMMAND.files.empty} />
      ) : (
        <div className="border border-border bg-card/50">
          {/* Desktop column headers; mobile rows carry their own labels. */}
          <div className="hidden gap-4 border-b border-border px-5 pb-2.5 pt-4 font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground sm:grid sm:grid-cols-12">
            <p className="col-span-3">{COMMAND.files.labels.name}</p>
            <p className="col-span-1">{COMMAND.files.labels.version}</p>
            <p className="col-span-2">{COMMAND.files.labels.category}</p>
            <p className="col-span-2">{COMMAND.files.labels.status}</p>
            <p className="col-span-1">{COMMAND.files.labels.size}</p>
            <p className="col-span-2">{COMMAND.files.labels.by}</p>
            <p className="col-span-1 text-right">{anyLink ? COMMAND.files.labels.open : ""}</p>
          </div>
          <ul role="list">
            {filtered.map((file, index) => (
              <FileRow key={file.id} file={file} index={index} reduced={reduced} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
