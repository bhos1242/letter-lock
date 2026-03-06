"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Building2, ArrowRight, Loader2 } from "lucide-react";
import { createOrganization } from "@/app/actions/org";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(50)
    .regex(
      /^[a-z0-9-]+$/,
      "Slug may only contain lowercase letters, numbers, and hyphens"
    ),
});

type FormValues = z.infer<typeof schema>;

export default function OnboardingPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", slug: "" },
  });

  const nameValue = form.watch("name");

  // Auto-generate slug from name
  function handleNameChange(value: string) {
    form.setValue("name", value);
    const slug = value
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .slice(0, 50);
    form.setValue("slug", slug, { shouldValidate: form.formState.isSubmitted });
  }

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("name", values.name);
      fd.set("slug", values.slug);

      const result = await createOrganization(fd);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Organization created successfully!");
      router.push("/dashboard");
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8 gap-3">
          <div className="rounded-full bg-primary/10 p-4">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold">Create your organization</h1>
            <p className="text-muted-foreground mt-1">
              Set up your organization to start issuing verifiable letters.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Organization details</CardTitle>
            <CardDescription>
              You can change these settings later in the dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Acme Corp"
                          {...field}
                          onChange={(e) => handleNameChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL slug</FormLabel>
                      <FormControl>
                        <Input placeholder="acme-corp" {...field} />
                      </FormControl>
                      <FormDescription>
                        Used in your organization&apos;s URL. Lowercase letters,
                        numbers, and hyphens only.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <ArrowRight className="h-4 w-4 mr-2" />
                  )}
                  {isPending ? "Creating..." : "Create Organization"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
