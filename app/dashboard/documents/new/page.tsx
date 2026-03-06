import { getTemplates } from "@/app/actions/templates";
import { IssueDocumentForm } from "../issue-document-form";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileText } from "lucide-react";

export default async function NewDocumentPage() {
  const templates = await getTemplates("PUBLISHED");

  if (templates.length === 0) {
    return (
      <div className="max-w-xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Issue Document</h1>
          <p className="text-muted-foreground text-sm">Generate a verifiable letter for a recipient.</p>
        </div>
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <FileText className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium mb-1">No published templates</p>
            <p className="text-sm mb-4">You need at least one published template to issue documents.</p>
            <Button asChild>
              <Link href="/dashboard/templates/new">Create a Template</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Issue Document</h1>
        <p className="text-muted-foreground text-sm">
          Select a template, fill in the recipient details, and issue a verifiable letter.
        </p>
      </div>
      <IssueDocumentForm templates={templates} />
    </div>
  );
}
