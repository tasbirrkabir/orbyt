import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions, type SessionUserWithId } from '@/lib/auth'
import { db } from '@/lib/db'

/**
 * GET /api/me (protected)
 * Contract: -> 200 { user: { id, name, email, clientId, createdAt }, profile, submissions, projects, deliverables }
 *           | 401 { error: 'Unauthorized' } (no session / account deleted)
 *           | 500 { error } (unexpected internal error, details never leaked)
 *
 * profile is the OnboardingProfile (challenges parsed back to a string array)
 * or null when onboarding was never completed. submissions are the latest 20
 * ContactSubmissions created by this account. projects carry each project's
 * status and full update history, newest first, each update carrying its
 * client sign-off (acknowledgedAt) when one exists. deliverables are the
 * engagement's files and documents, flat across projects: the portal is the
 * index of what exists, when it landed and where, not the transport.
 * passwordHash is never included; clientId appears only as the account's
 * own portal key.
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
        projects: {
          orderBy: { startedAt: 'desc' },
          include: {
            updates: { orderBy: { createdAt: 'desc' } },
            deliverables: { orderBy: { createdAt: 'desc' } },
          },
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
        clientId: user.clientId,
        createdAt: user.createdAt,
      },
      profile,
      submissions: user.submissions.map((submission) => ({
        id: submission.id,
        name: submission.name,
        email: submission.email,
        topic: submission.topic,
        message: submission.message,
        projectId: submission.projectId,
        createdAt: submission.createdAt,
      })),
      projects: user.projects.map((project) => ({
        id: project.id,
        title: project.title,
        status: project.status,
        startedAt: project.startedAt,
        updates: project.updates.map((update) => ({
          id: update.id,
          tag: update.tag,
          title: update.title,
          body: update.body,
          acknowledgedAt: update.acknowledgedAt,
          createdAt: update.createdAt,
        })),
      })),
      // Flat across projects, newest first; the views group and label them.
      deliverables: user.projects.flatMap((project) =>
        project.deliverables.map((deliverable) => ({
          id: deliverable.id,
          title: deliverable.title,
          detail: deliverable.detail,
          status: deliverable.status,
          channel: deliverable.channel,
          link: deliverable.link,
          deliveredAt: deliverable.deliveredAt,
          createdAt: deliverable.createdAt,
          projectId: project.id,
        })),
      ),
    })
  } catch (error) {
    console.error('[api/me] Failed to load account:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
