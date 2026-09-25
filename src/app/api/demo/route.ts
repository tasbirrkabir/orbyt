import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/password'
import {
  DEMO_AGE_DAYS,
  DEMO_EMAIL,
  DEMO_NAME,
  DEMO_PASSWORD,
  DEMO_PROFILE,
  DEMO_SUBMISSIONS,
} from '@/lib/demo'

/**
 * POST /api/demo
 * Idempotently provisions the public demo account, its sample profile and
 * its two sample briefs. The login page calls this, then signs in with the
 * shared credentials (which are public by design; see src/lib/demo.ts).
 *
 * Every step is an upsert or a count-guarded create, so calling this any
 * number of times is safe, and a wiped database is repaired on the next
 * click. No request body, no user input to validate.
 *
 * Contract: -> 200 { ok: true } | 500 { error } (details never leaked)
 */
export async function POST() {
  const DAY_MS = 86_400_000
  const now = Date.now()

  try {
    const user = await db.user.upsert({
      where: { email: DEMO_EMAIL },
      update: {},
      create: {
        email: DEMO_EMAIL,
        name: DEMO_NAME,
        passwordHash: hashPassword(DEMO_PASSWORD),
        // Created "a week ago" so the workspace shows a believable tenure.
        createdAt: new Date(now - DEMO_AGE_DAYS * DAY_MS),
      },
    })

    // The account can also come into existence through a contact submission
    // (no password). Repair that case so the shared credentials always work.
    if (!user.passwordHash) {
      await db.user.update({
        where: { id: user.id },
        data: { passwordHash: hashPassword(DEMO_PASSWORD) },
      })
    }

    await db.onboardingProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        company: DEMO_PROFILE.company,
        industry: DEMO_PROFILE.industry,
        stage: DEMO_PROFILE.stage,
        challengesJson: JSON.stringify(DEMO_PROFILE.challenges),
        tools: DEMO_PROFILE.tools,
        goal: DEMO_PROFILE.goal,
        completedAt: new Date(now - (DEMO_AGE_DAYS - 1) * DAY_MS),
      },
    })

    const submissionCount = await db.contactSubmission.count({
      where: { userId: user.id },
    })
    if (submissionCount === 0) {
      for (const submission of DEMO_SUBMISSIONS) {
        await db.contactSubmission.create({
          data: {
            userId: user.id,
            name: DEMO_NAME,
            email: DEMO_EMAIL,
            topic: submission.topic,
            message: submission.message,
            createdAt: new Date(now - submission.daysAgo * DAY_MS),
          },
        })
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[api/demo] Failed to provision demo account:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
