import { NextRequest, NextResponse } from "next/server";
import { requireOrgContext } from "@/lib/org-context";
import { canManageBranding } from "@/lib/permissions";
import { uploadOrgAsset } from "@/lib/storage";
import { prisma_db } from "@/lib/prisma";
import { AssetKind } from "@/lib/generated/prisma/client";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/svg+xml",
];

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

const ALLOWED_KINDS: AssetKind[] = ["LOGO", "LETTERHEAD", "STAMP", "SIGNATURE"];

export async function POST(req: NextRequest) {
  try {
    const ctx = await requireOrgContext();

    if (!canManageBranding(ctx.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const kind = formData.get("kind") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_KINDS.includes(kind as AssetKind)) {
      return NextResponse.json(
        { error: "Invalid asset kind. Must be one of: LOGO, LETTERHEAD, STAMP, SIGNATURE" },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: JPEG, PNG, WebP, SVG" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const { storageKey, url, checksum } = await uploadOrgAsset(
      ctx.orgId,
      kind as AssetKind,
      buffer,
      file.name,
      file.type
    );

    // Save asset record to DB
    const asset = await prisma_db.fileAsset.create({
      data: {
        organizationId: ctx.orgId,
        kind: kind as AssetKind,
        fileName: file.name,
        mimeType: file.type,
        storageKey,
        sizeBytes: file.size,
        checksum,
        uploadedById: ctx.userId,
      },
    });

    return NextResponse.json({ success: true, assetId: asset.id, url, storageKey });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    console.error("[Upload API]", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
