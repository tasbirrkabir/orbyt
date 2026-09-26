/**
 * ORBYT email templates. Every template returns a subject, a plain
 * text body and an HTML body: plain first, because that is what every
 * client and every filter reads. Copy rules from the brand apply here
 * too: human, specific, calm, direct; no em-dashes; no hype words.
 *
 * Security emails never include more than the action itself: no client
 * IDs, no usernames, no internal jargon. Links are absolute and each
 * carries its own single-use token.
 */

export type RenderedEmail = {
  subject: string;
  text: string;
  html: string;
};

const BRAND = {
  ink: "#0E0E0D",
  paper: "#FAF7F2",
  orange: "#FD5A01",
  orangeInk: "#1B1B1A",
  muted: "#6B675F",
  border: "#E5DFD4",
};

function shell(title: string, bodyHtml: string): string {
  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
<body style="margin:0;padding:0;background:${BRAND.paper};font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;color:${BRAND.ink};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.paper};padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border:1px solid ${BRAND.border};">
        <tr><td style="padding:20px 32px;border-bottom:1px solid ${BRAND.border};">
          <span style="font-weight:700;font-size:15px;letter-spacing:0.18em;">ORBYT</span>
        </td></tr>
        <tr><td style="padding:32px;">
          ${bodyHtml}
        </td></tr>
        <tr><td style="padding:20px 32px;border-top:1px solid ${BRAND.border};">
          <p style="margin:0;font-size:12px;line-height:1.6;color:${BRAND.muted};">
            ORBYT · Studio and client platform. You are receiving this because it is tied to your ORBYT account. If that is not you, ignore this email and nothing changes.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function button(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background:${BRAND.orange};color:${BRAND.orangeInk};font-weight:600;font-size:14px;padding:12px 24px;text-decoration:none;border-radius:2px;">${label}</a>`;
}

function para(text: string): string {
  return `<p style="margin:0 0 16px;font-size:14px;line-height:1.65;">${text}</p>`;
}

export function passwordResetEmail(input: {
  link: string;
  expiresMinutes: number;
}): RenderedEmail {
  const subject = "Reset your ORBYT password";
  const text = [
    "Someone asked to reset the password on your ORBYT account.",
    "",
    `Open this link within ${input.expiresMinutes} minutes to choose a new one:`,
    input.link,
    "",
    "The link works once. If you did not ask for this, ignore it and your password stays as it was.",
    "",
    "ORBYT",
  ].join("\n");
  const html = shell(
    subject,
    [
      para("Someone asked to reset the password on your ORBYT account."),
      para(`Open the button below within <strong>${input.expiresMinutes} minutes</strong> to choose a new one. The link works once.`),
      button(input.link, "Choose a new password"),
      `<p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:${BRAND.muted};">If the button does not work, paste this link into your browser:<br><span style="word-break:break-all;">${input.link}</span></p>`,
      para("If you did not ask for this, ignore the email. Nothing changes until you open the link."),
    ].join(""),
  );
  return { subject, text, html };
}

export function passwordChangedEmail(input: { when: string }): RenderedEmail {
  const subject = "Your ORBYT password was changed";
  const text = [
    `Your ORBYT password was changed on ${input.when}.`,
    "",
    "Sessions on other devices have been signed out. If this was not you, reply to this email right away and reset your password from the login page.",
    "",
    "ORBYT",
  ].join("\n");
  const html = shell(
    subject,
    [
      para(`Your ORBYT password was changed on <strong>${input.when}</strong>.`),
      para("Sessions on other devices have been signed out."),
      para("If this was not you, reply to this email right away and reset your password from the login page."),
    ].join(""),
  );
  return { subject, text, html };
}

export function mfaEnabledEmail(): RenderedEmail {
  const subject = "Two-step verification is on for your ORBYT account";
  const text = [
    "Two-step verification is now on. Sign-in asks for a code from your authenticator app after your password.",
    "",
    "Keep your backup codes somewhere safe. Each one works once if you ever lose the app.",
    "",
    "ORBYT",
  ].join("\n");
  const html = shell(
    subject,
    [
      para("Two-step verification is now on. Sign-in asks for a code from your authenticator app after your password."),
      para("Keep your backup codes somewhere safe. Each one works once if you ever lose the app."),
    ].join(""),
  );
  return { subject, text, html };
}

export function mfaDisabledEmail(): RenderedEmail {
  const subject = "Two-step verification is off for your ORBYT account";
  const text = [
    "Two-step verification was turned off. Sign-in now only asks for your password.",
    "",
    "If this was not you, reset your password from the login page and turn verification back on from your workspace settings.",
    "",
    "ORBYT",
  ].join("\n");
  const html = shell(
    subject,
    [
      para("Two-step verification was turned off. Sign-in now only asks for your password."),
      para("If this was not you, reset your password from the login page and turn verification back on from your workspace settings."),
    ].join(""),
  );
  return { subject, text, html };
}

export function inviteEmail(input: {
  ownerName: string;
  companyName: string;
  clientId: string;
  activationUrl: string;
  expiresDays: number;
}): RenderedEmail {
  const subject = `Your ORBYT workspace for ${input.companyName} is ready`;
  const text = [
    `Hello ${input.ownerName},`,
    "",
    `Your ORBYT workspace for ${input.companyName} is ready.`,
    "",
    `Your client ID: ${input.clientId}`,
    "You will sign in with this ID, your email and a password.",
    "",
    `Choose your password within ${input.expiresDays} days. The link works once:`,
    input.activationUrl,
    "",
    "After you sign in, the workspace walks you through the rest.",
    "",
    "ORBYT",
  ].join("\n");
  const html = shell(
    subject,
    [
      para(`Hello ${escapeHtml(input.ownerName)},`),
      para(`Your ORBYT workspace for <strong>${escapeHtml(input.companyName)}</strong> is ready.`),
      para(`Your client ID: <strong>${escapeHtml(input.clientId)}</strong><br>You will sign in with this ID, your email and a password.`),
      para(`Choose your password within <strong>${input.expiresDays} days</strong>. The link works once.`),
      button(input.activationUrl, "Choose your password"),
      `<p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:${BRAND.muted};">If the button does not work, paste this link into your browser:<br><span style="word-break:break-all;">${input.activationUrl}</span></p>`,
    ].join(""),
  );
  return { subject, text, html };
}

export function leadReceivedEmail(input: { name: string }): RenderedEmail {
  const subject = "We got your message";
  const text = [
    `Hello ${input.name},`,
    "",
    "Thanks for reaching out to ORBYT. Your message landed with us and a person reads every one.",
    "",
    "You will hear back from us by email within one business day. If it is urgent, reply to this email and say so.",
    "",
    "ORBYT",
  ].join("\n");
  const html = shell(
    subject,
    [
      para(`Hello ${escapeHtml(input.name)},`),
      para("Thanks for reaching out to ORBYT. Your message landed with us and a person reads every one."),
      para("You will hear back from us by email within one business day. If it is urgent, reply to this email and say so."),
    ].join(""),
  );
  return { subject, text, html };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
