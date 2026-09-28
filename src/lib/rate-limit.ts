/**
 * The one rate limiter for the whole platform.
 *
 * Before this module there were three copy-pasted in-memory limiters
 * (contact, requests, check-in) drifting apart in limits and cleanup
 * behavior. Every endpoint that throttles now calls checkRateLimit.
 *
 * Mechanics: fixed-window counters in a module-scoped Map, keyed by
 * `bucket:identifier`. Sweep of expired entries runs lazily whenever
 * the map grows past the sweep threshold, so the map cannot grow
 * unbounded.
 *
 * Honest limits: this is per process. A single Next.js server (this
 * deployment) is exactly that; a horizontally scaled deployment needs
 * a shared store (the interface below is the swap point, documented in
 * worklog). All callers treat "limit exceeded" as a 429 with a plain
 * retry message and never leak which identifier tripped it.
 */

const WINDOW_MS_DEFAULT = 10 * 60 * 1000

type Entry = { count: number; windowStart: number }

const store = new Map<string, Entry>()

/** Sweep when the map holds more than this many keys. */
const SWEEP_THRESHOLD = 1000

export type RateLimitResult = {
  ok: boolean
  /** Seconds until the window resets; only meaningful when ok is false. */
  retryAfterSeconds: number
}

export type RateLimitOptions = {
  /**
   * Inspect the counter without spending an attempt. Used by guards
   * that must decide BEFORE comparing a secret: peek first, compare,
   * and only record the attempt when the secret was wrong. Correct
   * credentials then never consume the budget, while brute force is
   * still locked out after the limit.
   */
  peek?: boolean
}

export function checkRateLimit(
  bucket: string,
  identifier: string,
  limit: number,
  windowMs: number = WINDOW_MS_DEFAULT,
  options: RateLimitOptions = {},
): RateLimitResult {
  const now = Date.now()
  const key = `${bucket}:${identifier}`

  if (store.size > SWEEP_THRESHOLD) {
    for (const [key, entry] of store) {
      if (now - entry.windowStart >= windowMs) store.delete(key)
    }
  }

  const entry = store.get(key)

  if (options.peek) {
    if (!entry || now - entry.windowStart >= windowMs) {
      return { ok: true, retryAfterSeconds: 0 }
    }
    if (entry.count >= limit) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((entry.windowStart + windowMs - now) / 1000),
      )
      return { ok: false, retryAfterSeconds }
    }
    return { ok: true, retryAfterSeconds: 0 }
  }

  if (!entry || now - entry.windowStart >= windowMs) {
    store.set(key, { count: 1, windowStart: now })
    return { ok: true, retryAfterSeconds: 0 }
  }

  entry.count += 1
  if (entry.count > limit) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((entry.windowStart + windowMs - now) / 1000),
    )
    return { ok: false, retryAfterSeconds }
  }
  return { ok: true, retryAfterSeconds: 0 }
}

/**
 * Best-effort client IP from proxy headers. The first hop of
 * x-forwarded-for is what the edge gateway saw; fall back through the
 * known headers and end on "unknown" so limits still apply coarsely.
 *
 * Accepts both header shapes the platform hands out: a WHATWG Headers
 * instance (fetch-style) and a plain object (node-style, which is what
 * NextAuth v4 passes into the credentials authorize callback).
 */
type HeaderBag = Headers | Record<string, string | string[] | undefined>;

export type { HeaderBag };

export function clientIp(request: { headers: HeaderBag }): string {
  const bag = request.headers;
  const read = (name: string): string => {
    const maybeHeaders = bag as {
      get?: (name: string) => string | null;
    };
    if (typeof maybeHeaders.get === "function") {
      return maybeHeaders.get(name)?.trim() ?? "";
    }
    const value = (bag as Record<string, string | string[] | undefined>)[name];
    return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
  };
  const forwarded = read("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return read("x-real-ip") || "unknown";
}
