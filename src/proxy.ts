import { NextResponse, type NextRequest } from "next/server";
import { logRequest, REQUEST_ID_HEADER, resolveRequestId } from "@/lib/observability";

/**
 * Edge middleware: one place for response headers that protect every
 * page and API route, plus request correlation.
 *
 * Security headers: Next.js App Router has no framework-level security
 * headers by default; these are the production baseline. CSP notes
 * (deliberate, not lazy): Next.js ships inline bootstrap scripts and
 * dev/Turbopack needs eval, so script-src carries 'unsafe-inline'
 * 'unsafe-eval'. frame-ancestors 'none' plus X-Frame-Options DENY
 * closes clickjacking, object-src 'none' closes plugin content, and
 * every other directive is tight. Loosening any of this needs a
 * written reason in the worklog.
 *
 * Request correlation: every request gets an x-request-id (a caller
 * supplied one wins) forwarded to route handlers via the request
 * headers and mirrored on the response, and exactly one structured
 * request log line is emitted here. Route handlers that log errors can
 * read the same header, so an error line and its request line share a
 * correlation id end to end.
 */

const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; "),
};

export function proxy(request: NextRequest) {
  const requestId = resolveRequestId(request.headers.get(REQUEST_ID_HEADER));
  const startedAt = Date.now();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(REQUEST_ID_HEADER, requestId);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  for (const [header, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(header, value);
  }
  response.headers.set(REQUEST_ID_HEADER, requestId);

  const { method } = request;
  const path = request.nextUrl.pathname;
  logRequest({ requestId, method, path, durationMs: Date.now() - startedAt });

  return response;
}

export const config = {
  // Everything except immutable asset paths.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
