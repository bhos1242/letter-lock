import { TemplateForm } from "../template-form";

export default function NewTemplatePage() {
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Create Template</h1>
        <p className="text-muted-foreground text-sm">
          Define a reusable letter template with dynamic variable placeholders.
        </p>
      </div>
      <TemplateForm />
    </div>
  );
}
