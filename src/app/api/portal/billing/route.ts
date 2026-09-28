import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { identityOf, portalRoute } from "@/lib/portal/api";
import type { BillingPayload } from "@/lib/portal/types";

/**
 * GET /api/portal/billing (protected)
 * Invoices and payment history for the organization. The portal never
 * processes payments: invoices describe the transfer method and the
 * honest next step lives in the UI. Contract:
 * 200 BillingPayload | 401 | 500.
 */
export async function GET() {
  return portalRoute(async (context) => {
    const invoices = await db.invoice.findMany({
      where: { organizationId: context.organizationId },
      orderBy: { issueDate: "desc" },
      include: { _count: { select: { payments: true } } },
    });

    const map = (invoice: (typeof invoices)[number]) => ({
      id: invoice.id,
      number: invoice.number,
      issueDate: invoice.issueDate.toISOString(),
      dueDate: invoice.dueDate.toISOString(),
      description: invoice.description,
      subtotalCents: invoice.subtotalCents,
      taxCents: invoice.taxCents,
      totalCents: invoice.totalCents,
      currency: invoice.currency,
      status: invoice.status,
      paidAt: invoice.paidAt?.toISOString() ?? null,
      method: invoice.method,
      paymentClaimCount: invoice._count.payments,
    });

    const pending = invoices.filter((invoice) =>
      ["PENDING", "OVERDUE", "DRAFT"].includes(invoice.status),
    );
    const settled = invoices.filter((invoice) =>
      ["PAID", "CANCELLED"].includes(invoice.status),
    );
    const now = new Date();
    const year = now.getFullYear();

    const payload: BillingPayload = {
      identity: identityOf(context),
      outstandingCents: pending.reduce((sum, invoice) => sum + invoice.totalCents, 0),
      paidThisYearCents: invoices
        .filter((invoice) => invoice.status === "PAID" && invoice.paidAt?.getFullYear() === year)
        .reduce((sum, invoice) => sum + invoice.totalCents, 0),
      pending: pending.map(map),
      settled: settled.map(map),
    };
    return NextResponse.json(payload);
  });
}
