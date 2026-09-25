import { NextResponse } from 'next/server'
import { seedCommandCenter } from '@/lib/portal/demo-seed'

/**
 * POST /api/demo
 * Idempotently provisions the three public demo tenants (website-only,
 * website + marketing, full service), their projects, milestones,
 * approvals, requests, files, threads, meetings, invoices, systems,
 * reports, notifications and activity. The login page calls this, then
 * signs in with the shared credentials (which are public by design;
 * see src/lib/demo.ts).
 *
 * Every step is an upsert or a count-guarded create, so calling this
 * any number of times is safe, and a wiped database is repaired on the
 * next click. No request body, no user input to validate.
 *
 * Contract: -> 200 { ok: true } | 500 { error } (details never leaked)
 */
export async function POST() {
  try {
    await seedCommandCenter()
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[api/demo] Failed to provision demo tenants:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
