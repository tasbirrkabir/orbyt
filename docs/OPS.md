# ORBYT Operations Runbook

Production operations for the ORBYT platform: what backs the service, how to back it up, and how to recover. Kept terse on purpose. Everything here reflects the real deployment (Next.js 16 App Router, SQLite via Prisma, local-disk storage, console/Resend email).

## What is stateful

| Component | Location | Backed up? |
| --- | --- | --- |
| Database (SQLite) | `DATABASE_URL` (file under `db/`) | REQUIRED, see below |
| Storage objects | `STORAGE_DIR` (default `./storage/`) | REQUIRED when in use |
| Email ledger | DB table `EmailMessage` | included in DB backup |
| Audit + activity ledgers | DB tables `AuditLog`, `ActivityEvent` | included in DB backup |

Everything else (code, config) is reproducible from the repository.

## Backups

### Database (SQLite)

SQLite backs up safely online with the `.backup` command (consistent snapshot, no downtime, safe while the app is running):

```bash
sqlite3 db/orbyt.db ".backup '/backups/orbyt-$(date +%Y%m%d-%H%M%S).db'"
```

Recommended cadence: every 6 hours, keep 14 daily + 8 weekly. Ship copies off the machine (object storage or another host); a backup on the same disk is not a backup. Verify one restore per month (see Restore drill).

Test the integrity of any backup copy before shipping:

```bash
sqlite3 /backups/orbyt-YYYYMMDD-HHMMSS.db "PRAGMA integrity_check;"
```

### Storage objects

When the storage service is in use (`STORAGE_DIR`), sync the directory off the machine:

```bash
rsync -a --delete ./storage/ /backups/storage/
```

Objects are immutable once written (atomic temp-file + rename), so incremental sync is safe.

## Restore

1. Stop writes: put the app in maintenance or stop the process.
2. Restore the database file:

```bash
cp /backups/orbyt-YYYYMMDD-HHMMSS.db db/orbyt.db
sqlite3 db/orbyt.db "PRAGMA integrity_check;"
```

3. Restore storage: `rsync -a /backups/storage/ ./storage/`
4. Start the app and verify:

```bash
curl -s https://<host>/api/healthz | jq '.status, .checks'
```

Expected: `status: "ok"`, `checks.db.ok: true`, `checks.storage.ok: true`.

### Restore drill (monthly)

Restore the latest backup to a scratch directory, run `integrity_check`, boot the app against the copy with a temporary `DATABASE_URL`, log in with a test account, and run `GET /api/healthz`. Record the result in the worklog. An unverified backup is a hope, not a backup.

## Health and monitoring

- `GET /api/healthz` — machine-readable health: database roundtrip, storage roundtrip, email provider + outbox counts. `200` healthy, `503` degraded. Wire uptime monitoring to it.
- Request correlation: every request carries an `x-request-id` (response header). Search `dev.log` (or the production log) for `req=<id>` to correlate a request line with any error lines from the same request.
- Email delivery is a stored fact: query `EmailMessage` (status `QUEUED`/`SENT`/`FAILED`). A `FAILED` row carries the provider error; the outbox counts appear in `healthz.checks.email.outbox`.

## Environment

| Variable | Purpose | Default |
| --- | --- | --- |
| `DATABASE_URL` | SQLite file location | `db/` file |
| `NEXTAUTH_SECRET` | Session signing. MUST be pinned; rotation logs out every user | (pinned in `src/lib/auth.ts` for dev) |
| `NEXTAUTH_URL` | Absolute base URL used in emails | `http://localhost:3000` |
| `EMAIL_PROVIDER` | `console` (dev) or `resend` | `console` |
| `RESEND_API_KEY` | Required when `EMAIL_PROVIDER=resend` | unset |
| `EMAIL_FROM` | From header for outbound email | `ORBYT <no-reply@orbyt.com>` |
| `STORAGE_PROVIDER` | `local` or `s3` | `local` |
| `STORAGE_DIR` | Local storage root | `./storage` |
| `PROVISION_API_KEY` | Bearer key for `/api/lifecycle/*` (staff provisioning) | unset = endpoints refuse |

## Known limits (honest)

- Rate limiting is in-process (fixed window). A single server deployment is exactly that; horizontal scaling needs a shared store at the documented swap point in `src/lib/rate-limit.ts`.
- SQLite: one writer at a time. Fine for the current scale; the swap point is the Prisma datasource block.
- The `s3` storage provider is selected by env but the adapter is not wired in this deployment; `putObject`/`getObject` refuse loudly rather than fake success.
