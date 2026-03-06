import { auth } from "./auth";
import { cookies } from "next/headers";
import { prisma_db } from "./prisma";
import { MemberRole } from "./generated/prisma/client";

export interface OrgContext {
  userId: string;
  orgId: string;
  orgSlug: string;
  orgName: string;
  role: MemberRole;
  memberships: {
    organizationId: string;
    organization: { id: string; name: string; slug: string };
    role: MemberRole;
  }[];
}

/**
 * Gets the active organization context for the current user.
 * Returns null if the user is not authenticated or has no membership.
 */
export async function getOrgContext(): Promise<OrgContext | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const memberships = await prisma_db.membership.findMany({
    where: { userId: session.user.id },
    include: { organization: { select: { id: true, name: true, slug: true } } },
    orderBy: { createdAt: "asc" },
  });

  if (!memberships.length) return null;

  const cookieStore = await cookies();
  const preferredOrgId = cookieStore.get("active-org-id")?.value;

  const active =
    (preferredOrgId && memberships.find((m) => m.organizationId === preferredOrgId)) ||
    memberships[0];

  return {
    userId: session.user.id,
    orgId: active.organizationId,
    orgSlug: active.organization.slug,
    orgName: active.organization.name,
    role: active.role,
    memberships: memberships.map((m) => ({
      organizationId: m.organizationId,
      organization: m.organization,
      role: m.role,
    })),
  };
}

/**
 * Returns the org context or throws if not authenticated / no org.
 */
export async function requireOrgContext(): Promise<OrgContext> {
  const ctx = await getOrgContext();
  if (!ctx) {
    throw new Error("Authentication required or no organization found");
  }
  return ctx;
}
