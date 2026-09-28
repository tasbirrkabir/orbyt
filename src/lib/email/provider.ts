/**
 * The EmailProvider boundary. Provider-specific code lives ONLY in
 * providers/* and never in features. A provider receives a fully
 * rendered message and answers a delivery result; it never touches
 * the database or the request cycle.
 */

export type EmailEnvelope = {
  to: string;
  toName: string;
  subject: string;
  html: string;
  text: string;
};

export type EmailDeliveryResult = {
  ok: boolean;
  /** Provider's own message id, when it returns one. */
  providerId?: string;
  /** Error category (AUTH, RATE_LIMIT, NETWORK, PROVIDER, UNKNOWN). */
  errorCategory?: string;
  errorMessage?: string;
};

export interface EmailProvider {
  readonly name: string;
  send(message: EmailEnvelope): Promise<EmailDeliveryResult>;
}
