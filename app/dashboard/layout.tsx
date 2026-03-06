import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getOrgContext } from "@/lib/org-context";
import DashboardLayoutClient from "./layout-client";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  const isOAuthUser = session.user.provider && session.user.provider !== "credentials";
  if (!session.user.isVerified && !isOAuthUser) {
    redirect("/auth/verify-otp?email=" + encodeURIComponent(session.user.email));
  }

  const orgCtx = await getOrgContext();

  if (!orgCtx) {
    redirect("/onboarding");
  }

  return (
    <DashboardLayoutClient
      orgContext={{
        orgId: orgCtx.orgId,
        orgName: orgCtx.orgName,
        orgSlug: orgCtx.orgSlug,
        role: orgCtx.role,
        memberships: orgCtx.memberships,
      }}
    >
      {children}
    </DashboardLayoutClient>
  );
}
