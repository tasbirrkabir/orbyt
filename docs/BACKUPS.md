# ORBYT Backup & Recovery Plan

Status: documented for the current deployment shape (single-node, SQLite + local object storage). The moment ORBYT moves to managed Postgres and R2, update this page from "manual procedure" to "managed service statements" with real retention numbers.

## What must survive a failure

| Asset | Location today | Loss window (RPO) | Restore time target (RTO) |
| --- | --- | --- | --- |
| Database (SQLite) | `db/custom.db` | 24h (daily copy) | under 1 hour |
| Private files | `db/storage/` (local provider) | 24h (daily copy) | under 1 hour |
| Env / secrets | `.env` (operator-managed) | 0 (never destroyed) | minutes |
| Code | git remote | 0 | minutes |

RPO today is the backup interval. RTO is dominated by provisioning a new node and restoring the two folders.

## Procedure

1. Database copy (cold, safe for SQLite):

   ```bash
   sqlite3 db/custom.db ".backup 'backups/orbyt-$(date +%F).db'"
   ```

   Run it at least daily. Keep 30 days. Test one restore per month by copying the file back onto a scratch instance and running the app against it.

2. Files: `tar -C db -czf "backups/storage-$(date +%F).tgz" storage`. Same retention and monthly restore test. On R2, enable bucket versioning and document the provider's durability numbers instead.

3. Restore drill (the only proof that counts):

   ```bash
   cp backups/orbyt-YYYY-MM-DD.db db/custom.db
   tar -C db -xzf backups/storage-YYYY-MM-DD.tgz
   # start the app, sign in as a demo client, open a file, approve nothing
   ```

4. `bun run db:push` is a development command. In production, switch to versioned Prisma migrations (`bun run db:migrate`), keep every migration in git, and rehearse one rollback before the first real client is onboarded.

## Honest limits

- The demo database is disposable and re-seedable (`/api/demo` is idempotent); it is not a backup target.
- Email records (EmailMessage) live in the database and are therefore backed up with it. Provider-side delivery logs are not under ORBYT control.
- Nothing in this plan has been tested against a real node failure yet. Treat RTO as an estimate until the monthly drill has run twice.
