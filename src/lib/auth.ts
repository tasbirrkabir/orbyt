import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { db } from '@/lib/db'
import { verifyPassword } from '@/lib/password'
import { normalizeClientId } from '@/lib/client-id'
import { checkRateLimit, clientIp, type HeaderBag } from '@/lib/rate-limit'
import { consumeMfaLoginTicket } from '@/lib/mfa'
import { verifySecondFactor } from '@/lib/credentials'
import { recordAuditRaw } from '@/lib/portal/records'

/**
 * NextAuth v4 configuration. JWT sessions (no session table), credentials only.
 * The route handler lives at src/app/api/auth/[...nextauth]/route.ts.
 *
 * Two sign-in protocols share this authorize:
 *
 *  1. PASSWORD (client portal form): clientId + email + password. The
 *     client ID names the engagement; accounts without one have no
 *     portal access, by design. Staff accounts sign in with email +
 *     password and no client ID (role ADMIN is required server-side
 *     before the desk opens).
 *
 *  2. TICKET (two-step MFA, used by the desk form): step one POSTs
 *     /api/auth/mfa/challenge which verifies email+password WITHOUT a
 *     session and, for MFA-active accounts, returns a single-use
 *     LOGIN_MFA ticket. Step two calls signIn with mfaTicket+mfaCode;
 *     authorize consumes the ticket and verifies the second factor.
 *
 * Hardening (production spec, Phase 1):
 *  - Every attempt is IP throttled inside authorize; exceeded limits answer
 *    with the same generic failure as a wrong password, so nothing leaks.
 *  - A not-found user still burns a scrypt verification against a dummy
 *    hash, closing the user-enumeration timing side channel.
 *  - MFA (password path): when the account has an ACTIVE enrollment,
 *    authorize demands a valid TOTP code or a backup code. A missing
 *    code throws MFA_REQUIRED, which the login form reads to show the
 *    code step.
 *  - The token version travels in the JWT (`tv`); the portal session layer
 *    compares it against the user row, so bumping tokenVersion (password
 *    change, MFA changes) invalidates every existing session everywhere.
 *
 * Typing note: NextAuth v4 types do not know about our custom `id` on the
 * session user / JWT, so we use narrow runtime-guarded casts instead of `any`.
 */

/** Session user shape including the `id` and `tv` we attach ourselves. */
export type SessionUserWithId = {
  id?: string
  name?: string | null
  email?: string | null
  image?: string | null
  tv?: number
}

/** Constant-ish dummy verification target for unknown accounts. */
const DUMMY_HASH = `s2:${'a'.repeat(32)}:${'b'.repeat(128)}`

/** A user row as authorize sees it, with only what it needs. */
type AuthorizeUser = {
  id: string
  name: string | null
  email: string
  tokenVersion: number
}

function authorizeError(message: string): never {
  throw new Error(message)
}

/**
 * Secret pin (Task 26 regression guard, restored): without this, a dev
 * server with no NEXTAUTH_SECRET env var derives its secret from the
 * config object, and every config edit silently rotates it, killing
 * every live session with JWEDecryptionFailed. Pinned fallback keeps
 * dev sessions stable; production must set a real NEXTAUTH_SECRET.
 */
const PINNED_DEV_SECRET = 'orbyt-ink-ember-stable-dev-secret'

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || PINNED_DEV_SECRET,
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        clientId: { label: 'Client ID', type: 'text' },
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        // Second step for MFA accounts: TOTP code or a backup code.
        totp: { label: 'Authenticator code', type: 'text' },
        // Ticket protocol (two-step MFA): the hashed ticket from
        // /api/auth/mfa/challenge plus the code that unlocks it.
        mfaTicket: { label: 'MFA ticket', type: 'text' },
        mfaCode: { label: 'MFA code', type: 'text' },
      },
      async authorize(credentials, request) {
        const clientId =
          typeof credentials?.clientId === 'string'
            ? normalizeClientId(credentials.clientId)
            : ''
        const email =
          typeof credentials?.email === 'string'
            ? credentials.email.trim().toLowerCase()
            : ''
        const password =
          typeof credentials?.password === 'string' ? credentials.password : ''
        const mfaTicket =
          typeof credentials?.mfaTicket === 'string' ? credentials.mfaTicket.trim() : ''
        const mfaCode =
          typeof credentials?.mfaCode === 'string' ? credentials.mfaCode.trim() : ''

        // ── Ticket protocol: the password was already verified by the
        // challenge route. Consume the single-use ticket, verify the
        // second factor, load the user, open the session.
        if (mfaTicket) {
          const ipTicket = clientIp({ headers: request.headers as HeaderBag })
          const ticketThrottle = checkRateLimit('login', ipTicket, 10, 5 * 60 * 1000)
          if (!ticketThrottle.ok) return null

          const ticketUserId = await consumeMfaLoginTicket(mfaTicket)
          if (!ticketUserId) return null

          const factor = await verifySecondFactor(ticketUserId, mfaCode)
          if (!factor.ok) return null

          const ticketUser = await db.user.findUnique({
            where: { id: ticketUserId },
            select: { id: true, name: true, email: true, tokenVersion: true },
          })
          if (!ticketUser) return null

          await recordAuditRaw({
            actorEmail: ticketUser.email,
            action: 'auth.login',
            targetType: 'ACCOUNT',
            targetLabel: ticketUser.email,
            metadata: { mfa: true, via: factor.via ?? 'TOTP' },
          })
          try {
            await db.user.update({
              where: { id: ticketUser.id },
              data: { lastLoginAt: new Date() },
            })
          } catch {
            console.error('[auth] lastLoginAt update failed')
          }

          return {
            id: ticketUser.id,
            name: ticketUser.name,
            email: ticketUser.email,
            tv: ticketUser.tokenVersion,
          }
        }

        if (!email || !password) return null

        // Brute force throttle: per IP, ten attempts per five minutes.
        // Same generic null as any wrong credential, nothing revealed.
        // (v4 hands authorize a node-style plain-object header bag, not
        // a Headers instance; clientIp accepts both.)
        const ip = clientIp({ headers: request.headers as HeaderBag })
        const throttle = checkRateLimit('login', ip, 10, 5 * 60 * 1000)
        if (!throttle.ok) {
          await recordAuditRaw({
            actorEmail: email,
            action: 'auth.login_throttled',
            targetType: 'ACCOUNT',
            targetLabel: clientId,
          })
          return null
        }

        // The client ID names the engagement. It matches either the
        // organization itself (any team member logs in with it) or,
        // for accounts created before organizations existed, the user
        // row directly. No client ID: the staff path, email must belong
        // to an ADMIN seat. Generic failure either way: no enumeration.
        const user = (await db.user.findFirst({
          where: clientId
            ? {
                email,
                OR: [
                  { organization: { clientId } },
                  { clientId },
                ],
              }
            : {
                email,
                role: 'ADMIN',
              },
          select: {
            id: true,
            name: true,
            email: true,
            tokenVersion: true,
            passwordHash: true,
            mfaEnrollment: { where: { status: 'ACTIVE' }, select: { id: true } },
          },
        })) as (AuthorizeUser & {
          passwordHash: string | null
          mfaEnrollment: { id: string }[] | null
        }) | null

        if (!user?.passwordHash) {
          // Burn comparable CPU on unknown accounts so response time
          // cannot distinguish "no such user" from "wrong password".
          verifyPassword(password, DUMMY_HASH)
          return null
        }
        if (!verifyPassword(password, user.passwordHash)) {
          await recordAuditRaw({
            actorEmail: email,
            action: 'auth.login_failed',
            targetType: 'ACCOUNT',
            targetLabel: clientId,
          })
          return null
        }

        // MFA: active enrollments verify TOTP or consume a backup code
        // through the one second-factor implementation. The password
        // path receives the code in `totp` (client form) or `mfaCode`.
        const mfaActive = Array.isArray(user.mfaEnrollment)
          ? user.mfaEnrollment.length > 0
          : user.mfaEnrollment !== null
        if (mfaActive) {
          const code =
            (typeof credentials?.totp === 'string' && credentials.totp.trim()) ||
            mfaCode
          if (!code) authorizeError('MFA_REQUIRED')

          const factor = await verifySecondFactor(user.id, code)
          if (!factor.ok) {
            await recordAuditRaw({
              actorEmail: email,
              action: 'auth.mfa_challenge_failed',
              targetType: 'ACCOUNT',
              targetLabel: clientId,
            })
            authorizeError('MFA_REQUIRED')
          }
        }

        await recordAuditRaw({
          actorEmail: email,
          action: 'auth.login',
          targetType: 'ACCOUNT',
          targetLabel: clientId,
          metadata: { mfa: mfaActive },
        })

        // Last seen; a failed write must never block a good login.
        try {
          await db.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
          })
        } catch {
          console.error('[auth] lastLoginAt update failed')
        }

        // Never return or log the hash beyond this boundary.
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          tv: user.tokenVersion,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Sign-in: persist identity fields on the token.
      if (user) {
        if (typeof user.id === 'string') token.id = user.id
        token.name = user.name
        token.email = user.email
        const maybeUser = user as SessionUserWithId
        if (typeof maybeUser.tv === 'number') token.tv = maybeUser.tv
      }

      // Client-driven update (useSession().update()): merge what changed.
      if (trigger === 'update' && session) {
        const patch = session as { id?: unknown; name?: unknown; email?: unknown }
        if (typeof patch.id === 'string') token.id = patch.id
        if (typeof patch.name === 'string' || patch.name === null) token.name = patch.name
        if (typeof patch.email === 'string') token.email = patch.email
      }

      return token
    },
    async session({ session, token }) {
      const sessionUser = session.user as SessionUserWithId | undefined
      if (sessionUser && typeof token.id === 'string') {
        sessionUser.id = token.id
      }
      if (sessionUser && typeof token.tv === 'number') {
        sessionUser.tv = token.tv
      }
      return session
    },
  },
}
