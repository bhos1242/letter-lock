import { NextRequest, NextResponse } from "next/server";
import { prisma_db } from "@/lib/prisma";
import { logAudit, AUDIT_ACTIONS } from "@/lib/audit";
import crypto from "crypto";

// Simple in-memory rate limiter per IP (resets on cold start — acceptable for MVP)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) return true;
  return false;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ uvid: string }> }
) {
  // Rate limit by IP
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait before trying again." },
      { status: 429 }
    );
  }

  const { uvid } = await params;

  if (!uvid || uvid.length > 100) {
    return NextResponse.json({ error: "Invalid verification ID" }, { status: 400 });
  }

  const doc = await prisma_db.document.findUnique({
    where: { uvid },
    include: {
      organization: { select: { name: true, slug: true } },
    },
  });

  if (!doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  // Log verification event with hashed IP
  const ipHash = crypto.createHash("sha256").update(ip + (process.env.AUTH_SECRET ?? "")).digest("hex");

  await prisma_db.verificationEvent.create({
    data: {
      documentId: doc.id,
      organizationId: doc.organizationId,
      method: "DIRECT_LINK",
      ipHash,
      userAgent: req.headers.get("user-agent") ?? undefined,
    },
  });

  await logAudit({
    organizationId: doc.organizationId,
    action: AUDIT_ACTIONS.DOCUMENT_VERIFIED,
    targetType: "Document",
    targetId: doc.id,
    meta: { method: "DIRECT_LINK" },
  });

  // Return only safe public fields
  return NextResponse.json({
    status: doc.status,
    humanReadableId: doc.humanReadableId,
    uvid: doc.uvid,
    verificationCode: doc.verificationCode,
    type: doc.type,
    recipientName: doc.recipientName,
    roleTitle: doc.roleTitle,
    issuedAt: doc.issuedAt,
    revokedAt: doc.revokedAt,
    revocationReason: doc.revokedAt ? doc.revocationReason : null,
    organization: {
      name: doc.organization.name,
      slug: doc.organization.slug,
    },
  });
}

// Hash upload endpoint — compare uploaded PDF hash with stored hash
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ uvid: string }> }
) {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { uvid } = await params;

  const doc = await prisma_db.document.findUnique({
    where: { uvid },
    select: { pdfHashSha256: true, status: true, organizationId: true, id: true },
  });

  if (!doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  if (!doc.pdfHashSha256) {
    return NextResponse.json({ error: "Hash not available for this document" }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const uploadedHash = body?.hash as string | undefined;

  if (!uploadedHash || typeof uploadedHash !== "string" || uploadedHash.length !== 64) {
    return NextResponse.json({ error: "Invalid hash provided" }, { status: 400 });
  }

  const matches = doc.pdfHashSha256 === uploadedHash.toLowerCase();

  await prisma_db.verificationEvent.create({
    data: {
      documentId: doc.id,
      organizationId: doc.organizationId,
      method: "HASH_CHECK",
    },
  });

  return NextResponse.json({
    hashMatch: matches,
    message: matches
      ? "Hash matches the original issued PDF"
      : "Hash does not match — the PDF may have been modified",
  });
}
