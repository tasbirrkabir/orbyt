import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { portalRoute } from "@/lib/portal/api";
import type { SearchPayload } from "@/lib/portal/types";

/**
 * GET /api/portal/search?q=term (protected)
 * Permission-respecting global search. Every group is a separate
 * org-scoped query; a result only ever comes from the caller's own
 * organization because the where clause cannot be bypassed.
 * Contract: 200 SearchPayload | 401 | 500.
 */
export async function GET(request: Request) {
  return portalRoute(async (context) => {
    const url = new URL(request.url);
    const term = (url.searchParams.get("q") ?? "").trim();
    if (term.length < 2) {
      return NextResponse.json({ groups: [] });
    }
    const q = { contains: term };
    const orgId = context.organizationId;

    const [projects, requests, approvals, files, threads, invoices, systems, reports] =
      await Promise.all([
        db.project.findMany({ where: { organizationId: orgId, title: q }, take: 5, select: { id: true, title: true, status: true } }),
        db.request.findMany({ where: { organizationId: orgId, OR: [{ title: q }, { code: q }] }, take: 5, select: { id: true, code: true, title: true, status: true } }),
        db.approval.findMany({ where: { organizationId: orgId, title: q }, take: 5, select: { id: true, title: true, version: true, status: true } }),
        db.portalFile.findMany({ where: { organizationId: orgId, name: q }, take: 5, select: { id: true, name: true, category: true, status: true } }),
        db.messageThread.findMany({ where: { organizationId: orgId, subject: q }, take: 5, select: { id: true, subject: true, updatedAt: true } }),
        db.invoice.findMany({ where: { organizationId: orgId, OR: [{ number: q }, { description: q }] }, take: 5, select: { id: true, number: true, description: true, status: true } }),
        db.systemEntry.findMany({ where: { organizationId: orgId, name: q }, take: 5, select: { id: true, name: true, category: true, status: true } }),
        db.report.findMany({ where: { organizationId: orgId, title: q }, take: 5, select: { id: true, title: true, period: true, status: true } }),
      ]);

    const groups: SearchPayload["groups"] = [];
    const push = (label: string, items: { id: string; title: string; detail: string; href: string }[]) => {
      if (items.length > 0) groups.push({ label, items });
    };

    push("Projects", projects.map((project) => ({
      id: project.id, title: project.title, detail: project.status, href: `/workspace/projects/${project.id}`,
    })));
    push("Requests", requests.map((item) => ({
      id: item.id, title: `${item.code}: ${item.title}`, detail: item.status, href: `/workspace/requests/${item.id}`,
    })));
    push("Approvals", approvals.map((item) => ({
      id: item.id, title: `${item.title} ${item.version}`, detail: item.status, href: "/workspace/approvals",
    })));
    push("Files", files.map((item) => ({
      id: item.id, title: item.name, detail: item.category, href: "/workspace/files",
    })));
    push("Messages", threads.map((item) => ({
      id: item.id, title: item.subject, detail: "Conversation", href: `/workspace/messages/${item.id}`,
    })));
    push("Billing", invoices.map((item) => ({
      id: item.id, title: item.number, detail: item.description, href: "/workspace/billing",
    })));
    push("Systems", systems.map((item) => ({
      id: item.id, title: item.name, detail: item.category, href: `/workspace/systems/${item.id}`,
    })));
    push("Reports", reports.map((item) => ({
      id: item.id, title: item.title, detail: item.status, href: "/workspace/reports",
    })));

    return NextResponse.json({ groups });
  });
}
