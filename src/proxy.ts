import { NextResponse, type NextRequest } from "next/server";

/**
 * Edge middleware: one place for response headers that protect every
 * page and API route. Next.js App Router has no framework-level
 * security headers by default; these are the production baseline.
 *
 * CSP notes (deliberate, not lazy): Next.js ships inline bootstrap
 * scripts and dev/Turbopack needs eval, so script-src carries
 * 'unsafe-inline' 'unsafe-eval'. frame-ancestors 'none' plus
 * X-Frame-Options DENY closes clickjacking, object-src 'none' closes
 * plugin content, and every other directive is tight. Loosening any
 * of this needs a written reason in the worklog.
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

export function proxy(_request: NextRequest) {
  const response = NextResponse.next();
  for (const [header, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(header, value);
  }
  return response;
}

export const config = {
  // Everything except immutable asset paths.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
