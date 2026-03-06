import { NextRequest, NextResponse } from "next/server";
import { requireOrgContext } from "@/lib/org-context";
import { prisma_db } from "@/lib/prisma";
import { getPresignedDownloadUrl } from "@/lib/storage";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await requireOrgContext();
    const { id: documentId } = await params;

    const doc = await prisma_db.document.findFirst({
      where: { id: documentId, organizationId: ctx.orgId },
      select: { pdfStorageKey: true, status: true, humanReadableId: true },
    });

    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    if (doc.status !== "ISSUED") {
      return NextResponse.json(
        { error: "PDF is only available for issued documents" },
        { status: 403 }
      );
    }

    if (!doc.pdfStorageKey) {
      return NextResponse.json({ error: "PDF not yet generated" }, { status: 404 });
    }

    const signedUrl = await getPresignedDownloadUrl(doc.pdfStorageKey);

    // Redirect to presigned URL for direct browser download
    return NextResponse.redirect(signedUrl);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to get PDF";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
