/**
 * Shared HTML shell for every ORBYT transactional email.
 * Brand: Ink & Ember. Email-client-safe: table layout, inline styles,
 * system font stack, no images, hard edges, restrained orange.
 * Every template renders a plain-text twin next to this shell.
 */

export const BRAND = {
  ink: "#0E0E0D",
  paper: "#FAF7F2",
  card: "#FFFFFF",
  ember: "#FD5A01",
  emberInk: "#1B1B1A",
  muted: "#6B675F",
  hairline: "#E5DFD4",
} as const;

export const EMAIL_FROM = process.env.EMAIL_FROM ?? "ORBYT <no-reply@orbyt.com>";

export type EmailShellInput = {
  /** Mono eyebrow, e.g. "ORBYT // SECURITY". */
  eyebrow: string;
  title: string;
  intro?: string;
  /** Primary button. Omit for notice-only emails. */
  action?: { label: string; url: string };
  /** Paragraphs under the action (or intro) as plain text lines. */
  bodyLines?: string[];
  /** Fallback line shown under the button (the raw link). */
  fallbackUrl?: string;
  footerNote?: string;
};

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderEmailHtml(input: EmailShellInput): string {
  const button = input.action
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 4px"><tr><td style="background:${BRAND.ember};border-radius:2px">
        <a href="${esc(input.action.url)}" style="display:inline-block;padding:13px 26px;font-family:ui-monospace,'SFMono-Regular',Menlo,Consolas,monospace;font-size:13px;font-weight:700;letter-spacing:0.08em;color:${BRAND.emberInk};text-decoration:none;text-transform:uppercase">${esc(input.action.label)}</a>
      </td></tr></table>`
    : "";

  const fallback = input.fallbackUrl
    ? `<p style="margin:14px 0 0;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:11px;line-height:1.6;color:${BRAND.muted};word-break:break-all">If the button does not work, paste this link into your browser:<br/>${esc(input.fallbackUrl)}</p>`
    : "";

  const lines = (input.bodyLines ?? [])
    .map(
      (line) =>
        `<p style="margin:0 0 12px;font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;line-height:1.65;color:${BRAND.ink}">${esc(line)}</p>`,
    )
    .join("");

  const footer = input.footerNote
    ? `<p style="margin:0;font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;line-height:1.6;color:${BRAND.muted}">${esc(input.footerNote)}</p>`
    : "";

  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${BRAND.paper}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.paper};padding:32px 12px">
<tr><td align="center">
  <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%">
    <tr><td style="padding:0 4px 18px">
      <span style="font-family:ui-monospace,Menlo,Consolas,monospace;font-size:11px;letter-spacing:0.22em;color:${BRAND.muted};text-transform:uppercase">${esc(input.eyebrow)}</span>
    </td></tr>
    <tr><td style="background:${BRAND.card};border:1px solid ${BRAND.hairline};border-top:3px solid ${BRAND.ember};padding:34px 34px 30px">
      <h1 style="margin:0 0 14px;font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;font-size:22px;line-height:1.3;font-weight:700;color:${BRAND.ink}">${esc(input.title)}</h1>
      ${input.intro ? `<p style="margin:0 0 12px;font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;line-height:1.65;color:${BRAND.ink}">${esc(input.intro)}</p>` : ""}
      ${lines}
      ${button}
      ${fallback}
    </td></tr>
    <tr><td style="padding:18px 4px 0;border-top:1px solid ${BRAND.hairline};margin-top:16px">
      <p style="margin:14px 0 2px;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:11px;letter-spacing:0.18em;color:${BRAND.ink};text-transform:uppercase">ORBYT</p>
      <p style="margin:0 0 10px;font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;color:${BRAND.muted}">Digital systems built for growth. Dhaka, Bangladesh.</p>
      ${footer}
    </td></tr>
  </table>
</td></tr></table>
</body></html>`;
}

export function renderEmailText(input: EmailShellInput): string {
  const lines: string[] = [input.eyebrow, "", input.title.toUpperCase(), ""];
  if (input.intro) lines.push(input.intro, "");
  for (const line of input.bodyLines ?? []) lines.push(line);
  if (input.action) {
    lines.push("", `${input.action.label}: ${input.action.url}`);
  } else if (input.fallbackUrl) {
    lines.push("", input.fallbackUrl);
  }
  if (input.footerNote) lines.push("", input.footerNote);
  lines.push("", "ORBYT. Digital systems built for growth.");
  return lines.join("\n");
}
