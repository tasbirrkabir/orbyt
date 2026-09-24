import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getServerSession } from 'next-auth/next'
import { authOptions, type SessionUserWithId } from '@/lib/auth'
import { db } from '@/lib/db'

/**
 * POST /api/onboarding (protected)
 * Contract: { company, industry, stage, challenges[], tools?: string|null, goal, focus?: string|null }
 *           -> 200 { ok: true, id }
 *           | 400 { error } (invalid JSON / validation)
 *           | 401 { error: 'Unauthorized' } (no session)
 *           | 500 { error } (unexpected internal error, details never leaked)
 *
 * Note: `focus` is validated for forward compatibility but NOT persisted:
 * the OnboardingProfile table has no focus column (schema frozen for this
 * task). If it gets added later, wire it into the upsert below.
 */

const onboardingSchema = z.object({
  company: z.string().trim().min(1).max(160),
  industry: z.string().trim().min(1).max(80),
  stage: z.string().trim().min(1).max(80),
  challenges: z.array(z.string().trim().min(1).max(160)).min(1).max(12),
  tools: z
    .string()
    .trim()
    .max(2000)
    .nullish()
    .transform((v) => (v && v.length > 0 ? v : null)),
  goal: z.string().trim().min(1).max(2000),
  focus: z
    .string()
    .trim()
    .max(500)
    .nullish()
    .transform((v) => (v && v.length > 0 ? v : null)),
})

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  const sessionUser = session?.user as SessionUserWithId | undefined
  const userId =
    sessionUser && typeof sessionUser.id === 'string' ? sessionUser.id : null
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Parse JSON body safely.
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Validate.
  const parsed = onboardingSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 },
    )
  }

  const { company, industry, stage, challenges, tools, goal } = parsed.data
  const challengesJson = JSON.stringify(challenges)
  const completedAt = new Date()

  try {
    const profile = await db.onboardingProfile.upsert({
      where: { userId },
      update: {
        company,
        industry,
        stage,
        challengesJson,
        tools,
        goal,
        completedAt,
      },
      create: {
        userId,
        company,
        industry,
        stage,
        challengesJson,
        tools,
        goal,
        completedAt,
      },
    })

    return NextResponse.json({ ok: true, id: profile.id }, { status: 200 })
  } catch (error) {
    console.error('[api/onboarding] Failed to save profile:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
