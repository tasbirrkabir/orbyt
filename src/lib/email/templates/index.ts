import { renderEmailHtml, renderEmailText, type EmailShellInput } from "./layout";

/**
 * The transactional template registry. Every email the platform sends
 * goes through here; features pass a payload, never HTML. Templates
 * never include credentials, tokens beyond the single action link, or
 * internal metadata. Unsubscribe headers are intentionally absent:
 * every template here is transactional (security or operational),
 * not marketing.
 *
 * Demo rule: the default provider is the console transport, so demo
 * tenants cannot send real email unless a real provider is explicitly
 * configured in the environment.
 */

export type EmailTemplateKey =
  | "PASSWORD_RESET"
  | "CLIENT_WELCOME"
  | "CLIENT_ID_ISSUED"
  | "PROJECT_CREATED"
  | "PROJECT_UPDATE"
  | "APPROVAL_REQUESTED"
  | "APPROVAL_COMPLETED"
  | "REQUEST_RECEIVED"
  | "REQUEST_REPLY"
  | "MESSAGE_RECEIVED"
  | "MEETING_SCHEDULED"
  | "MEETING_REMINDER"
  | "INVOICE_ISSUED"
  | "INVOICE_DUE"
  | "PAYMENT_RECEIVED"
  | "SYSTEM_ISSUE"
  | "SYSTEM_RECOVERED"
  | "ONBOARDING_COMPLETE";

export const APP_URL = process.env.APP_URL ?? process.env.NEXTAUTH_URL ?? "";

function url(path: string): string {
  return `${APP_URL}${path}`;
}

export type EmailPayload =
  | { key: "PASSWORD_RESET"; name: string; resetUrl: string; minutesValid: number }
  | { key: "CLIENT_WELCOME"; name: string; organizationName: string; loginUrl: string }
  | { key: "CLIENT_ID_ISSUED"; name: string; clientId: string; organizationName: string; loginUrl: string }
  | { key: "PROJECT_CREATED"; name: string; projectTitle: string; projectCode: string; projectUrl: string }
  | { key: "PROJECT_UPDATE"; name: string; projectTitle: string; updateTitle: string; projectUrl: string }
  | { key: "APPROVAL_REQUESTED"; name: string; approvalTitle: string; version: string; approvalsUrl: string }
  | { key: "APPROVAL_COMPLETED"; name: string; approvalTitle: string; decision: string; projectUrl: string }
  | { key: "REQUEST_RECEIVED"; name: string; requestCode: string; requestTitle: string; requestUrl: string }
  | { key: "REQUEST_REPLY"; name: string; requestCode: string; replyPreview: string; requestUrl: string }
  | { key: "MESSAGE_RECEIVED"; name: string; threadSubject: string; messagePreview: string; threadUrl: string }
  | { key: "MEETING_SCHEDULED"; name: string; meetingTitle: string; startsAt: string; meetingsUrl: string }
  | { key: "MEETING_REMINDER"; name: string; meetingTitle: string; startsAt: string; meetingsUrl: string }
  | { key: "INVOICE_ISSUED"; name: string; invoiceNumber: string; amountLabel: string; dueLabel: string; billingUrl: string }
  | { key: "INVOICE_DUE"; name: string; invoiceNumber: string; amountLabel: string; dueLabel: string; billingUrl: string }
  | { key: "PAYMENT_RECEIVED"; name: string; invoiceNumber: string; amountLabel: string; method: string; billingUrl: string }
  | { key: "SYSTEM_ISSUE"; name: string; systemName: string; summary: string; systemsUrl: string }
  | { key: "SYSTEM_RECOVERED"; name: string; systemName: string; systemsUrl: string }
  | { key: "ONBOARDING_COMPLETE"; name: string; workspaceUrl: string };

/** Build the brand shell input for a payload. One branch per template. */
function shellFor(payload: EmailPayload): EmailShellInput {
  switch (payload.key) {
    case "PASSWORD_RESET":
      return {
        eyebrow: "ORBYT // ACCOUNT SECURITY",
        title: "Reset your password",
        intro: `Hi ${payload.name}, someone requested a password reset for your ORBYT account.`,
        bodyLines: [
          "If this was you, use the button below to choose a new password.",
          `The link works once and expires in ${payload.minutesValid} minutes. If the link expired, request a new one from the login page.`,
          "If you did not ask for this, you can ignore this email. Your password stays as it was.",
        ],
        action: { label: "Choose a new password", url: payload.resetUrl },
        fallbackUrl: payload.resetUrl,
        footerNote: "ORBYT will never ask for your password by email or phone.",
      };
    case "CLIENT_WELCOME":
      return {
        eyebrow: "ORBYT // WELCOME",
        title: "Your ORBYT portal is ready",
        intro: `Hi ${payload.name}, your engagement with ${payload.organizationName} now has a home in ORBYT.`,
        bodyLines: [
          "The portal is where your project lives: progress, files, approvals, requests, messages and billing, all in one place.",
          "Sign in with your email and the password ORBYT issued to you. Keep the password to yourself.",
        ],
        action: { label: "Open the portal", url: payload.loginUrl },
        fallbackUrl: payload.loginUrl,
      };
    case "CLIENT_ID_ISSUED":
      return {
        eyebrow: "ORBYT // PORTAL ACCESS",
        title: "Your client ID",
        intro: `Hi ${payload.name}, ORBYT issued the portal key for ${payload.organizationName}.`,
        bodyLines: [
          `Client ID: ${payload.clientId}`,
          "You will need this ID, your email and your password every time you sign in. Treat the ID like a key: share it only with your own teammates.",
        ],
        action: { label: "Sign in", url: payload.loginUrl },
        fallbackUrl: payload.loginUrl,
      };
    case "PROJECT_CREATED":
      return {
        eyebrow: "ORBYT // PROJECT",
        title: `Work has started: ${payload.projectTitle}`,
        intro: `Hi ${payload.name}, your project ${payload.projectCode} is now on the ORBYT board.`,
        bodyLines: [
          "You can follow the stage rail, milestones and the crew log from the portal at any time.",
        ],
        action: { label: "Open the project", url: payload.projectUrl },
        fallbackUrl: payload.projectUrl,
      };
    case "PROJECT_UPDATE":
      return {
        eyebrow: "ORBYT // CREW LOG",
        title: `Update on ${payload.projectTitle}`,
        intro: `Hi ${payload.name}, the crew posted an update: ${payload.updateTitle}.`,
        bodyLines: ["Open the project to read the full entry and see where things stand."],
        action: { label: "Open the project", url: payload.projectUrl },
        fallbackUrl: payload.projectUrl,
      };
    case "APPROVAL_REQUESTED":
      return {
        eyebrow: "ORBYT // APPROVAL",
        title: "Your approval is needed",
        intro: `Hi ${payload.name}, ${payload.approvalTitle} (${payload.version}) is waiting for your decision.`,
        bodyLines: [
          "Approvals are one-way records: once you decide, the decision and its comment stay on file.",
        ],
        action: { label: "Review and decide", url: payload.approvalsUrl },
        fallbackUrl: payload.approvalsUrl,
      };
    case "APPROVAL_COMPLETED":
      return {
        eyebrow: "ORBYT // APPROVAL",
        title: `Decision recorded: ${payload.decision}`,
        intro: `Hi ${payload.name}, your decision on ${payload.approvalTitle} is on the record.`,
        bodyLines: ["The project page reflects the current state of the work."],
        action: { label: "Open the project", url: payload.projectUrl },
        fallbackUrl: payload.projectUrl,
      };
    case "REQUEST_RECEIVED":
      return {
        eyebrow: "ORBYT // REQUEST",
        title: `Request ${payload.requestCode} received`,
        intro: `Hi ${payload.name}, the desk has your request: ${payload.requestTitle}.`,
        bodyLines: [
          "You will see replies and status changes on the request page. The desk answers within one business day.",
        ],
        action: { label: "Track the request", url: payload.requestUrl },
        fallbackUrl: payload.requestUrl,
      };
    case "REQUEST_REPLY":
      return {
        eyebrow: "ORBYT // REQUEST",
        title: `Reply on ${payload.requestCode}`,
        intro: `Hi ${payload.name}, the desk replied to your request.`,
        bodyLines: [payload.replyPreview],
        action: { label: "Read the reply", url: payload.requestUrl },
        fallbackUrl: payload.requestUrl,
      };
    case "MESSAGE_RECEIVED":
      return {
        eyebrow: "ORBYT // MESSAGES",
        title: `New message: ${payload.threadSubject}`,
        intro: `Hi ${payload.name}, you have a message from the ORBYT desk.`,
        bodyLines: [payload.messagePreview],
        action: { label: "Open the conversation", url: payload.threadUrl },
        fallbackUrl: payload.threadUrl,
      };
    case "MEETING_SCHEDULED":
      return {
        eyebrow: "ORBYT // MEETING",
        title: `Meeting scheduled: ${payload.meetingTitle}`,
        intro: `Hi ${payload.name}, a meeting is on the calendar.`,
        bodyLines: [`When: ${payload.startsAt}`],
        action: { label: "See your meetings", url: payload.meetingsUrl },
        fallbackUrl: payload.meetingsUrl,
      };
    case "MEETING_REMINDER":
      return {
        eyebrow: "ORBYT // MEETING",
        title: `Coming up: ${payload.meetingTitle}`,
        intro: `Hi ${payload.name}, a reminder for your upcoming meeting.`,
        bodyLines: [`When: ${payload.startsAt}`],
        action: { label: "See your meetings", url: payload.meetingsUrl },
        fallbackUrl: payload.meetingsUrl,
      };
    case "INVOICE_ISSUED":
      return {
        eyebrow: "ORBYT // BILLING",
        title: `Invoice ${payload.invoiceNumber} issued`,
        intro: `Hi ${payload.name}, a new invoice is in your portal.`,
        bodyLines: [`Amount: ${payload.amountLabel}`, `Due: ${payload.dueLabel}`],
        action: { label: "Open billing", url: payload.billingUrl },
        fallbackUrl: payload.billingUrl,
      };
    case "INVOICE_DUE":
      return {
        eyebrow: "ORBYT // BILLING",
        title: `Invoice ${payload.invoiceNumber} is due`,
        intro: `Hi ${payload.name}, this invoice is due for payment.`,
        bodyLines: [`Amount: ${payload.amountLabel}`, `Due: ${payload.dueLabel}`],
        action: { label: "Open billing", url: payload.billingUrl },
        fallbackUrl: payload.billingUrl,
      };
    case "PAYMENT_RECEIVED":
      return {
        eyebrow: "ORBYT // BILLING",
        title: `Payment received for ${payload.invoiceNumber}`,
        intro: `Hi ${payload.name}, we have recorded your payment. Thank you.`,
        bodyLines: [`Amount: ${payload.amountLabel}`, `Method: ${payload.method}`],
        action: { label: "Open billing", url: payload.billingUrl },
        fallbackUrl: payload.billingUrl,
      };
    case "SYSTEM_ISSUE":
      return {
        eyebrow: "ORBYT // SYSTEMS",
        title: `We are looking into: ${payload.systemName}`,
        intro: `Hi ${payload.name}, one of your systems is not behaving as expected.`,
        bodyLines: [payload.summary, "The crew is on it. You do not need to do anything."],
        action: { label: "System status", url: payload.systemsUrl },
        fallbackUrl: payload.systemsUrl,
      };
    case "SYSTEM_RECOVERED":
      return {
        eyebrow: "ORBYT // SYSTEMS",
        title: `Back to normal: ${payload.systemName}`,
        intro: `Hi ${payload.name}, the issue with ${payload.systemName} has cleared.`,
        bodyLines: ["Everything is running as expected again."],
        action: { label: "System status", url: payload.systemsUrl },
        fallbackUrl: payload.systemsUrl,
      };
    case "ONBOARDING_COMPLETE":
      return {
        eyebrow: "ORBYT // ONBOARDING",
        title: "Onboarding complete",
        intro: `Hi ${payload.name}, your onboarding answers are in. The crew has everything needed to move.`,
        bodyLines: ["Next steps happen in the portal: the project board, the crew log and your approvals."],
        action: { label: "Open the workspace", url: payload.workspaceUrl },
        fallbackUrl: payload.workspaceUrl,
      };
  }
}

export function renderTemplate(payload: EmailPayload): {
  subject: string;
  html: string;
  text: string;
} {
  const shell = shellFor(payload);
  return {
    subject: shell.title,
    html: renderEmailHtml(shell),
    text: renderEmailText(shell),
  };
}

/** Deep-link helpers shared by features (relative -> absolute). */
export const emailLinks = {
  login: () => url("/login"),
  workspace: () => url("/workspace"),
  projects: () => url("/workspace/projects"),
  project: (id: string) => url(`/workspace/projects/${id}`),
  approvals: () => url("/workspace/approvals"),
  requests: () => url("/workspace/requests"),
  request: (id: string) => url(`/workspace/requests/${id}`),
  thread: (id: string) => url(`/workspace/messages/${id}`),
  meetings: () => url("/workspace/meetings"),
  billing: () => url("/workspace/billing"),
  systems: () => url("/workspace/systems"),
  resetPassword: (token: string) => url(`/reset-password?token=${encodeURIComponent(token)}`),
};
