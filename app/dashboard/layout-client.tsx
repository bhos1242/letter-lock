"use client";

import {
  DashboardSidebar,
  MobileSidebar,
} from "@/components/dashboard-sidebar";
import { NotificationPromptDialog } from "@/components/notification-prompt-dialog";
import { OrgProvider, OrgContextValue } from "@/components/org-provider";

export default function DashboardLayoutClient({
  children,
  orgContext,
}: {
  children: React.ReactNode;
  orgContext: OrgContextValue;
}) {
  return (
    <OrgProvider value={orgContext}>
      <NotificationPromptDialog />
      <div className="flex h-screen overflow-hidden">
        <DashboardSidebar className="hidden md:flex border-r" />
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="flex h-14 items-center gap-2 border-b bg-muted/40 px-6 md:hidden">
            <MobileSidebar />
            <span className="font-semibold">{orgContext.orgName}</span>
          </header>
          <main className="flex-1 overflow-y-scroll p-4 md:p-6">{children}</main>
        </div>
      </div>
    </OrgProvider>
  );
}
