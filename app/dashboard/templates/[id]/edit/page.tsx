import { getTemplate } from "@/app/actions/templates";
import { TemplateForm } from "../../template-form";
import { notFound } from "next/navigation";

export default async function EditTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const template = await getTemplate(id);

  if (!template) notFound();

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Edit Template</h1>
        <p className="text-muted-foreground text-sm">
          Update the template. A new version will be created automatically.
        </p>
      </div>
      <TemplateForm
        templateId={template.id}
        defaultValues={{
          name: template.name,
          type: template.type,
          requiresApproval: template.requiresApproval,
          content: template.currentVersion?.content ?? "",
        }}
      />
    </div>
  );
}
