import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

/**
 * Upload file to S3 bucket
 * @param file - File buffer to upload
 * @param originalFilename - Original filename (optional, for extension)
 * @returns Public URL of uploaded file
 */
export async function uploadToS3(
  file: Buffer,
  originalFilename?: string
): Promise<string> {
  try {
    // Generate unique filename
    const fileExtension = originalFilename
      ? originalFilename.split(".").pop()
      : "jpg";
    const uniqueFilename = `avatars/${crypto.randomUUID()}.${fileExtension}`;

    const bucketName = process.env.S3_BUCKET_NAME;
    if (!bucketName) {
      throw new Error("S3_BUCKET_NAME environment variable is not set");
    }

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: uniqueFilename,
      Body: file,
      ContentType: `image/${fileExtension}`,
    });

    await s3Client.send(command);

    // Return public URL (assuming bucket has public read access)
    const publicUrl = `/api/assets/${uniqueFilename}`;

    return publicUrl;
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw new Error("Failed to upload file to S3");
  }
}

/**
 * Upload avatar from form data
 * @param formData - FormData containing the avatar file
 * @returns Public URL of uploaded avatar or null
 */
export async function uploadAvatar(formData: FormData): Promise<string | null> {
  try {
    const avatar = formData.get("avatar") as File | null;

    if (!avatar || avatar.size === 0) {
      return null;
    }

    // Convert File to Buffer
    const bytes = await avatar.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to S3
    const url = await uploadToS3(buffer, avatar.name);
    return url;
  } catch (error) {
    console.error("Error uploading avatar:", error);
    return null;
  }
}
