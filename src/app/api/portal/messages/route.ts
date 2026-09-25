import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getServerSession } from 'next-auth/next'
import { authOptions, type SessionUserWithId } from '@/lib/auth'
import { db } from '@/lib/db'

/**
 * POST /api/portal/messages (protected)
 * Contract: { message, topic?, projectId? } -> 201 { ok: true, id }
 *           | 400 { error } (invalid JSON / validation)
 *           | 401 { error: 'Unauthorized' } (no session)
 *           | 429 { error } (rate limited)
 *           | 500 { error } (unexpected internal error, details never leaked)
 *
 * The composer inside the client portal. A note posted here lands on the
 * same desk as the contact form (a ContactSubmission linked to the
 * account), so nothing the client says is ever scattered. Replies go out
 * by email; the portal keeps the client's side of the thread organized.
 *
 * `topic` must come from the fixed chip list so the log stays scannable.
 * `projectId` is optional context; it must belong to the session user.
 */

const TOPICS = ['Portal note', 'Check-in request', 'Question', 'New priority'] as const

const messageSchema = z.object({
  message: z.string().trim().min(2).max(2000),
  topic: z.enum(TOPICS).default('Portal note'),
  projectId: z.string().trim().min(1).max(64).optional(),
})

// Same lightweight limiter as /api/contact: max 10 notes per 10 minutes.
const RATE_LIMIT_MAX = 10
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(key: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(key)

  if (!entry || now >= entry.resetAt) {
    if (rateLimitMap.size > 1000) {
      for (const [k, v] of rateLimitMap) {
        if (now >= v.resetAt) rateLimitMap.delete(k)
      }
    }
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return false
  }

  entry.count += 1
  return entry.count > RATE_LIMIT_MAX
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  const sessionUser = session?.user as SessionUserWithId | undefined
  const userId =
    sessionUser && typeof sessionUser.id === 'string' ? sessionUser.id : null
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const clientKey =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (isRateLimited(`${clientKey}:${userId}`)) {
    return NextResponse.json(
      { error: 'Too many notes in a row. Give it a few minutes.' },
      { status: 429 },
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = messageSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 },
    )
  }

  try {
    // Name and email come from the account, never from the request body.
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    })
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Project context is optional but must be the client's own project.
    let projectId: string | null = null
    if (parsed.data.projectId) {
      const project = await db.project.findFirst({
        where: { id: parsed.data.projectId, userId },
        select: { id: true },
      })
      if (!project) {
        return NextResponse.json(
          { error: 'That project is not on your account' },
          { status: 400 },
        )
      }
      projectId = project.id
    }

    const submission = await db.contactSubmission.create({
      data: {
        name: user.name ?? 'Client',
        email: user.email,
        topic: parsed.data.topic,
        message: parsed.data.message,
        userId,
        projectId,
      },
    })
    return NextResponse.json({ ok: true, id: submission.id }, { status: 201 })
  } catch (error) {
    console.error('[api/portal/messages] Failed to save note:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
