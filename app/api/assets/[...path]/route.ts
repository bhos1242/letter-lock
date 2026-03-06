import { NextRequest, NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    },
});

const BUCKET = process.env.S3_BUCKET_NAME || "";

export async function GET(
    req: NextRequest,
    { params }: { params: { path: string[] } }
) {
    try {
        const storageKey = (await params).path.join("/");

        if (!storageKey) {
            return new NextResponse("Not Found", { status: 404 });
        }

        const command = new GetObjectCommand({
            Bucket: BUCKET,
            Key: storageKey,
        });

        const response = await s3.send(command);

        if (!response.Body) {
            return new NextResponse("Not Found", { status: 404 });
        }

        // Convert S3 stream to readable stream for Next.js
        const transformStream = response.Body.transformToWebStream();

        return new NextResponse(transformStream as ReadableStream, {
            headers: {
                "Content-Type": response.ContentType || "application/octet-stream",
                "Cache-Control": "public, max-age=31536000, immutable",
            },
        });
    } catch (error) {
        console.error("[Assets Proxy]", error);
        return new NextResponse("Not Found", { status: 404 });
    }
}
