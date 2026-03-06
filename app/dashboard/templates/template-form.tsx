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
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  UnderlineIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Heading2,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  type: z.enum([
    "OFFER_LETTER",
    "INTERNSHIP_LETTER",
    "EXPERIENCE_LETTER",
    "RECOMMENDATION_LETTER",
  ]),
  requiresApproval: z.boolean(),
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
    },
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({
        placeholder:
          'Write your template here. Use {{variable_name}} for dynamic fields, e.g. "Dear {{candidate_name}}, we are pleased to offer you the position of {{job_title}}."',
      }),
    ],
    content: defaultValues?.content ?? "",
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setDetectedVars(extractVariables(html));
    },
  });

  function onSubmit(values: FormValues) {
    const content = editor?.getHTML() ?? "";
    if (!content || content === "<p></p>") {
      toast.error("Template content cannot be empty");
      return;
    }

    startTransition(async () => {
      const fd = new FormData();
      fd.set("name", values.name);
      fd.set("type", values.type);
      fd.set("requiresApproval", String(values.requiresApproval));
      fd.set("content", content);

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
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-1 border rounded-md p-1">
              <Button
                type="button"
                variant={editor?.isActive("bold") ? "secondary" : "ghost"}
                size="icon"
                className="h-7 w-7"
                onClick={() => editor?.chain().focus().toggleBold().run()}
              >
                <Bold className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant={editor?.isActive("italic") ? "secondary" : "ghost"}
                size="icon"
                className="h-7 w-7"
                onClick={() => editor?.chain().focus().toggleItalic().run()}
              >
                <Italic className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant={editor?.isActive("underline") ? "secondary" : "ghost"}
                size="icon"
                className="h-7 w-7"
                onClick={() => editor?.chain().focus().toggleUnderline().run()}
              >
                <UnderlineIcon className="h-3.5 w-3.5" />
              </Button>
              <Separator orientation="vertical" className="h-5 mx-1" />
              <Button
                type="button"
                variant={editor?.isActive("heading", { level: 2 }) ? "secondary" : "ghost"}
                size="icon"
                className="h-7 w-7"
                onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
              >
                <Heading2 className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant={editor?.isActive("bulletList") ? "secondary" : "ghost"}
                size="icon"
                className="h-7 w-7"
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
              >
                <List className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant={editor?.isActive("orderedList") ? "secondary" : "ghost"}
                size="icon"
                className="h-7 w-7"
                onClick={() => editor?.chain().focus().toggleOrderedList().run()}
              >
                <ListOrdered className="h-3.5 w-3.5" />
              </Button>
              <Separator orientation="vertical" className="h-5 mx-1" />
              <Button
                type="button"
                variant={editor?.isActive({ textAlign: "left" }) ? "secondary" : "ghost"}
                size="icon"
                className="h-7 w-7"
                onClick={() => editor?.chain().focus().setTextAlign("left").run()}
              >
                <AlignLeft className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant={editor?.isActive({ textAlign: "center" }) ? "secondary" : "ghost"}
                size="icon"
                className="h-7 w-7"
                onClick={() => editor?.chain().focus().setTextAlign("center").run()}
              >
                <AlignCenter className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant={editor?.isActive({ textAlign: "right" }) ? "secondary" : "ghost"}
                size="icon"
                className="h-7 w-7"
                onClick={() => editor?.chain().focus().setTextAlign("right").run()}
              >
                <AlignRight className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="border rounded-md min-h-[320px] p-3 prose prose-sm max-w-none dark:prose-invert focus-within:ring-1 focus-within:ring-ring">
              <EditorContent editor={editor} />
            </div>

            <FormDescription>
              Use double curly braces for variables: <code className="text-xs bg-muted px-1 rounded">{"{{candidate_name}}"}</code>
            </FormDescription>
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
