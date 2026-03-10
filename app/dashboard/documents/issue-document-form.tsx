"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { issueDocument } from "@/app/actions/documents";
import { SUPPORTED_VARIABLES } from "@/lib/template-engine";

type Template = {
  id: string;
  name: string;
  type: string;
  requiresApproval: boolean;
  currentVersion: { variableSchemaJson: string; content?: string | null } | null;
};

const VAR_LABELS: Record<string, string> = {
  candidate_name: "Candidate Name",
  employee_name: "Employee Name",
  employee_id: "Employee ID",
  job_title: "Job Title",
  department: "Department",
  salary: "Salary",
  joining_date: "Joining Date",
  start_date: "Start Date",
  end_date: "End Date",
  manager_name: "Manager Name",
  issue_date: "Issue Date",
  company_name: "Company Name (auto)",
  company_address: "Company Address (auto)",
  company_website: "Company Website (auto)",
  recipient_email: "Recipient Email (auto)",
};

export function IssueDocumentForm({ templates }: { templates: Template[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [sendEmail, setSendEmail] = useState(false);
  const [variables, setVariables] = useState<Record<string, string>>({});

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);
  const requiredVars: string[] = selectedTemplate?.currentVersion
    ? JSON.parse(selectedTemplate.currentVersion.variableSchemaJson)
    : [];

  const autoFilledVars = ["company_name", "company_address", "company_website", "recipient_email", "issue_date"];
  const editableVars = requiredVars.filter((v) => !autoFilledVars.includes(v));

  function handleTemplateChange(id: string) {
    setSelectedTemplateId(id);
    setVariables({});
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedTemplateId) {
      toast.error("Please select a template");
      return;
    }

    if (!recipientName.trim()) {
      toast.error("Recipient name is required");
      return;
    }

    startTransition(async () => {
      const fd = new FormData();
      fd.set("templateId", selectedTemplateId);
      fd.set("recipientName", recipientName);
      fd.set("recipientEmail", recipientEmail);
      fd.set("roleTitle", roleTitle);
      fd.set("sendEmail", String(sendEmail));

      for (const [key, value] of Object.entries(variables)) {
        fd.set(`var_${key}`, value);
      }

      const result = await issueDocument(fd);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.status === "PENDING_APPROVAL") {
        toast.success("Document submitted for approval");
      } else {
        toast.success("Document issued successfully");
      }

      router.push(`/dashboard/documents/${result.documentId}`);
    });
  }

  const combinedVars: Record<string, string> = {
    ...variables,
    candidate_name: recipientName,
    recipient_email: recipientEmail,
    job_title: roleTitle,
  };

  const renderPreview = (html: string | undefined | null, vars: Record<string, string>) => {
    if (!html) return "<div class='flex items-center justify-center h-full text-muted-foreground'>Select a template to view the preview.</div>";
    
    let preview = html;
    const dummyAutofill: Record<string, string> = {
      company_name: "[Company Name]",
      company_address: "[Company Address]",
      company_website: "[Company Website]",
      issue_date: new Date().toLocaleDateString(),
    };
    
    preview = preview.replace(/{{([^}]+)}}/g, (match, varName) => {
      const value = vars[varName] !== undefined && vars[varName] !== "" ? vars[varName] : dummyAutofill[varName];
      if (value) {
        return `<strong class="bg-primary/20 text-primary px-1 rounded shadow-sm">${value}</strong>`;
      }
      return `<strong class="bg-destructive/10 text-destructive px-1 rounded shadow-sm">${match}</strong>`;
    });

    return preview;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start w-full">
      <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Template</CardTitle>
        </CardHeader>
        <CardContent>
          <Select onValueChange={handleTemplateChange} value={selectedTemplateId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a template..." />
            </SelectTrigger>
            <SelectContent>
              {templates.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                  {t.requiresApproval && (
                    <span className="ml-2 text-xs text-muted-foreground">(requires approval)</span>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedTemplate?.requiresApproval && (
            <p className="text-xs text-yellow-700 mt-2 bg-yellow-50 dark:bg-yellow-950/20 px-3 py-2 rounded border border-yellow-200">
              This template requires approver sign-off. The document will be submitted for review.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recipient Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipientName">Full Name *</Label>
            <Input
              id="recipientName"
              placeholder="John Doe"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="recipientEmail">Email Address</Label>
            <Input
              id="recipientEmail"
              type="email"
              placeholder="john@example.com"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="roleTitle">Role / Position</Label>
            <Input
              id="roleTitle"
              placeholder="e.g. Software Engineer"
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {editableVars.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Template Variables</CardTitle>
            <CardDescription>Fill in the dynamic fields for this letter.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {editableVars.map((v) => (
              <div key={v} className="space-y-2">
                <Label htmlFor={`var_${v}`}>
                  {VAR_LABELS[v] ?? v}{" "}
                  <Badge variant="outline" className="font-mono text-xs ml-1">{`{{${v}}}`}</Badge>
                </Label>
                <Input
                  id={`var_${v}`}
                  placeholder={VAR_LABELS[v] ?? v}
                  value={variables[v] ?? ""}
                  onChange={(e) =>
                    setVariables((prev) => ({ ...prev, [v]: e.target.value }))
                  }
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Email Delivery</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Switch
              id="sendEmail"
              checked={sendEmail}
              onCheckedChange={setSendEmail}
              disabled={!recipientEmail}
            />
            <Label htmlFor="sendEmail" className="cursor-pointer">
              {recipientEmail
                ? `Send PDF to ${recipientEmail} after issuance`
                : "Enter recipient email above to enable email delivery"}
            </Label>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending || !selectedTemplateId}>
          {isPending
            ? "Processing..."
            : selectedTemplate?.requiresApproval
            ? "Submit for Approval"
            : "Issue Document"}
        </Button>
      </div>
    </form>

    {/* Live Preview Pane */}
    <div className="sticky top-6 hidden lg:block">
      <Card className="h-[800px] flex flex-col overflow-hidden border-muted-foreground/20 shadow-md">
        <CardHeader className="border-b bg-muted/30 py-4">
          <CardTitle className="text-base flex items-center justify-between">
            <span>Live Preview</span>
            <Badge variant="secondary" className="font-normal text-xs">Preview Mode</Badge>
          </CardTitle>
          <CardDescription>Real-time preview of the document being generated</CardDescription>
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-y-auto bg-white dark:bg-zinc-950">
          <div 
             className="px-10 py-12 prose prose-sm max-w-none dark:prose-invert"
             dangerouslySetInnerHTML={{ __html: renderPreview(selectedTemplate?.currentVersion?.content, combinedVars) }}
          />
        </CardContent>
      </Card>
    </div>
  </div>
  );
}
