import { StatsCard } from "@/components/stats-card";
import { auth } from "@/lib/auth";
import { prisma_db } from "@/lib/prisma";
import { getOrgContext } from "@/lib/org-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, ScrollText, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const session = await auth();
  const orgCtx = await getOrgContext();
  if (!orgCtx) return null;

  const [templateCount, docCount, issuedCount, memberCount, recentDocs, pendingCount] =
    await Promise.all([
      prisma_db.template.count({ where: { organizationId: orgCtx.orgId } }),
      prisma_db.document.count({ where: { organizationId: orgCtx.orgId } }),
      prisma_db.document.count({ where: { organizationId: orgCtx.orgId, status: "ISSUED" } }),
      prisma_db.membership.count({ where: { organizationId: orgCtx.orgId } }),
      prisma_db.document.findMany({
        where: { organizationId: orgCtx.orgId },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { createdBy: { select: { name: true } } },
      }),
      prisma_db.document.count({ where: { organizationId: orgCtx.orgId, status: "PENDING_APPROVAL" } }),
    ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{orgCtx.orgName}</h1>
          <p className="text-muted-foreground text-sm">
            Welcome back, {session?.user?.name?.split(" ")[0]}. Here&apos;s your overview.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/documents/new">Issue Document</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Templates" value={String(templateCount)} description="letter templates" icon={FileText} trend="" trendUp={true} />
        <StatsCard title="Total Documents" value={String(docCount)} description="all time" icon={ScrollText} trend="" trendUp={true} />
        <StatsCard title="Issued" value={String(issuedCount)} description="active documents" icon={ShieldCheck} trend="" trendUp={true} />
        <StatsCard title="Team Members" value={String(memberCount)} description="in your org" icon={Users} trend="" trendUp={true} />
      </div>

      {pendingCount > 0 && (
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
          <CardContent className="pt-4 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="border-yellow-400 text-yellow-700">{pendingCount} pending</Badge>
              <span className="text-sm font-medium">
                {pendingCount} document{pendingCount !== 1 ? "s" : ""} awaiting approval
              </span>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/documents?status=PENDING_APPROVAL">Review</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">Recent Documents</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/documents">View all</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentDocs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ScrollText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No documents yet.</p>
              <Button variant="link" size="sm" asChild className="mt-1">
                <Link href="/dashboard/documents/new">Issue your first document</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentDocs.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{doc.recipientName}</p>
                    <p className="text-xs text-muted-foreground font-mono">{doc.humanReadableId}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={doc.status === "ISSUED" ? "default" : doc.status === "REVOKED" ? "destructive" : "outline"} className="text-xs">
                      {doc.status.replace("_", " ")}
                    </Badge>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/documents/${doc.id}`}>View</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
