import type { EmailDeliveryResult, EmailEnvelope, EmailProvider } from "../provider";

/**
 * Development / default provider. Nothing leaves the machine: the
 * rendered message is logged as one compact line (recipient, subject,
 * sizes) so dev.log can be traced without dumping bodies. Every send
 * answers ok so the queue drains in development exactly like it would
 * in production.
 */
export class ConsoleEmailProvider implements EmailProvider {
  readonly name = "console";

  async send(message: EmailEnvelope): Promise<EmailDeliveryResult> {
    const htmlKb = Math.max(1, Math.round(message.html.length / 1024));
    console.log(
      `[email:console] to=${message.to} subject="${message.subject}" html=${htmlKb}KB (dev transport, not delivered)`,
    );
    return { ok: true, providerId: `console-${Date.now()}` };
  }
}
