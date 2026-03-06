"use server";

import { z } from "zod";
import { prisma_db } from "@/lib/prisma";
import { requireOrgContext } from "@/lib/org-context";
import { canManageTemplates, requireRole } from "@/lib/permissions";
import { extractVariables } from "@/lib/template-engine";
import { logAudit, AUDIT_ACTIONS } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { TemplateType } from "@/lib/generated/prisma/client";

const createTemplateSchema = z.object({
  name: z.string().min(1).max(200),
  type: z.enum([
    "OFFER_LETTER",
    "INTERNSHIP_LETTER",
    "EXPERIENCE_LETTER",
    "RECOMMENDATION_LETTER",
  ]),
  requiresApproval: z.coerce.boolean().default(false),
  content: z.string().min(10, "Template content is too short"),
});

export async function createTemplate(formData: FormData) {
  const ctx = await requireOrgContext();
  requireRole(ctx.role, canManageTemplates, "You do not have permission to create templates");

  const parsed = createTemplateSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    requiresApproval: formData.get("requiresApproval"),
    content: formData.get("content"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { content, ...meta } = parsed.data;
  const variables = extractVariables(content);

  const template = await prisma_db.$transaction(async (tx) => {
    const tmpl = await tx.template.create({
      data: {
        organizationId: ctx.orgId,
        name: meta.name,
        type: meta.type as TemplateType,
        requiresApproval: meta.requiresApproval,
        status: "DRAFT",
        createdById: ctx.userId,
      },
    });

    const version = await tx.templateVersion.create({
      data: {
        templateId: tmpl.id,
        organizationId: ctx.orgId,
        versionNumber: 1,
        content,
        variableSchemaJson: JSON.stringify(variables),
        createdById: ctx.userId,
      },
    });

    await tx.template.update({
      where: { id: tmpl.id },
      data: { currentVersionId: version.id },
    });

    return tmpl;
  });

  await logAudit({
    organizationId: ctx.orgId,
    actorUserId: ctx.userId,
    action: AUDIT_ACTIONS.TEMPLATE_CREATED,
    targetType: "Template",
    targetId: template.id,
    meta: { name: meta.name, type: meta.type },
  });

  revalidatePath("/dashboard/templates");
  return { success: true, templateId: template.id };
}

export async function updateTemplate(templateId: string, formData: FormData) {
  const ctx = await requireOrgContext();
  requireRole(ctx.role, canManageTemplates, "You do not have permission to update templates");

  // Ensure template belongs to org
  const existing = await prisma_db.template.findFirst({
    where: { id: templateId, organizationId: ctx.orgId },
    include: { versions: { orderBy: { versionNumber: "desc" }, take: 1 } },
  });

  if (!existing) throw new Error("Template not found");

  const parsed = createTemplateSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    requiresApproval: formData.get("requiresApproval"),
    content: formData.get("content"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { content, ...meta } = parsed.data;
  const variables = extractVariables(content);
  const nextVersionNumber = (existing.versions[0]?.versionNumber ?? 0) + 1;

  await prisma_db.$transaction(async (tx) => {
    const newVersion = await tx.templateVersion.create({
      data: {
        templateId,
        organizationId: ctx.orgId,
        versionNumber: nextVersionNumber,
        content,
        variableSchemaJson: JSON.stringify(variables),
        createdById: ctx.userId,
      },
    });

    await tx.template.update({
      where: { id: templateId },
      data: {
        name: meta.name,
        type: meta.type as TemplateType,
        requiresApproval: meta.requiresApproval,
        currentVersionId: newVersion.id,
      },
    });
  });

  await logAudit({
    organizationId: ctx.orgId,
    actorUserId: ctx.userId,
    action: AUDIT_ACTIONS.TEMPLATE_UPDATED,
    targetType: "Template",
    targetId: templateId,
  });

  revalidatePath("/dashboard/templates");
  return { success: true };
}

export async function publishTemplate(templateId: string) {
  const ctx = await requireOrgContext();
  requireRole(ctx.role, canManageTemplates);

  const template = await prisma_db.template.findFirst({
    where: { id: templateId, organizationId: ctx.orgId },
  });

  if (!template) throw new Error("Template not found");

  await prisma_db.template.update({
    where: { id: templateId },
    data: { status: "PUBLISHED" },
  });

  await logAudit({
    organizationId: ctx.orgId,
    actorUserId: ctx.userId,
    action: AUDIT_ACTIONS.TEMPLATE_PUBLISHED,
    targetType: "Template",
    targetId: templateId,
  });

  revalidatePath("/dashboard/templates");
  return { success: true };
}

export async function archiveTemplate(templateId: string) {
  const ctx = await requireOrgContext();
  requireRole(ctx.role, canManageTemplates);

  const template = await prisma_db.template.findFirst({
    where: { id: templateId, organizationId: ctx.orgId },
  });

  if (!template) throw new Error("Template not found");

  await prisma_db.template.update({
    where: { id: templateId },
    data: { status: "ARCHIVED" },
  });

  await logAudit({
    organizationId: ctx.orgId,
    actorUserId: ctx.userId,
    action: AUDIT_ACTIONS.TEMPLATE_ARCHIVED,
    targetType: "Template",
    targetId: templateId,
  });

  revalidatePath("/dashboard/templates");
  return { success: true };
}

export async function getTemplates(status?: string) {
  const ctx = await requireOrgContext();

  return prisma_db.template.findMany({
    where: {
      organizationId: ctx.orgId,
      ...(status ? { status: status as import("@/lib/generated/prisma/client").TemplateStatus } : {}),
    },
    include: {
      currentVersion: { select: { versionNumber: true, variableSchemaJson: true } },
      createdBy: { select: { name: true, email: true } },
      _count: { select: { documents: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getTemplate(templateId: string) {
  const ctx = await requireOrgContext();

  return prisma_db.template.findFirst({
    where: { id: templateId, organizationId: ctx.orgId },
    include: {
      currentVersion: true,
      versions: { orderBy: { versionNumber: "desc" } },
      createdBy: { select: { name: true, email: true } },
    },
  });
}
