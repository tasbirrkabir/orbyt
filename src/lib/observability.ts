/**
 * ORBYT observability primitives.
 *
 * One request ID per inbound HTTP request, one structured log line per
 * request, and leveled log helpers for everything else. Before this
 * module the platform logged with bare console.* calls scattered per
 * file; correlation between "which request caused which error" did not
 * exist.
 *
 * Design:
 *   - Request IDs come from crypto.randomUUID (global in Node 18+ and
 *     in the edge runtime, so the same helper works in proxy.ts and in
 *     route handlers). If a caller already sent an x-request-id, that
 *     value wins so gateway traces stay intact.
 *   - Log lines are single-line, pipe-delimited key=value pairs: they
 *     stay readable in dev.log and are trivially greppable, and a log
 *     shipper can parse them without a multi-line rule.
 *   - Secrets never go through these helpers: callers pass identifiers
 *     (request id, route, status, org id shape) and never tokens,
 *     passwords or email bodies.
 */

export const REQUEST_ID_HEADER = "x-request-id";

/** The caller-supplied id if present, otherwise a fresh one. */
export function resolveRequestId(incoming: string | null | undefined): string {
  const trimmed = incoming?.trim();
  if (trimmed && trimmed.length >= 8 && trimmed.length <= 128) {
    return trimmed;
  }
  return newRequestId();
}

export function newRequestId(): string {
  // Global crypto exists in Node >= 19 and in edge runtimes.
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === "function") {
    return c.randomUUID();
  }
  // Fallback for exotic runtimes: timestamp + counter is still unique
  // enough within one process for a log correlation id.
  return `req-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

type Level = "info" | "warn" | "error";

export type LogFields = Record<string, string | number | boolean | null | undefined>;

function emit(level: Level, component: string, message: string, fields?: LogFields): void {
  const parts: string[] = [
    `ts=${new Date().toISOString()}`,
    `level=${level}`,
    `component=${component}`,
    message.replace(/[\r\n]+/g, " "),
  ];
  if (fields) {
    for (const [key, value] of Object.entries(fields)) {
      if (value === undefined) continue;
      parts.push(`${key}=${typeof value === "string" ? value.replace(/[\s]+/g, " ") : String(value)}`);
    }
  }
  const line = parts.join(" | ");
  if (level === "error") {
    console.error(line);
  } else if (level === "warn") {
    console.warn(line);
  } else {
    console.log(line);
  }
}

export const log = {
  info: (component: string, message: string, fields?: LogFields) =>
    emit("info", component, message, fields),
  warn: (component: string, message: string, fields?: LogFields) =>
    emit("warn", component, message, fields),
  error: (component: string, message: string, fields?: LogFields) =>
    emit("error", component, message, fields),
};

/**
 * Named-event sugar used by the auth guards: same output channel as
 * log.info, but the call site reads as "this event happened".
 */
export function logEvent(component: string, event: string, fields?: LogFields): void {
  log.info(component, event, fields);
}

/**
 * The one request log line, emitted by proxy.ts for every request.
 *
 * Honest scope: the edge hop runs before the route handler, so the
 * status the handler finally returns is NOT known here and is never
 * claimed. This line carries correlation (req), the route, and the
 * edge hop time; status-level facts come from the handlers themselves
 * (the portal funnel, auth routes and healthz log their own outcomes)
 * and share the same req id.
 */
export function logRequest(entry: {
  requestId: string;
  method: string;
  path: string;
  durationMs: number;
}): void {
  emit("info", "http", "request", {
    req: entry.requestId,
    method: entry.method,
    path: entry.path,
    edgeMs: entry.durationMs,
  });
}
