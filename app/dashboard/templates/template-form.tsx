"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createTemplate, updateTemplate } from "@/app/actions/templates";
import { extractVariables, SUPPORTED_VARIABLES } from "@/lib/template-engine";
import { Separator } from "@/components/ui/separator";
import InputEditorV2 from "@/components/AppInputFields/InputEditorJS";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  type: z.enum([
    "OFFER_LETTER",
    "INTERNSHIP_LETTER",
    "EXPERIENCE_LETTER",
    "RECOMMENDATION_LETTER",
  ]),
  requiresApproval: z.boolean(),
  content: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface TemplateFormProps {
  templateId?: string;
  defaultValues?: {
    name: string;
    type: string;
    requiresApproval: boolean;
    content: string;
  };
}

export function TemplateForm({ templateId, defaultValues }: TemplateFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [detectedVars, setDetectedVars] = useState<string[]>(
    defaultValues?.content ? extractVariables(defaultValues.content) : []
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      type: (defaultValues?.type as FormValues["type"]) ?? "OFFER_LETTER",
      requiresApproval: defaultValues?.requiresApproval ?? false,
      content: defaultValues?.content ?? "",
    },
  });

  // Watch content changes to update detected variables
  const content = form.watch("content");
  
  // Update detected variables when content changes
  // Using a timeout to debounce the extraction
  useState(() => {
    let timeoutId: NodeJS.Timeout;
    const subscription = form.watch((value, { name }) => {
      if (name === "content") {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          setDetectedVars(extractVariables(value.content || ""));
        }, 500);
      }
    });
    return () => subscription.unsubscribe();
  });

  function onSubmit(values: FormValues) {
    if (!values.content || values.content === "<p></p>") {
      toast.error("Template content cannot be empty");
      return;
    }

    startTransition(async () => {
      const fd = new FormData();
      fd.set("name", values.name);
      fd.set("type", values.type);
      fd.set("requiresApproval", String(values.requiresApproval));
      fd.set("content", values.content || "");

      const result = templateId
        ? await updateTemplate(templateId, fd)
        : await createTemplate(fd);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(templateId ? "Template updated" : "Template created");
      router.push("/dashboard/templates");
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Standard Offer Letter" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="OFFER_LETTER">Offer Letter</SelectItem>
                        <SelectItem value="INTERNSHIP_LETTER">Internship Letter</SelectItem>
                        <SelectItem value="EXPERIENCE_LETTER">Experience Letter</SelectItem>
                        <SelectItem value="RECOMMENDATION_LETTER">Recommendation Letter</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="requiresApproval"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Requires Approval</FormLabel>
                    <div className="flex items-center gap-2 pt-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <span className="text-sm text-muted-foreground">
                        {field.value ? "Approver sign-off needed" : "HR can issue directly"}
                      </span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Template Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InputEditorV2
              name="content"
              label=""
              placeholder={'Write your template here. Use {{variable_name}} for dynamic fields, e.g. "Dear {{candidate_name}}, we are pleased to offer you the position of {{job_title}}."'}
              description={'Use double curly braces for variables: {{candidate_name}}'}
            />
          </CardContent>
        </Card>

        {detectedVars.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Detected Variables</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {detectedVars.map((v) => (
                  <Badge
                    key={v}
                    variant={SUPPORTED_VARIABLES.includes(v as (typeof SUPPORTED_VARIABLES)[number]) ? "default" : "destructive"}
                    className="font-mono text-xs"
                  >
                    {`{{${v}}}`}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Red badges indicate unsupported variable names. Rename them to one of the supported variables.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : templateId ? "Update Template" : "Create Template"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
