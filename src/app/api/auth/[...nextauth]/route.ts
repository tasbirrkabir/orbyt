import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

// NextAuth v4 App Router handler. GET serves provider/csrf/session endpoints,
// POST serves the credentials sign-in and sign-out.
const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
