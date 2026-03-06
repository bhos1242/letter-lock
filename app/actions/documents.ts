"use server";

import { z } from "zod";
import { prisma_db } from "@/lib/prisma";
import { requireOrgContext } from "@/lib/org-context";
import {
  canIssueDocuments,
  canApproveDocuments,
  canRevokeDocuments,
  requireRole,
} from "@/lib/permissions";
import { renderTemplate, validateVariables, SUPPORTED_VARIABLES } from "@/lib/template-engine";
import {
  generateHumanReadableId,
  generateUVID,
  generateVerificationCode,
} from "@/lib/document-id";
import { generateQRCode } from "@/lib/qr";
import { generateLetterPDF } from "@/lib/pdf";
import { uploadDocumentPDF, getPresignedDownloadUrl, downloadAsBuffer } from "@/lib/storage";
import { sendLetterEmail } from "@/lib/org-email";
import { logAudit, AUDIT_ACTIONS } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { TemplateType } from "@/lib/generated/prisma/client";

const issueDocumentSchema = z.object({
  templateId: z.string().min(1),
  recipientName: z.string().min(1),
  recipientEmail: z.string().email().optional().or(z.literal("")),
  roleTitle: z.string().optional().or(z.literal("")),
  variables: z.record(z.string(), z.string()),
  sendEmail: z.coerce.boolean().default(false),
});

export async function issueDocument(formData: FormData) {
  const ctx = await requireOrgContext();
  requireRole(ctx.role, canIssueDocuments, "You do not have permission to issue documents");

  // Parse variables from formData (they are prefixed with "var_")
  const variables: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("var_")) {
      variables[key.slice(4)] = value as string;
    }
  }

  const parsed = issueDocumentSchema.safeParse({
    templateId: formData.get("templateId"),
    recipientName: formData.get("recipientName"),
    recipientEmail: formData.get("recipientEmail"),
    roleTitle: formData.get("roleTitle"),
    variables,
    sendEmail: formData.get("sendEmail"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { templateId, recipientName, recipientEmail, roleTitle, sendEmail } = parsed.data;

  // Load template (scoped to org)
  const template = await prisma_db.template.findFirst({
    where: { id: templateId, organizationId: ctx.orgId, status: "PUBLISHED" },
    include: { currentVersion: true },
  });

  if (!template || !template.currentVersion) {
    return { error: "Template not found or not published" };
  }

  const requiredVars: string[] = JSON.parse(template.currentVersion.variableSchemaJson);
  const autoFilledVars = ["company_name", "company_address", "company_website", "recipient_email", "issue_date"];
  const missing = validateVariables(requiredVars.filter(v => !autoFilledVars.includes(v)), variables);

  if (missing.length > 0) {
    return { error: `Missing required fields: ${missing.join(", ")}` };
  }

  // Check if template requires approval
  if (template.requiresApproval) {
    // Save as PENDING_APPROVAL
    const uvid = generateUVID();
    const verificationCode = generateVerificationCode();
    const count = await prisma_db.document.count({ where: { organizationId: ctx.orgId } });
    const humanReadableId = generateHumanReadableId(template.type, count + 1);

    const doc = await prisma_db.document.create({
      data: {
        organizationId: ctx.orgId,
        templateId,
        templateVersionId: template.currentVersionId!,
        type: template.type,
        status: "PENDING_APPROVAL",
        humanReadableId,
        uvid,
        verificationCode,
        payloadJson: JSON.stringify(variables),
        recipientName,
        recipientEmail: recipientEmail || null,
        roleTitle: roleTitle || null,
        createdById: ctx.userId,
      },
    });

    await logAudit({
      organizationId: ctx.orgId,
      actorUserId: ctx.userId,
      action: AUDIT_ACTIONS.DOCUMENT_SUBMITTED,
      targetType: "Document",
      targetId: doc.id,
    });

    revalidatePath("/dashboard/documents");
    return { success: true, documentId: doc.id, status: "PENDING_APPROVAL" };
  }

  // Issue directly
  return await _finalizeAndIssueDocument({
    ctx,
    template,
    variables,
    recipientName,
    recipientEmail: recipientEmail || null,
    roleTitle: roleTitle || null,
    sendEmail,
  });
}

async function _finalizeAndIssueDocument(opts: {
  ctx: { userId: string; orgId: string; orgName: string };
  template: { id: string; currentVersionId: string | null; type: TemplateType; currentVersion: { content: string } | null };
  variables: Record<string, string>;
  recipientName: string;
  recipientEmail: string | null;
  roleTitle: string | null;
  sendEmail: boolean;
  existingDocId?: string;
}) {
  const { ctx, template, variables, recipientName, recipientEmail, roleTitle, sendEmail } = opts;

  // Load org branding for PDF and template rendering
  const branding = await prisma_db.organizationBranding.findUnique({
    where: { organizationId: ctx.orgId },
  });

  // Render template content
  const renderedContent = renderTemplate(
    template.currentVersion!.content,
    {
      ...variables,
      company_name: ctx.orgName,
      company_address: branding?.address ?? "",
      company_website: branding?.website ?? "",
      recipient_email: recipientEmail ?? "",
      issue_date: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
    } as Record<string, string>,
    { strict: false, sanitize: false }
  );

  const count = await prisma_db.document.count({ where: { organizationId: ctx.orgId } });
  const uvid = opts.existingDocId ? undefined : generateUVID();
  const verificationCode = opts.existingDocId ? undefined : generateVerificationCode();
  const humanReadableId = opts.existingDocId
    ? undefined
    : generateHumanReadableId(template.type, count + 1);

  // Build verify URL
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:2222";
  const newUvid = uvid ?? generateUVID();
  const verifyUrl = `${appUrl}/verify/${newUvid}`;

  // Build verify URL

  // Generate QR code
  const qrDataUrl = await generateQRCode(verifyUrl);

  // Generate PDF
  const { buffer: pdfBuffer, hashSha256 } = await generateLetterPDF({
    organizationName: ctx.orgName,
    organizationAddress: branding?.address ?? undefined,
    primaryColor: branding?.primaryColor,
    logoUrl: branding?.logoUrl ?? undefined,
    letterheadUrl: branding?.letterheadUrl ?? undefined,
    signatureUrl: branding?.signatureUrl ?? undefined,
    stampUrl: branding?.stampUrl ?? undefined,
    documentType: template.type,
    humanReadableId: humanReadableId ?? opts.existingDocId ?? "DRAFT",
    uvid: newUvid,
    verificationCode: verificationCode ?? "XXXXXXXX",
    verifyUrl,
    qrCodeDataUrl: qrDataUrl,
    renderedContent,
    recipientName,
    issuedAt: new Date(),
  });

  // Store PDF
  const documentId = opts.existingDocId ?? generateUVID();
  const { storageKey, hashSha256: storedHash } = await uploadDocumentPDF(
    ctx.orgId,
    documentId,
    pdfBuffer
  );

  // Upsert document record
  let doc;
  if (opts.existingDocId) {
    doc = await prisma_db.document.update({
      where: { id: opts.existingDocId },
      data: {
        status: "ISSUED",
        pdfStorageKey: storageKey,
        pdfHashSha256: storedHash,
        issuedAt: new Date(),
        approvedById: ctx.userId,
      },
    });
  } else {
    doc = await prisma_db.document.create({
      data: {
        id: documentId,
        organizationId: ctx.orgId,
        templateId: template.id,
        templateVersionId: template.currentVersionId!,
        type: template.type,
        status: "ISSUED",
        humanReadableId: humanReadableId!,
        uvid: newUvid,
        verificationCode: verificationCode!,
        payloadJson: JSON.stringify(variables),
        pdfStorageKey: storageKey,
        pdfHashSha256: storedHash,
        recipientName,
        recipientEmail: recipientEmail || null,
        roleTitle: roleTitle || null,
        issuedAt: new Date(),
        createdById: ctx.userId,
      },
    });
  }

  await logAudit({
    organizationId: ctx.orgId,
    actorUserId: ctx.userId,
    action: AUDIT_ACTIONS.DOCUMENT_ISSUED,
    targetType: "Document",
    targetId: doc.id,
    meta: { humanReadableId: doc.humanReadableId },
  });

  // Send email if requested
  if (sendEmail && recipientEmail) {
    try {
      await sendLetterEmail({
        orgId: ctx.orgId,
        documentId: doc.id,
        recipientEmail,
        recipientName,
        documentType: template.type,
        humanReadableId: doc.humanReadableId,
        uvid: doc.uvid,
        pdfBuffer,
        verifyUrl,
        orgName: ctx.orgName,
      });

      await logAudit({
        organizationId: ctx.orgId,
        actorUserId: ctx.userId,
        action: AUDIT_ACTIONS.DOCUMENT_EMAILED,
        targetType: "Document",
        targetId: doc.id,
        meta: { recipientEmail },
      });
    } catch (emailError) {
      console.error("Email send failed:", emailError);
      // Don't fail issuance if email fails
    }
  }

  revalidatePath("/dashboard/documents");
  return { success: true, documentId: doc.id, status: "ISSUED" };
}

export async function approveDocument(documentId: string) {
  const ctx = await requireOrgContext();
  requireRole(ctx.role, canApproveDocuments, "You do not have permission to approve documents");

  const doc = await prisma_db.document.findFirst({
    where: { id: documentId, organizationId: ctx.orgId, status: "PENDING_APPROVAL" },
    include: {
      template: { include: { currentVersion: true } },
    },
  });

  if (!doc) throw new Error("Document not found or not pending approval");

  const variables = JSON.parse(doc.payloadJson);

  const template = doc.template;
  if (!template?.currentVersion) throw new Error("Template version not found");

  await logAudit({
    organizationId: ctx.orgId,
    actorUserId: ctx.userId,
    action: AUDIT_ACTIONS.DOCUMENT_APPROVED,
    targetType: "Document",
    targetId: documentId,
  });

  return await _finalizeAndIssueDocument({
    ctx,
    template: { ...template, type: doc.type },
    variables,
    recipientName: doc.recipientName,
    recipientEmail: doc.recipientEmail,
    roleTitle: doc.roleTitle,
    sendEmail: !!doc.recipientEmail,
    existingDocId: documentId,
  });
}

export async function revokeDocument(documentId: string, reason: string) {
  const ctx = await requireOrgContext();
  requireRole(ctx.role, canRevokeDocuments, "You do not have permission to revoke documents");

  if (!reason?.trim()) {
    return { error: "Revocation reason is required" };
  }

  const doc = await prisma_db.document.findFirst({
    where: { id: documentId, organizationId: ctx.orgId, status: "ISSUED" },
  });

  if (!doc) throw new Error("Document not found or cannot be revoked");

  await prisma_db.document.update({
    where: { id: documentId },
    data: {
      status: "REVOKED",
      revokedAt: new Date(),
      revocationReason: reason,
    },
  });

  await logAudit({
    organizationId: ctx.orgId,
    actorUserId: ctx.userId,
    action: AUDIT_ACTIONS.DOCUMENT_REVOKED,
    targetType: "Document",
    targetId: documentId,
    meta: { reason },
  });

  revalidatePath(`/dashboard/documents/${documentId}`);
  return { success: true };
}

export async function resendDocumentEmail(documentId: string) {
  const ctx = await requireOrgContext();
  requireRole(ctx.role, canIssueDocuments);

  const doc = await prisma_db.document.findFirst({
    where: { id: documentId, organizationId: ctx.orgId, status: "ISSUED" },
  });

  if (!doc) throw new Error("Document not found or not issued");
  if (!doc.recipientEmail) return { error: "No recipient email on this document" };
  if (!doc.pdfStorageKey) return { error: "PDF not found for this document" };

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:2222";
  const verifyUrl = `${appUrl}/verify/${doc.uvid}`;

  // Download the PDF buffer from S3 to attach it
  const pdfBuffer = await downloadAsBuffer(doc.pdfStorageKey);

  await sendLetterEmail({
    orgId: ctx.orgId,
    documentId: doc.id,
    recipientEmail: doc.recipientEmail,
    recipientName: doc.recipientName,
    documentType: doc.type,
    humanReadableId: doc.humanReadableId,
    uvid: doc.uvid,
    pdfBuffer,
    verifyUrl,
    orgName: ctx.orgName,
  });

  await logAudit({
    organizationId: ctx.orgId,
    actorUserId: ctx.userId,
    action: AUDIT_ACTIONS.DOCUMENT_RESENT,
    targetType: "Document",
    targetId: documentId,
    meta: { recipientEmail: doc.recipientEmail },
  });

  return { success: true };
}

export async function getDocuments(status?: string) {
  const ctx = await requireOrgContext();

  return prisma_db.document.findMany({
    where: {
      organizationId: ctx.orgId,
      ...(status ? { status: status as import("@/lib/generated/prisma/client").DocumentStatus } : {}),
    },
    include: {
      createdBy: { select: { name: true, email: true } },
      approvedBy: { select: { name: true } },
      template: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getDocument(documentId: string) {
  const ctx = await requireOrgContext();

  const doc = await prisma_db.document.findFirst({
    where: { id: documentId, organizationId: ctx.orgId },
    include: {
      createdBy: { select: { name: true, email: true } },
      approvedBy: { select: { name: true } },
      template: { select: { name: true, type: true } },
      templateVersion: { select: { versionNumber: true } },
      emailLogs: { orderBy: { createdAt: "desc" } },
    },
  });

  return doc;
}

export async function getDocumentDownloadUrl(documentId: string) {
  const ctx = await requireOrgContext();

  const doc = await prisma_db.document.findFirst({
    where: { id: documentId, organizationId: ctx.orgId, status: "ISSUED" },
    select: { pdfStorageKey: true },
  });

  if (!doc?.pdfStorageKey) throw new Error("PDF not available");

  return getPresignedDownloadUrl(doc.pdfStorageKey);
}
