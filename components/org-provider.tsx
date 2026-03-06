"use client";

import { createContext, useContext, ReactNode } from "react";
import { MemberRole } from "@/lib/generated/prisma/client";

export interface OrgContextValue {
  orgId: string;
  orgName: string;
  orgSlug: string;
  role: MemberRole;
  memberships: {
    organizationId: string;
    organization: { id: string; name: string; slug: string };
    role: MemberRole;
  }[];
}

const OrgContext = createContext<OrgContextValue | null>(null);

export function OrgProvider({
  value,
  children,
}: {
  value: OrgContextValue;
  children: ReactNode;
}) {
  return <OrgContext.Provider value={value}>{children}</OrgContext.Provider>;
}

export function useOrg(): OrgContextValue {
  const ctx = useContext(OrgContext);
  if (!ctx) throw new Error("useOrg must be used inside OrgProvider");
  return ctx;
}
