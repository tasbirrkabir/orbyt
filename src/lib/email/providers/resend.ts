import type { EmailDeliveryResult, EmailEnvelope, EmailProvider } from "../provider";

/**
 * Resend provider. Activates only when EMAIL_PROVIDER=resend AND
 * RESEND_API_KEY is present; otherwise the service never constructs
 * it. Uses plain fetch so there is no SDK dependency. Every failure
 * answers a categorized result: the queue records it, features never
 * crash on it.
 */
export class ResendEmailProvider implements EmailProvider {
  readonly name = "resend";
  private readonly apiKey: string;
  private readonly from: string;

  constructor(apiKey: string, from: string) {
    this.apiKey = apiKey;
    this.from = from;
  }

  async send(message: EmailEnvelope): Promise<EmailDeliveryResult> {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: this.from,
          to: [message.to],
          subject: message.subject,
          html: message.html,
          text: message.text,
        }),
        // A slow provider must never hold a user action; the queue
        // call site runs in the background anyway.
        signal: AbortSignal.timeout(10_000),
      });

      if (response.ok) {
        const body = (await response.json().catch(() => ({}))) as { id?: string };
        return { ok: true, providerId: body.id ?? "" };
      }

      const status = response.status;
      const category =
        status === 401 || status === 403
          ? "AUTH"
          : status === 429
            ? "RATE_LIMIT"
            : "PROVIDER";
      const detail = await response.text().catch(() => "");
      return {
        ok: false,
        errorCategory: category,
        errorMessage: detail.slice(0, 300) || `HTTP ${status}`,
      };
    } catch (error) {
      const message0 = error instanceof Error ? error.message : "network error";
      return {
        ok: false,
        errorCategory: "NETWORK",
        errorMessage: message0.slice(0, 300),
      };
    }
  }
}
