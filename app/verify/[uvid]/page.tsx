import { Suspense } from "react";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { prisma_db } from "@/lib/prisma";
import { logAudit, AUDIT_ACTIONS } from "@/lib/audit";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Building2,
  FileText,
  CalendarDays,
  User,
  Briefcase,
} from "lucide-react";
import crypto from "crypto";

interface PageProps {
  params: Promise<{ uvid: string }>;
}

const STATUS_CONFIG = {
  ISSUED: {
    label: "Valid",
    icon: CheckCircle2,
    variant: "default" as const,
    description: "This document is authentic and has been officially issued.",
    colorClass: "text-green-600",
  },
  REVOKED: {
    label: "Revoked",
    icon: XCircle,
    variant: "destructive" as const,
    description: "This document has been revoked by the issuing organization.",
    colorClass: "text-red-600",
  },
  SUPERSEDED: {
    label: "Superseded",
    icon: AlertTriangle,
    variant: "secondary" as const,
    description: "This document has been superseded by a newer version.",
    colorClass: "text-yellow-600",
  },
  DRAFT: {
    label: "Draft",
    icon: AlertTriangle,
    variant: "outline" as const,
    description: "This document has not been officially issued.",
    colorClass: "text-gray-500",
  },
  PENDING_APPROVAL: {
    label: "Pending",
    icon: AlertTriangle,
    variant: "outline" as const,
    description: "This document is pending approval.",
    colorClass: "text-gray-500",
  },
};

const TYPE_LABELS: Record<string, string> = {
  OFFER_LETTER: "Offer Letter",
  INTERNSHIP_LETTER: "Internship Letter",
  EXPERIENCE_LETTER: "Experience Letter",
  RECOMMENDATION_LETTER: "Recommendation Letter",
};

async function VerifyContent({ uvid }: { uvid: string }) {
  const doc = await prisma_db.document.findUnique({
    where: { uvid },
    include: {
      organization: {
        select: {
          name: true,
          branding: { select: { logoUrl: true, primaryColor: true, website: true } },
        },
      },
    },
  });

  if (!doc) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <div className="flex items-center gap-3">
            <XCircle className="h-8 w-8 text-destructive" />
            <div>
              <CardTitle>Document Not Found</CardTitle>
              <CardDescription>
                No document matches this verification ID.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            The UVID you entered does not correspond to any document in our system.
            Please check the ID and try again.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Log verification event server-side
  try {
    const reqHeaders = await headers();
    const forwarded = reqHeaders.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
    const ipHash = crypto
      .createHash("sha256")
      .update(ip + (process.env.AUTH_SECRET ?? ""))
      .digest("hex");
    const userAgent = reqHeaders.get("user-agent") ?? undefined;

    await prisma_db.verificationEvent.create({
      data: {
        documentId: doc.id,
        organizationId: doc.organizationId,
        method: "DIRECT_LINK",
        ipHash,
        userAgent,
      },
    });

    await logAudit({
      organizationId: doc.organizationId,
      action: AUDIT_ACTIONS.DOCUMENT_VERIFIED,
      targetType: "Document",
      targetId: doc.id,
      meta: { method: "PAGE_VIEW" },
    });
  } catch {
    // Never fail on logging errors
  }

  const statusConfig = STATUS_CONFIG[doc.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.DRAFT;
  const StatusIcon = statusConfig.icon;

  return (
    <div className="space-y-4">
      {/* Status Banner */}
      <Card className={doc.status === "ISSUED" ? "border-green-200 bg-green-50 dark:bg-green-950/20" : doc.status === "REVOKED" ? "border-red-200 bg-red-50 dark:bg-red-950/20" : ""}>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <StatusIcon className={`h-10 w-10 mt-0.5 shrink-0 ${statusConfig.colorClass}`} />
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-xl font-bold">
                  {statusConfig.label} — {TYPE_LABELS[doc.type] ?? doc.type}
                </h2>
                <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
              </div>
              <p className="text-muted-foreground text-sm">{statusConfig.description}</p>

              {doc.status === "REVOKED" && doc.revocationReason && (
                <div className="mt-3 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  <strong>Revocation reason:</strong> {doc.revocationReason}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Document Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-start gap-3">
              <User className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Recipient</p>
                <p className="text-sm font-medium">{doc.recipientName}</p>
              </div>
            </div>

            {doc.roleTitle && (
              <div className="flex items-start gap-3">
                <Briefcase className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Role / Position</p>
                  <p className="text-sm font-medium">{doc.roleTitle}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <FileText className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Document Reference</p>
                <p className="text-sm font-medium font-mono">{doc.humanReadableId}</p>
              </div>
            </div>

            {doc.issuedAt && (
              <div className="flex items-start gap-3">
                <CalendarDays className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Issued On</p>
                  <p className="text-sm font-medium">
                    {new Date(doc.issuedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            )}

            {doc.revokedAt && (
              <div className="flex items-start gap-3">
                <CalendarDays className="h-4 w-4 mt-0.5 text-destructive shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Revoked On</p>
                  <p className="text-sm font-medium text-destructive">
                    {new Date(doc.revokedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Verification ID (UVID)</p>
            <p className="text-xs font-mono bg-muted px-2 py-1 rounded break-all">{doc.uvid}</p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Verification Code</p>
            <p className="text-sm font-mono font-bold tracking-widest">{doc.verificationCode}</p>
          </div>
        </CardContent>
      </Card>

      {/* Issuing Organization */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Issuing Organization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            {doc.organization.branding?.logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={doc.organization.branding.logoUrl}
                alt={doc.organization.name}
                className="h-10 w-10 object-contain rounded"
              />
            )}
            <div>
              <p className="font-semibold">{doc.organization.name}</p>
              {doc.organization.branding?.website && (
                <p className="text-xs text-muted-foreground">
                  {doc.organization.branding.website}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-center">
        This verification is tamper-evident and auditable. Powered by the Secure Letter Platform.
      </p>
    </div>
  );
}

export default async function VerifyDocumentPage({ params }: PageProps) {
  const { uvid } = await params;

  if (!uvid || uvid.length > 100) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Document Verification</h1>
          <p className="text-muted-foreground mt-1">
            Checking authenticity of the requested document
          </p>
        </div>
        <Suspense
          fallback={
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Verifying document...
              </CardContent>
            </Card>
          }
        >
          <VerifyContent uvid={uvid} />
        </Suspense>
      </div>
    </div>
  );
}
