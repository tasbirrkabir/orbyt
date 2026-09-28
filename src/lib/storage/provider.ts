/**
 * The StorageProvider boundary. Private, tenant-scoped object storage.
 * Features never talk to a bucket SDK directly; they ask the service
 * (lib/storage) which fans out to the configured provider.
 *
 * Every object key is namespaced per organization: orgs/<orgId>/...
 * Providers only ever see full keys, so cross-tenant access is a
 * concern of the service layer, enforced before any key is built.
 */

export type PutObjectInput = {
  key: string;
  body: Buffer;
  contentType: string;
};

export interface StorageProvider {
  readonly name: string;
  put(input: PutObjectInput): Promise<void>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  /** Raw bytes, for streaming through the authorized download route. */
  download(key: string): Promise<Buffer>;
  /**
   * Short-lived URL for providers that support presigning. When a
   * provider cannot presign, it answers null and the download route
   * streams the bytes itself (still authorization-gated).
   */
  signedUrl(key: string, ttlSeconds: number): Promise<string | null>;
}
