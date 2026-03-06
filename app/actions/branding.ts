"use server";

import { z } from "zod";
import { prisma_db } from "@/lib/prisma";
import { requireOrgContext } from "@/lib/org-context";
import { canManageBranding, requireRole } from "@/lib/permissions";
import { logAudit, AUDIT_ACTIONS } from "@/lib/audit";
import { revalidatePath } from "next/cache";

const brandingSchema = z.object({
  primaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color")
    .optional()
    .default("#2563eb"),
  supportEmail: z.string().email().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  address: z.string().max(500).optional().or(z.literal("")),
  logoUrl: z.string().optional().or(z.literal("")),
  letterheadUrl: z.string().optional().or(z.literal("")),
  stampUrl: z.string().optional().or(z.literal("")),
  signatureUrl: z.string().optional().or(z.literal("")),
});

function normalizeBrandingUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  // If it's already a relative path, return it
  if (url.startsWith("/")) return url;
  // If it's a full Amazon S3 URL, extract the storage key and convert to proxy path
  const match = url.match(/amazonaws\.com\/(.+)$/);
  if (match) return `/api/assets/${match[1]}`;
  return url;
}

export async function updateBranding(formData: FormData) {
  const ctx = await requireOrgContext();
  requireRole(ctx.role, canManageBranding, "Only admins can update branding");

  const raw = {
    primaryColor: formData.get("primaryColor") as string,
    supportEmail: formData.get("supportEmail") as string,
    website: formData.get("website") as string,
    address: formData.get("address") as string,
    logoUrl: formData.get("logoUrl") as string,
    letterheadUrl: formData.get("letterheadUrl") as string,
    stampUrl: formData.get("stampUrl") as string,
    signatureUrl: formData.get("signatureUrl") as string,
  };

  const parsed = brandingSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const data = parsed.data;

  await prisma_db.organizationBranding.upsert({
    where: { organizationId: ctx.orgId },
    update: {
      primaryColor: data.primaryColor,
      supportEmail: data.supportEmail || null,
      website: data.website || null,
      address: data.address || null,
      logoUrl: data.logoUrl || null,
      letterheadUrl: data.letterheadUrl || null,
      stampUrl: data.stampUrl || null,
      signatureUrl: data.signatureUrl || null,
    },
    create: {
      organizationId: ctx.orgId,
      primaryColor: data.primaryColor,
      supportEmail: data.supportEmail || null,
      website: data.website || null,
      address: data.address || null,
      logoUrl: data.logoUrl || null,
      letterheadUrl: data.letterheadUrl || null,
      stampUrl: data.stampUrl || null,
      signatureUrl: data.signatureUrl || null,
    },
  });

  await logAudit({
    organizationId: ctx.orgId,
    actorUserId: ctx.userId,
    action: AUDIT_ACTIONS.BRANDING_UPDATED,
    targetType: "OrganizationBranding",
    targetId: ctx.orgId,
  });

  revalidatePath("/dashboard/branding");
  return { success: true };
}

export async function getBranding() {
  const ctx = await requireOrgContext();

  const branding = await prisma_db.organizationBranding.findUnique({
    where: { organizationId: ctx.orgId },
  });

  if (!branding) return null;

  return {
    ...branding,
    logoUrl: normalizeBrandingUrl(branding.logoUrl),
    letterheadUrl: normalizeBrandingUrl(branding.letterheadUrl),
    stampUrl: normalizeBrandingUrl(branding.stampUrl),
    signatureUrl: normalizeBrandingUrl(branding.signatureUrl),
  };
}
