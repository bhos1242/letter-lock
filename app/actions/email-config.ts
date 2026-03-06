"use server";

import { z } from "zod";
import { prisma_db } from "@/lib/prisma";
import { requireOrgContext } from "@/lib/org-context";
import { canManageSmtp, requireRole } from "@/lib/permissions";
import { encryptSecret } from "@/lib/crypto";
import { testSmtpConnection } from "@/lib/org-email";
import { logAudit, AUDIT_ACTIONS } from "@/lib/audit";
import { revalidatePath } from "next/cache";

const smtpSchema = z.object({
  smtpHost: z.string().min(1, "SMTP host is required"),
  smtpPort: z.coerce.number().int().min(1).max(65535),
  smtpUsername: z.string().min(1, "SMTP username is required"),
  smtpPassword: z.string().min(1, "SMTP password is required"),
  smtpFromName: z.string().min(1, "Sender name is required"),
  smtpFromEmail: z.string().email("Invalid sender email"),
  useTls: z.coerce.boolean(),
});

export async function saveEmailConfig(formData: FormData) {
  const ctx = await requireOrgContext();
  requireRole(ctx.role, canManageSmtp, "Only the org owner can configure SMTP");

  const parsed = smtpSchema.safeParse({
    smtpHost: formData.get("smtpHost"),
    smtpPort: formData.get("smtpPort"),
    smtpUsername: formData.get("smtpUsername"),
    smtpPassword: formData.get("smtpPassword"),
    smtpFromName: formData.get("smtpFromName"),
    smtpFromEmail: formData.get("smtpFromEmail"),
    useTls: formData.get("useTls") === "true" || formData.get("useTls") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { smtpPassword, ...rest } = parsed.data;

  // Encrypt before storing
  const smtpPasswordEncrypted = encryptSecret(smtpPassword);

  const existing = await prisma_db.organizationEmailConfig.findUnique({
    where: { organizationId: ctx.orgId },
  });

  if (existing) {
    await prisma_db.organizationEmailConfig.update({
      where: { organizationId: ctx.orgId },
      data: { ...rest, smtpPasswordEncrypted },
    });
    await logAudit({
      organizationId: ctx.orgId,
      actorUserId: ctx.userId,
      action: AUDIT_ACTIONS.SMTP_UPDATED,
      targetType: "OrganizationEmailConfig",
      targetId: ctx.orgId,
    });
  } else {
    await prisma_db.organizationEmailConfig.create({
      data: { organizationId: ctx.orgId, ...rest, smtpPasswordEncrypted },
    });
    await logAudit({
      organizationId: ctx.orgId,
      actorUserId: ctx.userId,
      action: AUDIT_ACTIONS.SMTP_CREATED,
      targetType: "OrganizationEmailConfig",
      targetId: ctx.orgId,
    });
  }

  revalidatePath("/dashboard/smtp");
  return { success: true };
}

export async function testSmtpConfig(formData: FormData) {
  const ctx = await requireOrgContext();
  requireRole(ctx.role, canManageSmtp, "Only the org owner can test SMTP");

  const parsed = smtpSchema.safeParse({
    smtpHost: formData.get("smtpHost"),
    smtpPort: formData.get("smtpPort"),
    smtpUsername: formData.get("smtpUsername"),
    smtpPassword: formData.get("smtpPassword"),
    smtpFromName: formData.get("smtpFromName"),
    smtpFromEmail: formData.get("smtpFromEmail"),
    useTls: formData.get("useTls") === "true" || formData.get("useTls") === "on",
  });

  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0].message };
  }

  const result = await testSmtpConnection({
    smtpHost: parsed.data.smtpHost,
    smtpPort: parsed.data.smtpPort,
    smtpUsername: parsed.data.smtpUsername,
    smtpPassword: parsed.data.smtpPassword,
    useTls: parsed.data.useTls,
  });

  await logAudit({
    organizationId: ctx.orgId,
    actorUserId: ctx.userId,
    action: AUDIT_ACTIONS.SMTP_TESTED,
    meta: { success: result.success },
  });

  return result;
}

/**
 * Returns SMTP config without the encrypted password for display.
 */
export async function getEmailConfig() {
  const ctx = await requireOrgContext();

  const config = await prisma_db.organizationEmailConfig.findUnique({
    where: { organizationId: ctx.orgId },
    select: {
      id: true,
      smtpHost: true,
      smtpPort: true,
      smtpUsername: true,
      smtpFromName: true,
      smtpFromEmail: true,
      useTls: true,
      updatedAt: true,
      // smtpPasswordEncrypted is intentionally excluded
    },
  });

  return config;
}
