import { getTemplates } from "@/app/actions/templates";
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
import { Plus, FileText, Pencil } from "lucide-react";
import Link from "next/link";
import { TemplateActionsMenu } from "./template-actions-menu";

const TYPE_LABELS: Record<string, string> = {
  OFFER_LETTER: "Offer Letter",
  INTERNSHIP_LETTER: "Internship Letter",
  EXPERIENCE_LETTER: "Experience Letter",
  RECOMMENDATION_LETTER: "Recommendation Letter",
};

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  PUBLISHED: "default",
  DRAFT: "outline",
  ARCHIVED: "secondary",
};

export default async function TemplatesPage() {
  const templates = await getTemplates();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Templates</h1>
          <p className="text-muted-foreground text-sm">
            Manage your reusable letter templates.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/templates/new">
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Templates</CardTitle>
          <CardDescription>{templates.length} template{templates.length !== 1 ? "s" : ""} total</CardDescription>
        </CardHeader>
        <CardContent>
          {templates.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="font-medium mb-1">No templates yet</p>
              <p className="text-sm mb-4">Create your first letter template to get started.</p>
              <Button asChild>
                <Link href="/dashboard/templates/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Documents</TableHead>
                  <TableHead>Approval</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {TYPE_LABELS[t.type] ?? t.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[t.status] ?? "outline"} className="text-xs">
                        {t.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      v{t.currentVersion?.versionNumber ?? 1}
                    </TableCell>
                    <TableCell className="text-sm">{t._count.documents}</TableCell>
                    <TableCell className="text-sm">
                      {t.requiresApproval ? (
                        <Badge variant="outline" className="text-xs text-yellow-700 border-yellow-300">Required</Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                          <Link href={`/dashboard/templates/${t.id}/edit`}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                        <TemplateActionsMenu templateId={t.id} status={t.status} />
                      </div>
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
