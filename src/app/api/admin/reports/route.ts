import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { adminRoute, readJson } from "@/lib/admin/api";
import { recordStaffActivity, recordStaffAudit, recordStaffNotification } from "@/lib/admin/records";
import type { AdminReportItem, AdminReportsPayload } from "@/lib/admin/types";

/**
 * GET  /api/admin/reports (staff only)
 * POST /api/admin/reports (staff only)
 *
 * GET lists every report across tenants with parsed metrics/series.
 * POST publishes one: metrics and series are stored as JSON snapshots
 * exactly as the desk recorded them. NOT_CONNECTED reports carry no
 * numbers anywhere; that is the point.
 *   GET  200 { reports: AdminReportItem[] }
 *   POST 201 { report: AdminReportItem }
 */

const metricSchema = z.object({
  key: z.string().trim().min(1).max(40),
  label: z.string().trim().min(1).max(80),
  value: z.number(),
  prev: z.number().optional(),
  unit: z.string().trim().max(12).optional(),
  question: z.string().trim().max(200).optional(),
});

const seriesSchema = z.object({
  key: z.string().trim().min(1).max(40),
  label: z.string().trim().min(1).max(80),
  unit: z.string().trim().max(12).optional(),
  points: z.array(z.object({ label: z.string().trim().max(20), value: z.number() })).min(1).max(64),
});

function parseJsonArray<T>(json: string, guard: (value: unknown) => T[] | null): T[] {
  try {
    const parsed: unknown = JSON.parse(json);
    return guard(parsed) ?? [];
  } catch {
    return [];
  }
}

const asMetrics = (value: unknown): AdminReportItem["metrics"] | null => {
  const result = z.array(metricSchema).safeParse(value);
  return result.success ? result.data : null;
};

const asSeries = (value: unknown): AdminReportItem["series"] | null => {
  const result = z.array(seriesSchema).safeParse(value);
  return result.success ? result.data : null;
};

function mapReport(row: {
  id: string;
  organizationId: string;
  organization?: { name: string; clientId: string };
  title: string;
  period: string;
  status: string;
  dataSource: string;
  metricsJson: string;
  seriesJson: string;
  note: string;
  updatedAt: Date;
}): AdminReportItem {
  return {
    id: row.id,
    organizationId: row.organizationId,
    organizationName: row.organization?.name ?? "",
    clientId: row.organization?.clientId ?? "",
    title: row.title,
    period: row.period,
    status: row.status,
    dataSource: row.dataSource,
    metrics: parseJsonArray(row.metricsJson, asMetrics),
    series: parseJsonArray(row.seriesJson, asSeries),
    note: row.note,
    updatedAt: row.updatedAt.toISOString(),
  };
}

const REPORT_STATUSES = ["READY", "NOT_CONNECTED"] as const;
const PERIODS = ["7D", "30D", "90D"] as const;

const createSchema = z.object({
  organizationId: z.string().trim().min(1),
  title: z.string().trim().min(3).max(140),
  period: z.enum(PERIODS).default("30D"),
  status: z.enum(REPORT_STATUSES).default("NOT_CONNECTED"),
  dataSource: z.string().trim().max(120).default(""),
  metrics: z.array(metricSchema).max(16).default([]),
  series: z.array(seriesSchema).max(8).default([]),
  note: z.string().trim().max(600).default(""),
}).superRefine((value, ctx) => {
  if (value.status === "READY" && !value.dataSource) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["dataSource"],
      message: "A ready report names its data source",
    });
  }
  if (value.status === "READY" && value.metrics.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["metrics"],
      message: "A ready report carries its recorded metrics",
    });
  }
});

export async function GET() {
  return adminRoute(async () => {
    const reports = await db.report.findMany({
      orderBy: { updatedAt: "desc" },
      include: { organization: { select: { name: true, clientId: true } } },
    });
    const payload: AdminReportsPayload = { reports: reports.map(mapReport) };
    return NextResponse.json(payload);
  });
}

export async function POST(request: Request) {
  return adminRoute(async (context) => {
    const input = await readJson(request, createSchema);
    const org = await db.organization.findUnique({ where: { id: input.organizationId } });
    if (!org) {
      throw new z.ZodError([
        { code: "custom", path: ["organizationId"], message: "That client does not exist" },
      ]);
    }

    const created = await db.report.create({
      data: {
        organizationId: org.id,
        title: input.title,
        period: input.period,
        status: input.status,
        dataSource: input.dataSource,
        metricsJson: JSON.stringify(input.metrics),
        seriesJson: JSON.stringify(input.series),
        note: input.note,
      },
      include: { organization: { select: { name: true, clientId: true } } },
    });

    await Promise.all([
      recordStaffActivity(context, {
        organizationId: org.id,
        type: "REPORT",
        title: `Report updated: ${created.title}`,
        targetType: "REPORT",
        targetLabel: created.title,
        link: "/workspace/reports",
      }),
      recordStaffNotification(context, {
        organizationId: org.id,
        type: "REPORT",
        title: `New report: ${created.title}`,
        body: created.status === "READY" ? `${created.period} numbers are on the reports page.` : "The source is not connected yet; the report says so.",
        link: "/workspace/reports",
      }),
      recordStaffAudit(context, {
        action: "report.create",
        organizationId: org.id,
        targetType: "REPORT",
        targetLabel: created.title,
        metadata: { period: created.period, status: created.status },
      }),
    ]);

    return NextResponse.json({ report: mapReport(created) }, { status: 201 });
  });
}
