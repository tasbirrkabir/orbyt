import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions, type SessionUserWithId } from '@/lib/auth'
import { db } from '@/lib/db'

/**
 * GET /api/me (protected)
 * Contract: -> 200 { user: { id, name, email, createdAt }, profile, submissions }
 *           | 401 { error: 'Unauthorized' } (no session / account deleted)
 *           | 500 { error } (unexpected internal error, details never leaked)
 *
 * profile is the OnboardingProfile (challenges parsed back to a string array)
 * or null when onboarding was never completed. submissions are the latest 20
 * ContactSubmissions created by this account. passwordHash is never included.
 */

function parseChallenges(json: string): string[] {
  try {
    const parsed: unknown = JSON.parse(json)
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === 'string')
    }
    return []
  } catch {
    return []
  }
}

export async function GET() {
  const session = await getServerSession(authOptions)
  const sessionUser = session?.user as SessionUserWithId | undefined
  const userId =
    sessionUser && typeof sessionUser.id === 'string' ? sessionUser.id : null
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        onboardingProfile: true,
        submissions: {
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    })

    // Token still valid but the account is gone: treat as unauthorized.
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const onboarding = user.onboardingProfile
    const profile = onboarding
      ? {
          id: onboarding.id,
          company: onboarding.company,
          industry: onboarding.industry,
          stage: onboarding.stage,
          challenges: parseChallenges(onboarding.challengesJson),
          tools: onboarding.tools,
          goal: onboarding.goal,
          completedAt: onboarding.completedAt,
          updatedAt: onboarding.updatedAt,
        }
      : null

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      profile,
      submissions: user.submissions.map((submission) => ({
        id: submission.id,
        name: submission.name,
        email: submission.email,
        topic: submission.topic,
        message: submission.message,
        createdAt: submission.createdAt,
      })),
    })
  } catch (error) {
    console.error('[api/me] Failed to load account:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
