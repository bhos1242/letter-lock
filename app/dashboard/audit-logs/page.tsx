import { requireOrgContext } from "@/lib/org-context";
import { prisma_db } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardList } from "lucide-react";

export default async function AuditLogsPage() {
  const ctx = await requireOrgContext();

  const logs = await prisma_db.auditLog.findMany({
    where: { organizationId: ctx.orgId },
    include: { actor: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Audit Logs</h1>
        <p className="text-muted-foreground text-sm">
          All sensitive actions performed in your organization.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Activity Log</CardTitle>
          <CardDescription>Showing the last {logs.length} events</CardDescription>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ClipboardList className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p>No audit events yet.</p>
            </div>
          ) : (
            <div className="space-y-0">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start justify-between py-3 border-b last:border-0 gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="font-mono text-xs shrink-0">
                        {log.action}
                      </Badge>
                      {log.targetType && (
                        <span className="text-sm text-muted-foreground">
                          on {log.targetType}
                          {log.targetId && (
                            <span className="font-mono text-xs ml-1 truncate">
                              {log.targetId.slice(0, 8)}…
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      by {log.actor?.name ?? log.actor?.email ?? "System"}
                    </p>
                  </div>
                  <time className="text-xs text-muted-foreground shrink-0 pt-0.5">
                    {new Date(log.createdAt).toLocaleString()}
                  </time>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
