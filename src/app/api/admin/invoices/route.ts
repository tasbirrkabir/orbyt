import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { adminRoute, readJson } from "@/lib/admin/api";
import { nextStaffCode, recordStaffActivity, recordStaffAudit, recordStaffNotification } from "@/lib/admin/records";
import type { AdminInvoiceItem, AdminInvoicesPayload } from "@/lib/admin/types";

/**
 * GET  /api/admin/invoices (staff only)
 * POST /api/admin/invoices (staff only)
 *
 * GET lists every invoice across tenants. POST issues one: the human
 * number INV-XXXX is scoped per org, amounts arrive in taka and are
 * stored as integer cents (no floating point money anywhere).
 *   GET  200 { invoices: AdminInvoiceItem[] }
 *   POST 201 { invoice: AdminInvoiceItem }
 */

const createSchema = z.object({
  organizationId: z.string().trim().min(1),
  issueDate: z.string().trim().datetime({ offset: true }),
  dueDate: z.string().trim().datetime({ offset: true }),
  description: z.string().trim().min(3).max(300),
  subtotalTaka: z.coerce.number().min(0).max(100_000_000),
  taxTaka: z.coerce.number().min(0).max(100_000_000).default(0),
}).superRefine((value, ctx) => {
  if (new Date(value.dueDate).getTime() < new Date(value.issueDate).getTime()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["dueDate"],
      message: "The due date cannot come before the issue date",
    });
  }
});

export async function GET() {
  return adminRoute(async () => {
    const invoices = await db.invoice.findMany({
      orderBy: { issueDate: "desc" },
      include: {
        organization: { select: { name: true, clientId: true } },
      },
    });

    const payload: AdminInvoicesPayload = {
      invoices: invoices.map((row) => ({
        id: row.id,
        organizationId: row.organizationId,
        organizationName: row.organization.name,
        clientId: row.organization.clientId,
        number: row.number,
        issueDate: row.issueDate.toISOString(),
        dueDate: row.dueDate.toISOString(),
        description: row.description,
        subtotalCents: row.subtotalCents,
        taxCents: row.taxCents,
        totalCents: row.totalCents,
        currency: row.currency,
        status: row.status,
        paidAt: row.paidAt?.toISOString() ?? null,
        method: row.method,
      })),
    };
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

    const subtotalCents = Math.round(input.subtotalTaka * 100);
    const taxCents = Math.round(input.taxTaka * 100);
    const number = await nextStaffCode(org.id, "INV");

    const created = await db.invoice.create({
      data: {
        organizationId: org.id,
        number,
        issueDate: new Date(input.issueDate),
        dueDate: new Date(input.dueDate),
        description: input.description,
        subtotalCents,
        taxCents,
        totalCents: subtotalCents + taxCents,
        currency: "BDT",
        status: "PENDING",
      },
    });

    await Promise.all([
      recordStaffActivity(context, {
        organizationId: org.id,
        type: "BILLING",
        title: `Invoice ${created.number} issued`,
        targetType: "INVOICE",
        targetLabel: created.number,
        link: "/workspace/billing",
      }),
      recordStaffNotification(context, {
        organizationId: org.id,
        type: "BILLING",
        title: `Invoice ${created.number} issued`,
        body: input.description,
        link: "/workspace/billing",
      }),
      recordStaffAudit(context, {
        action: "invoice.create",
        organizationId: org.id,
        targetType: "INVOICE",
        targetLabel: created.number,
        metadata: { totalCents: created.totalCents },
      }),
    ]);

    const item: AdminInvoiceItem = {
      id: created.id,
      organizationId: created.organizationId,
      organizationName: org.name,
      clientId: org.clientId,
      number: created.number,
      issueDate: created.issueDate.toISOString(),
      dueDate: created.dueDate.toISOString(),
      description: created.description,
      subtotalCents: created.subtotalCents,
      taxCents: created.taxCents,
      totalCents: created.totalCents,
      currency: created.currency,
      status: created.status,
      paidAt: created.paidAt?.toISOString() ?? null,
      method: created.method,
    };
    return NextResponse.json({ invoice: item }, { status: 201 });
  });
}
