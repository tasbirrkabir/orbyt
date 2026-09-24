import { PrismaClient } from '@prisma/client'

// Singleton Prisma client. NOTE (Task 14-b): the dev server caches the client
// in module/global scope, so after `prisma generate` a process reload is needed
// for schema v2 (User.passwordHash, OnboardingProfile, ContactSubmission.topic).

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db