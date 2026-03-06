import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
import { AssetKind } from "./generated/prisma/client";

const s3 = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET = process.env.S3_BUCKET_NAME || "";

const ASSET_FOLDER: Record<AssetKind, string> = {
  LOGO: "branding/logos",
  LETTERHEAD: "branding/letterheads",
  STAMP: "branding/stamps",
  SIGNATURE: "branding/signatures",
  DOCUMENT_PDF: "documents",
};

/**
 * Uploads an org-scoped asset to S3.
 * Storage key format: organizations/{orgId}/{folder}/{uuid}.{ext}
 */
export async function uploadOrgAsset(
  orgId: string,
  kind: AssetKind,
  buffer: Buffer,
  originalFilename: string,
  mimeType: string
): Promise<{ storageKey: string; url: string; checksum: string }> {
  const ext = originalFilename.split(".").pop() ?? "bin";
  const folder = ASSET_FOLDER[kind];
  const storageKey = `organizations/${orgId}/${folder}/${crypto.randomUUID()}.${ext}`;

  const checksum = crypto.createHash("sha256").update(buffer).digest("hex");

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: storageKey,
      Body: buffer,
      ContentType: mimeType,
      Metadata: { orgId, checksum },
    })
  );

  const url = `/api/assets/${storageKey}`;

  return { storageKey, url, checksum };
}

/**
 * Uploads a generated PDF document to S3.
 */
export async function uploadDocumentPDF(
  orgId: string,
  documentId: string,
  pdfBuffer: Buffer
): Promise<{ storageKey: string; hashSha256: string }> {
  const storageKey = `organizations/${orgId}/documents/${documentId}.pdf`;
  const hashSha256 = crypto.createHash("sha256").update(pdfBuffer).digest("hex");

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: storageKey,
      Body: pdfBuffer,
      ContentType: "application/pdf",
      Metadata: { orgId, documentId, sha256: hashSha256 },
    })
  );

  return { storageKey, hashSha256 };
}

/**
 * Returns a presigned URL for downloading a private S3 object (valid 1 hour).
 */
export async function getPresignedDownloadUrl(storageKey: string): Promise<string> {
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: storageKey });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return getSignedUrl(s3 as any, command as any, { expiresIn: 3600 });
}

/**
 * Returns the public URL for a storage key.
 * Only use this if the bucket/object is publicly accessible.
 */
export function getPublicUrl(storageKey: string): string {
  return `/api/assets/${storageKey}`;
}

/**
 * Deletes an object from S3.
 */
export async function deleteStorageObject(storageKey: string): Promise<void> {
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: storageKey }));
}

/**
 * Downloads an object from S3 as a Buffer.
 */
export async function downloadAsBuffer(storageKey: string): Promise<Buffer> {
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: storageKey });
  const response = await s3.send(command);

  if (!response.Body) {
    throw new Error(`S3 Object not found or empty: ${storageKey}`);
  }

  // Convert S3 Body (Readable) to Buffer
  const bytes = await response.Body.transformToByteArray();
  return Buffer.from(bytes);
}

/**
 * Computes SHA-256 hash of a buffer.
 */
export function hashBuffer(buffer: Buffer): string {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

// Re-export the existing avatar upload for compatibility
export { uploadToS3, uploadAvatar } from "./s3";
