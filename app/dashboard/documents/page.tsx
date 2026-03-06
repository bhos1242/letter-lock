import { getDocuments } from "@/app/actions/documents";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, ScrollText } from "lucide-react";
import Link from "next/link";

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

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function DocumentsPage({ searchParams }: PageProps) {
  const { status } = await searchParams;
  const documents = await getDocuments(status);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Documents</h1>
          <p className="text-muted-foreground text-sm">
            All issued letters and their verification status.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/documents/new">
            <Plus className="h-4 w-4 mr-2" />
            Issue Document
          </Link>
        </Button>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { label: "All", value: undefined },
          { label: "Issued", value: "ISSUED" },
          { label: "Pending Approval", value: "PENDING_APPROVAL" },
          { label: "Draft", value: "DRAFT" },
          { label: "Revoked", value: "REVOKED" },
        ].map((f) => (
          <Button
            key={f.label}
            variant={status === f.value || (!status && !f.value) ? "default" : "outline"}
            size="sm"
            asChild
          >
            <Link href={f.value ? `/dashboard/documents?status=${f.value}` : "/dashboard/documents"}>
              {f.label}
            </Link>
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {status ? `${status.replace("_", " ")} Documents` : "All Documents"}
          </CardTitle>
          <CardDescription>{documents.length} document{documents.length !== 1 ? "s" : ""}</CardDescription>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ScrollText className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="font-medium mb-1">No documents found</p>
              <p className="text-sm mb-4">Issue a document from a published template.</p>
              <Button asChild>
                <Link href="/dashboard/documents/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Issue Document
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Issued At</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-mono text-xs font-medium">
                      {doc.humanReadableId}
                    </TableCell>
                    <TableCell className="font-medium">{doc.recipientName}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {TYPE_LABELS[doc.type] ?? doc.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[doc.status] ?? "outline"} className="text-xs">
                        {doc.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {doc.issuedAt
                        ? new Date(doc.issuedAt).toLocaleDateString()
                        : "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {doc.createdBy.name ?? doc.createdBy.email}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/documents/${doc.id}`}>View</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
