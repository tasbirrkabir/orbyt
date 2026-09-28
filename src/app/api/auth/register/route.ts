import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/password'

/**
 * POST /api/auth/register
 * Contract: { name, email, password } -> 201 { ok: true, id }
 *           | 400 { error } (invalid JSON / validation)
 *           | 409 { error } (email already registered)
 *           | 500 { error } (unexpected internal error, details never leaked)
 */

const registerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email().max(200),
  password: z.string().min(8).max(200),
})

export async function POST(request: Request) {
  // Parse JSON body safely.
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Validate.
  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 },
    )
  }

  const { name, email, password } = parsed.data

  try {
    // Uniqueness check (email is already normalized to lowercase).
    const existing = await db.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Try logging in.' },
        { status: 409 },
      )
    }

    const user = await db.user.create({
      data: {
        name,
        email,
        passwordHash: hashPassword(password),
      },
    })

    return NextResponse.json({ ok: true, id: user.id }, { status: 201 })
  } catch (error) {
    console.error('[api/auth/register] Failed to create user:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
