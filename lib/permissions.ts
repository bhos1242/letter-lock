import { MemberRole } from "./generated/prisma";

export function canManageOrg(role: MemberRole): boolean {
  return role === "OWNER" || role === "ADMIN";
}

export function canManageSmtp(role: MemberRole): boolean {
  return role === "OWNER";
}

export function canManageBranding(role: MemberRole): boolean {
  return role === "OWNER" || role === "ADMIN";
}

export function canManageTeam(role: MemberRole): boolean {
  return role === "OWNER" || role === "ADMIN";
}

export function canManageTemplates(role: MemberRole): boolean {
  return role === "OWNER" || role === "ADMIN" || role === "HR";
}

export function canIssueDocuments(role: MemberRole): boolean {
  return role === "OWNER" || role === "ADMIN" || role === "HR";
}

export function canApproveDocuments(role: MemberRole): boolean {
  return role === "OWNER" || role === "ADMIN" || role === "APPROVER";
}

export function canRevokeDocuments(role: MemberRole): boolean {
  return role === "OWNER" || role === "ADMIN";
}

export function canViewDocuments(role: MemberRole): boolean {
  return true; // all org members can view
}

export function canViewAuditLogs(role: MemberRole): boolean {
  return role === "OWNER" || role === "ADMIN";
}

export function requireRole(
  userRole: MemberRole,
  check: (role: MemberRole) => boolean,
  message = "You do not have permission to perform this action"
): void {
  if (!check(userRole)) {
    throw new Error(message);
  }
}
