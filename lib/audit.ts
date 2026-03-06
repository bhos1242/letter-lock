import { prisma_db } from "./prisma";

interface AuditLogEntry {
  organizationId: string;
  actorUserId?: string;
  action: string;
  targetType?: string;
  targetId?: string;
  meta?: Record<string, unknown>;
}

export async function logAudit(entry: AuditLogEntry): Promise<void> {
  try {
    await prisma_db.auditLog.create({
      data: {
        organizationId: entry.organizationId,
        actorUserId: entry.actorUserId,
        action: entry.action,
        targetType: entry.targetType,
        targetId: entry.targetId,
        metaJson: entry.meta ? JSON.stringify(entry.meta) : null,
      },
    });
  } catch (error) {
    // Audit log failures should never crash the main flow
    console.error("[AuditLog] Failed to write audit log:", error);
  }
}

// Audit action constants
export const AUDIT_ACTIONS = {
  ORG_CREATED: "org.created",
  ORG_UPDATED: "org.updated",
  BRANDING_UPDATED: "branding.updated",
  SMTP_CREATED: "smtp.created",
  SMTP_UPDATED: "smtp.updated",
  SMTP_TESTED: "smtp.tested",
  MEMBER_INVITED: "member.invited",
  MEMBER_ROLE_CHANGED: "member.role_changed",
  MEMBER_REMOVED: "member.removed",
  TEMPLATE_CREATED: "template.created",
  TEMPLATE_UPDATED: "template.updated",
  TEMPLATE_PUBLISHED: "template.published",
  TEMPLATE_ARCHIVED: "template.archived",
  DOCUMENT_DRAFTED: "document.drafted",
  DOCUMENT_SUBMITTED: "document.submitted",
  DOCUMENT_APPROVED: "document.approved",
  DOCUMENT_REJECTED: "document.rejected",
  DOCUMENT_ISSUED: "document.issued",
  DOCUMENT_EMAILED: "document.emailed",
  DOCUMENT_RESENT: "document.resent",
  DOCUMENT_REVOKED: "document.revoked",
  DOCUMENT_VERIFIED: "document.verified",
} as const;
