import { requireOrgContext } from "@/lib/org-context";
import { prisma_db } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

const METHOD_LABELS: Record<string, string> = {
  QR_CODE: "QR Scan",
  DIRECT_LINK: "Direct Link",
  MANUAL_CODE: "Manual Code",
  HASH_CHECK: "Hash Check",
};

export default async function VerificationLogsPage() {
  const ctx = await requireOrgContext();

  const events = await prisma_db.verificationEvent.findMany({
    where: { organizationId: ctx.orgId },
    include: {
      document: {
        select: { humanReadableId: true, recipientName: true, type: true, id: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Verification Logs</h1>
        <p className="text-muted-foreground text-sm">
          Every public verification attempt on your issued documents.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Verification Events</CardTitle>
          <CardDescription>{events.length} event{events.length !== 1 ? "s" : ""}</CardDescription>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ShieldCheck className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p>No verification events yet.</p>
            </div>
          ) : (
            <div className="space-y-0">
              {events.map((ev) => (
                <div key={ev.id} className="flex items-center justify-between py-3 border-b last:border-0 gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs shrink-0">
                        {METHOD_LABELS[ev.method] ?? ev.method}
                      </Badge>
                      <span className="text-sm font-medium truncate">
                        {ev.document.recipientName}
                      </span>
                      <span className="text-xs font-mono text-muted-foreground">
                        {ev.document.humanReadableId}
                      </span>
                    </div>
                    {ev.userAgent && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {ev.userAgent.slice(0, 80)}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <time className="text-xs text-muted-foreground">
                      {new Date(ev.createdAt).toLocaleString()}
                    </time>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/documents/${ev.document.id}`}>View</Link>
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
