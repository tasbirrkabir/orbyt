"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { STAFF } from "@/content/admin";
import { formatAge } from "@/lib/portal/domain";
import type {
  AdminReportItem,
  AdminReportMetric,
  AdminReportSeries,
  AdminReportsPayload,
} from "@/lib/admin/types";
import { usePortalFetch } from "@/components/orbyt/command/use-portal-fetch";
import { EmptyState, ErrorState, LoadingState, PageHeader } from "@/components/orbyt/command/primitives";
import { StatusBadge } from "@/components/orbyt/command/status-badge";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AreaField, ChoiceField, Field, OrgSelect, TextField } from "./admin-kit";
import { cn } from "@/lib/utils";

const COPY = STAFF.reports;
const STATES = STAFF.states;

/** The closed sets behind Report.period and Report.status (schema). */
const PERIODS = ["7D", "30D", "90D"] as const;
const REPORT_STATUSES = ["READY", "NOT_CONNECTED"] as const;

const TAKA = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const COUNT = new Intl.NumberFormat("en-IN");

/** Metric numbers are recorded snapshots; formatting only, never recomputed. */
function formatMetricValue(value: number, unit?: string): string {
  if (unit === "BDT") return `৳${TAKA.format(value)}`;
  if (unit === "x") return `${value.toFixed(2)}x`;
  if (unit === "min") return `${COUNT.format(value)} min`;
  if (unit) return `${COUNT.format(value)} ${unit}`;
  return COUNT.format(value);
}

/**
 * One mutation helper for the room. Success answers { ok: true }; any
 * failure surfaces the API's own error line verbatim in a toast, so
 * the desk always reads the same words the server wrote.
 */
async function sendJson(
  url: string,
  method: string,
  body: unknown,
): Promise<{ ok: boolean; error: string }> {
  try {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (response.ok) return { ok: true, error: "" };
    let message: string = STATES.errorBody;
    try {
      const payload = (await response.json()) as { error?: unknown };
      if (typeof payload.error === "string" && payload.error) message = payload.error;
    } catch {
      // No JSON body; the fallback line stands.
    }
    return { ok: false, error: message };
  } catch {
    return { ok: false, error: STATES.errorBody };
  }
}

function MonoChip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex shrink-0 items-center border border-border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
      {children}
    </span>
  );
}

type Guard = (item: Record<string, unknown>) => boolean;

/** Parse a JSON array client-side; null means invalid, and the form never submits null. */
function parseJsonArray<T>(raw: string, guard: Guard): T[] | null {
  if (raw.trim() === "") return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    for (const item of parsed) {
      if (typeof item !== "object" || item === null || Array.isArray(item)) return null;
      if (!guard(item as Record<string, unknown>)) return null;
    }
    return parsed as T[];
  } catch {
    return null;
  }
}

function metricGuard(item: Record<string, unknown>): boolean {
  return (
    typeof item.key === "string" &&
    item.key.trim().length > 0 &&
    typeof item.label === "string" &&
    item.label.trim().length > 0 &&
    typeof item.value === "number"
  );
}

function seriesGuard(item: Record<string, unknown>): boolean {
  if (
    typeof item.key !== "string" ||
    item.key.trim().length === 0 ||
    typeof item.label !== "string" ||
    item.label.trim().length === 0 ||
    !Array.isArray(item.points) ||
    item.points.length === 0
  ) {
    return false;
  }
  return item.points.every(
    (point) =>
      typeof point === "object" &&
      point !== null &&
      !Array.isArray(point) &&
      typeof (point as Record<string, unknown>).label === "string" &&
      typeof (point as Record<string, unknown>).value === "number",
  );
}

function NewReportDialog({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [orgId, setOrgId] = useState("");
  const [title, setTitle] = useState("");
  const [period, setPeriod] = useState<string>("30D");
  const [status, setStatus] = useState<string>("NOT_CONNECTED");
  const [dataSource, setDataSource] = useState("");
  const [metricsText, setMetricsText] = useState("");
  const [seriesText, setSeriesText] = useState("");
  const [note, setNote] = useState("");
  const [metricsError, setMetricsError] = useState(false);
  const [seriesError, setSeriesError] = useState(false);

  async function submit() {
    if (busy) return;
    const metrics = parseJsonArray<AdminReportMetric>(metricsText, metricGuard);
    if (metrics === null) {
      setMetricsError(true);
      return;
    }
    const series = parseJsonArray<AdminReportSeries>(seriesText, seriesGuard);
    if (series === null) {
      setSeriesError(true);
      return;
    }
    setMetricsError(false);
    setSeriesError(false);
    if (orgId === "" || title.trim().length < 3) return;
    setBusy(true);
    const result = await sendJson("/api/admin/reports", "POST", {
      organizationId: orgId,
      title: title.trim(),
      period,
      status,
      dataSource: dataSource.trim(),
      metrics,
      series,
      note: note.trim(),
    });
    setBusy(false);
    if (result.ok) {
      toast({ title: COPY.published });
      onDone();
    } else {
      toast({ title: result.error });
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{COPY.newTitle}</DialogTitle>
          <DialogDescription>{COPY.sub}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Field id="report-add-org" label={COPY.clientLabel}>
            <OrgSelect id="report-add-org" value={orgId} onChange={setOrgId} />
          </Field>
          <TextField id="report-add-title" label={COPY.titleLabel} value={title} onChange={setTitle} />
          <div className="grid gap-4 sm:grid-cols-2">
            <ChoiceField
              id="report-add-period"
              label={COPY.periodLabel}
              value={period}
              onChange={setPeriod}
              options={PERIODS}
            />
            <ChoiceField
              id="report-add-status"
              label={COPY.statusLabel}
              value={status}
              onChange={setStatus}
              options={REPORT_STATUSES}
            />
          </div>
          <TextField
            id="report-add-source"
            label={COPY.sourceLabel}
            value={dataSource}
            onChange={setDataSource}
          />
          <div className="space-y-1.5">
            <AreaField
              id="report-add-metrics"
              label={COPY.metricsLabel}
              value={metricsText}
              onChange={(value) => {
                setMetricsText(value);
                if (metricsError) setMetricsError(false);
              }}
              placeholder={COPY.metricsHint}
              rows={4}
            />
            {metricsError ? <p className="text-xs text-destructive">{COPY.invalidMetrics}</p> : null}
          </div>
          <div className="space-y-1.5">
            <AreaField
              id="report-add-series"
              label={COPY.seriesLabel}
              value={seriesText}
              onChange={(value) => {
                setSeriesText(value);
                if (seriesError) setSeriesError(false);
              }}
              placeholder={COPY.seriesHint}
              rows={4}
            />
            {seriesError ? <p className="text-xs text-destructive">{COPY.invalidMetrics}</p> : null}
          </div>
          <AreaField id="report-add-note" label={COPY.noteLabel} value={note} onChange={setNote} rows={2} />
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" disabled={busy} onClick={onClose}>
            {STATES.cancel}
          </Button>
          <Button size="sm" disabled={busy} onClick={submit}>
            {busy ? COPY.creating : COPY.create}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditReportDialog({
  report,
  onClose,
  onDone,
}: {
  report: AdminReportItem;
  onClose: () => void;
  onDone: () => void;
}) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [title, setTitle] = useState(report.title);
  const [period, setPeriod] = useState<string>(report.period);
  const [status, setStatus] = useState<string>(report.status);
  const [dataSource, setDataSource] = useState(report.dataSource);
  const [note, setNote] = useState(report.note);

  const canSubmit = title.trim().length >= 3;

  async function submit() {
    if (!canSubmit || busy) return;
    setBusy(true);
    const result = await sendJson(`/api/admin/reports/${report.id}`, "PATCH", {
      title: title.trim(),
      period,
      status,
      dataSource: dataSource.trim(),
      note: note.trim(),
    });
    setBusy(false);
    if (result.ok) {
      toast({ title: COPY.saved });
      onDone();
    } else {
      toast({ title: result.error });
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{COPY.editTitle}</DialogTitle>
          <DialogDescription>
            {report.title} · {report.organizationName}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <TextField id="report-edit-title" label={COPY.titleLabel} value={title} onChange={setTitle} />
          <div className="grid gap-4 sm:grid-cols-2">
            <ChoiceField
              id="report-edit-period"
              label={COPY.periodLabel}
              value={period}
              onChange={setPeriod}
              options={PERIODS}
            />
            <ChoiceField
              id="report-edit-status"
              label={COPY.statusLabel}
              value={status}
              onChange={setStatus}
              options={REPORT_STATUSES}
            />
          </div>
          <TextField
            id="report-edit-source"
            label={COPY.sourceLabel}
            value={dataSource}
            onChange={setDataSource}
          />
          <AreaField id="report-edit-note" label={COPY.noteLabel} value={note} onChange={setNote} rows={2} />
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" disabled={busy} onClick={onClose}>
            {STATES.cancel}
          </Button>
          <Button size="sm" disabled={!canSubmit || busy} onClick={submit}>
            {busy ? STATES.working : COPY.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ReportRow({
  report,
  onSaved,
}: {
  report: AdminReportItem;
  onSaved: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const hasDetail = report.metrics.length > 0 || report.note.length > 0;

  return (
    <li className="p-5">
      <div className="flex items-start justify-between gap-3">
        {hasDetail ? (
          <button
            type="button"
            className="min-w-0 flex-1 text-left"
            aria-expanded={expanded}
            onClick={() => setExpanded((value) => !value)}
          >
            <RowHead report={report} />
          </button>
        ) : (
          <div className="min-w-0 flex-1">
            <RowHead report={report} />
          </div>
        )}
        <div className="flex shrink-0 items-center gap-2">
          <StatusBadge status={report.status} />
          {hasDetail ? (
            <ChevronDown
              aria-hidden="true"
              className={cn("size-4 text-muted-foreground transition-transform", expanded && "rotate-180")}
            />
          ) : null}
        </div>
      </div>

      {expanded && hasDetail ? (
        <div className="mt-4 space-y-3 border-t border-border pt-4">
          {report.metrics.length > 0 ? (
            <ul role="list" className="space-y-1.5">
              {report.metrics.map((metric, index) => (
                <li
                  key={`${metric.key}-${index}`}
                  className="flex flex-wrap items-baseline gap-2 text-sm"
                >
                  <span className="font-medium">{metric.label}</span>
                  <span className="font-mono tabular-nums text-muted-foreground">
                    {formatMetricValue(metric.value, metric.unit)}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
          {report.note ? (
            <p className="border-l-2 border-border pl-3 text-sm italic leading-relaxed text-muted-foreground">
              {report.note}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="mt-4">
        <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
          {COPY.editTitle}
        </Button>
      </div>

      {editing ? (
        <EditReportDialog
          report={report}
          onClose={() => setEditing(false)}
          onDone={() => {
            setEditing(false);
            onSaved();
          }}
        />
      ) : null}
    </li>
  );
}

function RowHead({ report }: { report: AdminReportItem }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
        {report.organizationName} · {report.clientId}
      </p>
      <span className="mt-1 flex flex-wrap items-center gap-2">
        <span className="font-display text-base font-bold leading-tight">{report.title}</span>
        <MonoChip>{report.period}</MonoChip>
      </span>
      <p className="mt-1 font-mono text-xs text-muted-foreground">
        {report.updatedAt ? formatAge(report.updatedAt) : ""}
        {report.dataSource ? ` · ${report.dataSource}` : ""}
      </p>
    </div>
  );
}

/**
 * Performance reports across tenants. Metrics and series are recorded
 * snapshots the desk publishes exactly as captured; a report with no
 * source stays Not connected and shows no numbers at all.
 */
export function AdminReports() {
  const { data, loading, failed, retry, refresh } =
    usePortalFetch<AdminReportsPayload>("/api/admin/reports");
  const [creating, setCreating] = useState(false);

  if (loading && !data) return <LoadingState />;
  if (failed && !data) return <ErrorState onRetry={retry} />;
  if (!data) return null;

  return (
    <div>
      <PageHeader
        eyebrow={COPY.eyebrow}
        title={COPY.title}
        sub={COPY.sub}
        actions={
          <Button size="sm" onClick={() => setCreating(true)}>
            {COPY.newReport}
          </Button>
        }
      />

      <section aria-label={COPY.title}>
        {data.reports.length === 0 ? (
          <EmptyState
            title={COPY.title}
            body={COPY.empty}
            actionLabel={COPY.newReport}
            onAction={() => setCreating(true)}
          />
        ) : (
          <ul role="list" className="divide-y divide-border border border-border bg-card/50">
            {data.reports.map((report) => (
              <ReportRow key={report.id} report={report} onSaved={refresh} />
            ))}
          </ul>
        )}
      </section>

      {creating ? (
        <NewReportDialog
          onClose={() => setCreating(false)}
          onDone={() => {
            setCreating(false);
            refresh();
          }}
        />
      ) : null}
    </div>
  );
}
