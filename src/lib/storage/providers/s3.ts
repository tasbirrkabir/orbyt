import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { PutObjectInput, StorageProvider } from "../provider";

/**
 * S3 / Cloudflare R2 storage provider.
 * Supports standard AWS S3 as well as Cloudflare R2 object storage.
 */
export class S3StorageProvider implements StorageProvider {
  readonly name = "s3";
  private client: S3Client;
  readonly bucket: string;

  constructor() {
    const endpoint =
      process.env.R2_ENDPOINT?.trim() ||
      process.env.S3_ENDPOINT?.trim() ||
      (process.env.R2_ACCOUNT_ID?.trim()
        ? `https://${process.env.R2_ACCOUNT_ID.trim()}.r2.cloudflarestorage.com`
        : undefined);

    const accessKeyId =
      process.env.R2_ACCESS_KEY_ID?.trim() ||
      process.env.S3_ACCESS_KEY_ID?.trim() ||
      "";
    const secretAccessKey =
      process.env.R2_SECRET_ACCESS_KEY?.trim() ||
      process.env.S3_SECRET_ACCESS_KEY?.trim() ||
      "";
    const region = process.env.S3_REGION?.trim() || "auto";

    this.bucket =
      process.env.R2_BUCKET?.trim() ||
      process.env.S3_BUCKET?.trim() ||
      "orbyt-storage";

    this.client = new S3Client({
      region,
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async put({ key, body, contentType }: PutObjectInput): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType || "application/octet-stream",
      })
    );
  }

  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      })
    );
  }

  async exists(key: string): Promise<boolean> {
    try {
      await this.client.send(
        new HeadObjectCommand({
          Bucket: this.bucket,
          Key: key,
        })
      );
      return true;
    } catch (err: unknown) {
      const code = (err as { name?: string; $metadata?: { httpStatusCode?: number } });
      if (code?.name === "NotFound" || code?.$metadata?.httpStatusCode === 404) {
        return false;
      }
      throw err;
    }
  }

  async head(key: string): Promise<{ sizeBytes: number } | null> {
    try {
      const res = await this.client.send(
        new HeadObjectCommand({
          Bucket: this.bucket,
          Key: key,
        })
      );
      return { sizeBytes: res.ContentLength ?? 0 };
    } catch (err: unknown) {
      const code = (err as { name?: string; $metadata?: { httpStatusCode?: number } });
      if (code?.name === "NotFound" || code?.$metadata?.httpStatusCode === 404) {
        return null;
      }
      throw err;
    }
  }

  async download(key: string): Promise<Buffer> {
    try {
      const res = await this.client.send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: key,
        })
      );
      if (!res.Body) throw new Error("Object not found");
      const bytes = await res.Body.transformToByteArray();
      return Buffer.from(bytes);
    } catch (err: unknown) {
      const code = (err as { name?: string; $metadata?: { httpStatusCode?: number } });
      if (code?.name === "NoSuchKey" || code?.name === "NotFound" || code?.$metadata?.httpStatusCode === 404) {
        throw new Error("Object not found");
      }
      throw err;
    }
  }

  async signedUrl(key: string, ttlSeconds: number): Promise<string | null> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      return await getSignedUrl(this.client, command, { expiresIn: ttlSeconds });
    } catch {
      return null;
    }
  }
}

let s3Instance: S3StorageProvider | null = null;
export function getS3Provider(): S3StorageProvider {
  if (!s3Instance) {
    s3Instance = new S3StorageProvider();
  }
  return s3Instance;
}
