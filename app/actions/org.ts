"use server";

import { z } from "zod";
import { prisma_db } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requireOrgContext } from "@/lib/org-context";
import { logAudit, AUDIT_ACTIONS } from "@/lib/audit";
import { canManageOrg, canManageTeam, requireRole } from "@/lib/permissions";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { MemberRole } from "@/lib/generated/prisma/client";

const createOrgSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
});

export async function createOrganization(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const parsed = createOrgSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { name, slug } = parsed.data;

  // Check slug availability
  const existing = await prisma_db.organization.findUnique({ where: { slug } });
  if (existing) {
    return { error: "This slug is already taken. Please choose another." };
  }

  const org = await prisma_db.$transaction(async (tx) => {
    const org = await tx.organization.create({
      data: { name, slug },
    });

    // Creator becomes OWNER
    await tx.membership.create({
      data: {
        userId: session.user.id,
        organizationId: org.id,
        role: "OWNER",
      },
    });

    // Initialize branding record
    await tx.organizationBranding.create({
      data: { organizationId: org.id },
    });

    return org;
  });

  await logAudit({
    organizationId: org.id,
    actorUserId: session.user.id,
    action: AUDIT_ACTIONS.ORG_CREATED,
    targetType: "Organization",
    targetId: org.id,
    meta: { name, slug },
  });

  // Set active org cookie
  const cookieStore = await cookies();
  cookieStore.set("active-org-id", org.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  revalidatePath("/dashboard");
  return { success: true, orgId: org.id, slug };
}

export async function switchOrganization(orgId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  // Verify the user is actually a member of this org
  const membership = await prisma_db.membership.findUnique({
    where: { userId_organizationId: { userId: session.user.id, organizationId: orgId } },
  });

  if (!membership) throw new Error("You are not a member of this organization");

  const cookieStore = await cookies();
  cookieStore.set("active-org-id", orgId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  revalidatePath("/dashboard");
  return { success: true };
}

const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(["ADMIN", "HR", "APPROVER", "VIEWER"]),
});

export async function inviteMember(formData: FormData) {
  const ctx = await requireOrgContext();
  requireRole(ctx.role, canManageTeam, "Only admins can invite members");

  const parsed = inviteMemberSchema.safeParse({
    email: formData.get("email"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { email, role } = parsed.data;

  // Find the user by email
  const user = await prisma_db.user.findUnique({ where: { email } });
  if (!user) {
    return { error: "No user found with this email. The user must sign up first." };
  }

  // Check if already a member
  const existing = await prisma_db.membership.findUnique({
    where: { userId_organizationId: { userId: user.id, organizationId: ctx.orgId } },
  });

  if (existing) {
    return { error: "This user is already a member of your organization." };
  }

  await prisma_db.membership.create({
    data: {
      userId: user.id,
      organizationId: ctx.orgId,
      role: role as MemberRole,
    },
  });

  await logAudit({
    organizationId: ctx.orgId,
    actorUserId: ctx.userId,
    action: AUDIT_ACTIONS.MEMBER_INVITED,
    targetType: "User",
    targetId: user.id,
    meta: { email, role },
  });

  revalidatePath("/dashboard/team");
  return { success: true };
}

export async function changeMemberRole(memberId: string, newRole: MemberRole) {
  const ctx = await requireOrgContext();
  requireRole(ctx.role, canManageTeam, "Only admins can change member roles");

  const membership = await prisma_db.membership.findFirst({
    where: { id: memberId, organizationId: ctx.orgId },
  });

  if (!membership) throw new Error("Member not found");
  if (membership.role === "OWNER") throw new Error("Cannot change the role of the organization owner");

  await prisma_db.membership.update({
    where: { id: memberId },
    data: { role: newRole },
  });

  await logAudit({
    organizationId: ctx.orgId,
    actorUserId: ctx.userId,
    action: AUDIT_ACTIONS.MEMBER_ROLE_CHANGED,
    targetType: "Membership",
    targetId: memberId,
    meta: { newRole },
  });

  revalidatePath("/dashboard/team");
  return { success: true };
}

export async function removeMember(memberId: string) {
  const ctx = await requireOrgContext();
  requireRole(ctx.role, canManageTeam, "Only admins can remove members");

  const membership = await prisma_db.membership.findFirst({
    where: { id: memberId, organizationId: ctx.orgId },
  });

  if (!membership) throw new Error("Member not found");
  if (membership.role === "OWNER") throw new Error("Cannot remove the organization owner");
  if (membership.userId === ctx.userId) throw new Error("Cannot remove yourself");

  await prisma_db.membership.delete({ where: { id: memberId } });

  await logAudit({
    organizationId: ctx.orgId,
    actorUserId: ctx.userId,
    action: AUDIT_ACTIONS.MEMBER_REMOVED,
    targetType: "Membership",
    targetId: memberId,
  });

  revalidatePath("/dashboard/team");
  return { success: true };
}

export async function getOrgMembers() {
  const ctx = await requireOrgContext();

  return prisma_db.membership.findMany({
    where: { organizationId: ctx.orgId },
    include: {
      user: { select: { id: true, name: true, email: true, image: true, createdAt: true } },
    },
    orderBy: { createdAt: "asc" },
  });
}
