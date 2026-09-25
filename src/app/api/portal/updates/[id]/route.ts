import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getServerSession } from 'next-auth/next'
import { authOptions, type SessionUserWithId } from '@/lib/auth'
import { db } from '@/lib/db'

/**
 * PATCH /api/portal/updates/[id] (protected)
 * Contract: { acknowledged: true } -> 200 { acknowledgedAt }
 *           | 400 { error } (invalid JSON / validation)
 *           | 401 { error: 'Unauthorized' } (no session)
 *           | 404 { error } (update missing or not owned by the session user)
 *           | 500 { error } (unexpected internal error, details never leaked)
 *
 * The client's sign-off on a shipped update. Ownership is enforced through
 * the parent project's userId: a client can only ever acknowledge updates
 * on their own projects. Sign-off is one-way (an approval is a record, not
 * a toggle); re-approving is idempotent and returns the original timestamp.
 */

const ackSchema = z.object({
  acknowledged: z.literal(true),
})

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions)
  const sessionUser = session?.user as SessionUserWithId | undefined
  const userId =
    sessionUser && typeof sessionUser.id === 'string' ? sessionUser.id : null
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = ackSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  try {
    // The update must exist AND belong to a project owned by this user.
    const update = await db.projectUpdate.findFirst({
      where: { id, project: { userId } },
      select: { id: true, acknowledgedAt: true },
    })
    if (!update) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Idempotent: an approval already on record is simply returned.
    if (update.acknowledgedAt) {
      return NextResponse.json({ acknowledgedAt: update.acknowledgedAt })
    }

    const saved = await db.projectUpdate.update({
      where: { id: update.id },
      data: { acknowledgedAt: new Date() },
      select: { acknowledgedAt: true },
    })
    return NextResponse.json({ acknowledgedAt: saved.acknowledgedAt })
  } catch (error) {
    console.error('[api/portal/updates] Failed to acknowledge:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
