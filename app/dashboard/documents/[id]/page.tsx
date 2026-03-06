import { getDocument } from "@/app/actions/documents";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  Mail,
  ShieldCheck,
  Copy,
  XCircle,
} from "lucide-react";
import { DocumentActions } from "./document-actions";

const TYPE_LABELS: Record<string, string> = {
  OFFER_LETTER: "Offer Letter",
  INTERNSHIP_LETTER: "Internship Letter",
  EXPERIENCE_LETTER: "Experience Letter",
  RECOMMENDATION_LETTER: "Recommendation Letter",
};

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  ISSUED: "default",
  DRAFT: "outline",
  PENDING_APPROVAL: "secondary",
  REVOKED: "destructive",
  SUPERSEDED: "secondary",
};

export default async function DocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const doc = await getDocument(id);

  if (!doc) notFound();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:2222";
  const verifyUrl = `${appUrl}/verify/${doc.uvid}`;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/documents">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-mono">{doc.humanReadableId}</h1>
            <Badge variant={STATUS_VARIANT[doc.status] ?? "outline"}>
              {doc.status.replace("_", " ")}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{TYPE_LABELS[doc.type] ?? doc.type}</p>
        </div>
        <DocumentActions doc={{ id: doc.id, status: doc.status, recipientEmail: doc.recipientEmail, uvid: doc.uvid }} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Recipient</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-1">
            <p className="font-semibold">{doc.recipientName}</p>
            {doc.recipientEmail && <p className="text-sm text-muted-foreground">{doc.recipientEmail}</p>}
            {doc.roleTitle && <p className="text-sm">{doc.roleTitle}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Timeline</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created</span>
              <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
            </div>
            {doc.issuedAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Issued</span>
                <span>{new Date(doc.issuedAt).toLocaleDateString()}</span>
              </div>
            )}
            {doc.revokedAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground text-destructive">Revoked</span>
                <span className="text-destructive">{new Date(doc.revokedAt).toLocaleDateString()}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">By</span>
              <span>{doc.createdBy.name ?? doc.createdBy.email}</span>
            </div>
            {doc.approvedBy && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Approved by</span>
                <span>{doc.approvedBy.name}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1">UVID (Unique Verification ID)</p>
            <p className="font-mono text-sm bg-muted px-3 py-2 rounded break-all">{doc.uvid}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Verification Code</p>
              <p className="font-mono font-bold tracking-widest">{doc.verificationCode}</p>
            </div>
            {doc.pdfHashSha256 && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">PDF Hash (SHA-256)</p>
                <p className="font-mono text-xs text-muted-foreground truncate">{doc.pdfHashSha256.slice(0, 20)}…</p>
              </div>
            )}
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Public Verification URL</p>
            <div className="flex items-center gap-2">
              <Link
                href={verifyUrl}
                target="_blank"
                className="text-sm text-primary hover:underline break-all"
              >
                {verifyUrl}
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {doc.revokedAt && doc.revocationReason && (
        <Card className="border-destructive bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-destructive">
              <XCircle className="h-4 w-4" />
              Revocation Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{doc.revocationReason}</p>
          </CardContent>
        </Card>
      )}

      {doc.emailLogs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Log
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {doc.emailLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between text-sm py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium">{log.recipientEmail}</p>
                    <p className="text-xs text-muted-foreground">{log.subject}</p>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={log.status === "SENT" ? "default" : log.status === "FAILED" ? "destructive" : "outline"}
                      className="text-xs"
                    >
                      {log.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {log.sentAt ? new Date(log.sentAt).toLocaleDateString() : new Date(log.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
