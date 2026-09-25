import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { identityOf, portalRoute } from "@/lib/portal/api";
import type { ReportMetric, ReportPayload, ReportSeries } from "@/lib/portal/types";

/**
 * GET /api/portal/reports (protected)
 * Marketing-tier module: the routes rejects callers whose tier does
 * not include it, even though the nav would already hide the link.
 * Metrics and series are stored snapshots; NOT_CONNECTED rows carry
 * no numbers at all, by design.
 * Contract: 200 ReportPayload | 401 | 403 | 500.
 */
export async function GET() {
  return portalRoute(async (context) => {
    if (!["MARKETING_WEBSITE", "FULL_SERVICE"].includes(context.tier)) {
      return NextResponse.json(
        { error: "Reports are not part of this engagement" },
        { status: 403 },
      );
    }

    const reports = await db.report.findMany({
      where: { organizationId: context.organizationId },
      orderBy: { updatedAt: "desc" },
    });

    const payload: ReportPayload = {
      identity: identityOf(context),
      reports: reports.map((report) => ({
        id: report.id,
        title: report.title,
        period: report.period,
        status: report.status,
        dataSource: report.dataSource,
        note: report.note,
        updatedAt: report.updatedAt?.toISOString() ?? null,
        metrics: parseMetrics(report.metricsJson),
        series: parseSeries(report.seriesJson),
      })),
    };

    return NextResponse.json(payload);
  });
}

function parseMetrics(json: string): ReportMetric[] {
  try {
    const parsed: unknown = JSON.parse(json);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is ReportMetric =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as ReportMetric).key === "string" &&
        typeof (item as ReportMetric).label === "string",
    );
  } catch {
    return [];
  }
}

function parseSeries(json: string): ReportSeries[] {
  try {
    const parsed: unknown = JSON.parse(json);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is ReportSeries =>
        typeof item === "object" &&
        item !== null &&
        Array.isArray((item as ReportSeries).points),
    );
  } catch {
    return [];
  }
}
