import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { db } from '@/lib/db'
import { verifyPassword } from '@/lib/password'
import { normalizeClientId } from '@/lib/client-id'

/**
 * NextAuth v4 configuration. JWT sessions (no session table), credentials only.
 * The route handler lives at src/app/api/auth/[...nextauth]/route.ts.
 *
 * Portal rule: a login needs email + password AND the client ID that ORBYT
 * issued when the engagement started. Accounts without a client ID have no
 * portal access, by design.
 *
 * Typing note: NextAuth v4 types do not know about our custom `id` on the
 * session user / JWT, so we use narrow runtime-guarded casts instead of `any`.
 */

/** Session user shape including the `id` we attach ourselves. */
export type SessionUserWithId = {
  id?: string
  name?: string | null
  email?: string | null
  image?: string | null
}

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        clientId: { label: 'Client ID', type: 'text' },
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
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
        if (!clientId || !email || !password) return null

        const user = await db.user.findUnique({ where: { email } })
        if (!user?.passwordHash) return null
        // No client ID on the account, or the ID doesn't match: no portal.
        if (!user.clientId || user.clientId !== clientId) return null
        if (!verifyPassword(password, user.passwordHash)) return null

        // Never return or log the hash beyond this boundary.
        return { id: user.id, name: user.name, email: user.email }
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
      return session
    },
  },
}
