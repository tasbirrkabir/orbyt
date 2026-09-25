"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { COMMAND } from "@/content/command";
import { formatDateTime } from "@/lib/portal/domain";
import type { ReportMetric, ReportPayload, ReportSeries } from "@/lib/portal/types";
import { StatusBadge } from "./status-badge";
import { EmptyState, ErrorState, LoadingState, PageHeader } from "./primitives";
import { usePortalFetch } from "./use-portal-fetch";

const COPY = COMMAND.reports;

type ReportRow = ReportPayload["reports"][number];

function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`border border-border bg-card/50 p-5 ${className ?? ""}`}>{children}</div>
  );
}

/**
 * Report metric values are stored in raw taka (210000 = ৳210,000), not
 * cents, so reports carry their own formatter instead of formatMoney.
 */
const TAKA = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const COUNT = new Intl.NumberFormat("en-IN");

function formatMetricValue(value: number, unit: string): string {
  if (unit === "BDT") return `৳${TAKA.format(value)}`;
  if (unit === "x") return `${value.toFixed(2)}x`;
  if (unit === "min") return `${COUNT.format(value)} min`;
  return COUNT.format(value);
}

/** The standing question for a metric key; the payload's own question as fallback. */
function questionFor(metric: ReportMetric): string {
  const standing = (COPY.questions as Record<string, string>)[metric.key.toLowerCase()];
  return standing ?? metric.question;
}

/** The 7D/30D/90D chip, with the spelled-out period as its accessible label. */
function PeriodChip({ period }: { period: string }) {
  const spelled = (COPY.periods as Record<string, string>)[period] ?? period;
  return (
    <span
      title={spelled}
      aria-label={spelled}
      className="inline-flex shrink-0 items-center border border-border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground"
    >
      {period}
    </span>
  );
}

/** One metric: value, the previous period as plain text, and the question it answers. */
function MetricCard({ metric }: { metric: ReportMetric }) {
  return (
    <div className="flex flex-col border border-border bg-background/40 p-4">
      <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
        {metric.label}
      </p>
      <p className="mt-2 font-display text-xl font-bold tabular-nums sm:text-2xl">
        {formatMetricValue(metric.value, metric.unit)}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Previous: {formatMetricValue(metric.prev, metric.unit)}
      </p>
      <p className="mt-auto pt-3 text-xs leading-relaxed text-muted-foreground/70">
        {questionFor(metric)}
      </p>
    </div>
  );
}

/**
 * One series, one chart. Ink grid, ember line, dark tooltip, no
 * decoration: the area rises from zero so the shape never lies.
 */
function SeriesChart({ series, index }: { series: ReportSeries; index: number }) {
  const reduced = useReducedMotion();
  return (
    <motion.figure
      initial={reduced ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.04 * Math.min(index, 4), ease: "easeOut" }}
      className="border border-border bg-background/40 p-4"
    >
      <figcaption className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
        {series.label} · {series.unit}
      </figcaption>
      <div className="mt-3">
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={series.points} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
              tickLine={false}
              axisLine={{ stroke: "var(--border)" }}
              tickMargin={6}
            />
            <YAxis
              domain={[0, "auto"]}
              tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              tickMargin={2}
            />
            <Tooltip
              cursor={{ stroke: "var(--border)" }}
              content={({ active, payload, label }) => {
                if (!active || !payload || payload.length === 0) return null;
                const raw: unknown = payload[0]?.value;
                const value = typeof raw === "number" ? raw : Number(raw ?? 0);
                return (
                  <div className="border border-border bg-[#161615] px-2.5 py-1.5 font-mono text-xs">
                    <p className="text-foreground">{String(label ?? "")}</p>
                    <p className="mt-0.5 text-muted-foreground">
                      {series.label}: {formatMetricValue(value, series.unit)}
                    </p>
                  </div>
                );
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              name={series.label}
              stroke="var(--chart-1)"
              strokeWidth={1.5}
              fill="var(--chart-1)"
              fillOpacity={0.1}
              isAnimationActive={!reduced}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.figure>
  );
}

/** A live report: period chip, honest sample-data note, metrics, then the series. */
function ReadyReport({ report, index }: { report: ReportRow; index: number }) {
  const reduced = useReducedMotion();
  return (
    <motion.article
      initial={reduced ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 * Math.min(index, 4), ease: "easeOut" }}
    >
      <Panel>
        <div className="flex flex-wrap items-center gap-2.5">
          <h2 className="font-display text-lg font-bold leading-tight">{report.title}</h2>
          <PeriodChip period={report.period} />
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          {report.updatedAt ? (
            <time dateTime={report.updatedAt}>
              {COPY.updated} {formatDateTime(report.updatedAt)}
            </time>
          ) : null}
          {report.dataSource ? (
            <span>
              {COPY.dataSource} · {report.dataSource}
            </span>
          ) : null}
        </div>

        {/* The honest disclaimer: these are sample numbers until the crew wires live sources. */}
        <p className="mt-4 border border-border bg-muted/40 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
          {COPY.sampleNote}
        </p>

        {report.metrics.length > 0 ? (
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {report.metrics.map((metric) => (
              <MetricCard key={metric.key} metric={metric} />
            ))}
          </div>
        ) : null}

        {report.series.length > 0 ? (
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {report.series.map((series, seriesIndex) => (
              <SeriesChart key={series.key} series={series} index={seriesIndex} />
            ))}
          </div>
        ) : null}
      </Panel>
    </motion.article>
  );
}

/** A report with no wired source: words only, zero invented numbers. */
function WaitingReport({ report, index }: { report: ReportRow; index: number }) {
  const reduced = useReducedMotion();
  return (
    <motion.article
      initial={reduced ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 * Math.min(index, 4), ease: "easeOut" }}
    >
      <Panel className="bg-transparent">
        <div className="flex flex-wrap items-center gap-2.5">
          <h2 className="font-display text-lg font-bold leading-tight">{report.title}</h2>
          <PeriodChip period={report.period} />
          <StatusBadge status={report.status} />
        </div>
        <p className="mt-4 font-display text-base font-semibold">{COPY.notConnectedTitle}</p>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {COPY.notConnected}
        </p>
      </Panel>
    </motion.article>
  );
}

/**
 * The Reports room. READY reports show their stored snapshot with the
 * sample-data disclaimer; NOT_CONNECTED reports show copy and a status
 * badge and nothing else. Charts render only from series points.
 */
export function CommandReports() {
  const { data, loading, failed, retry } = usePortalFetch<ReportPayload>("/api/portal/reports");

  if (loading && !data) return <LoadingState />;
  if (failed && !data) return <ErrorState onRetry={retry} />;
  if (!data) return null;

  return (
    <div>
      <PageHeader eyebrow={COPY.eyebrow} title={COPY.title} sub={COPY.sub} />

      {data.reports.length === 0 ? <EmptyState title={COPY.emptyTitle} body={COPY.empty} /> : null}

      <div className="space-y-8">
        {data.reports.map((report, index) =>
          report.status === "READY" ? (
            <ReadyReport key={report.id} report={report} index={index} />
          ) : (
            <WaitingReport key={report.id} report={report} index={index} />
          ),
        )}
      </div>
    </div>
  );
}
