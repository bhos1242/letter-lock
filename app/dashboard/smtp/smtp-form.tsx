"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { saveEmailConfig, testSmtpConfig } from "@/app/actions/email-config";
import { Eye, EyeOff, CheckCircle2, XCircle, Loader2 } from "lucide-react";

interface SmtpFormProps {
  defaultValues?: {
    smtpHost: string;
    smtpPort: string;
    smtpUsername: string;
    smtpFromName: string;
    smtpFromEmail: string;
    useTls: boolean;
  };
}

export function SmtpForm({ defaultValues }: SmtpFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isTesting, startTest] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const [values, setValues] = useState({
    smtpHost: defaultValues?.smtpHost ?? "",
    smtpPort: defaultValues?.smtpPort ?? "587",
    smtpUsername: defaultValues?.smtpUsername ?? "",
    smtpPassword: "",
    smtpFromName: defaultValues?.smtpFromName ?? "",
    smtpFromEmail: defaultValues?.smtpFromEmail ?? "",
    useTls: defaultValues?.useTls ?? true,
  });

  function set(key: keyof typeof values, value: string | boolean) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setTestResult(null);
  }

  function buildFormData() {
    const fd = new FormData();
    for (const [key, value] of Object.entries(values)) {
      fd.set(key, String(value));
    }
    return fd;
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await saveEmailConfig(buildFormData());
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("SMTP settings saved");
      router.refresh();
    });
  }

  function handleTest() {
    if (!values.smtpPassword) {
      toast.error("Enter the SMTP password to test the connection");
      return;
    }
    startTest(async () => {
      const result = await testSmtpConfig(buildFormData());
      setTestResult(result);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Server Configuration</CardTitle>
          <CardDescription>
            Your SMTP password is encrypted with AES-256-GCM before being stored.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="smtpHost">SMTP Host *</Label>
              <Input
                id="smtpHost"
                value={values.smtpHost}
                onChange={(e) => set("smtpHost", e.target.value)}
                placeholder="smtp.gmail.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtpPort">Port *</Label>
              <Input
                id="smtpPort"
                value={values.smtpPort}
                onChange={(e) => set("smtpPort", e.target.value)}
                placeholder="587"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="smtpUsername">Username *</Label>
              <Input
                id="smtpUsername"
                value={values.smtpUsername}
                onChange={(e) => set("smtpUsername", e.target.value)}
                placeholder="user@company.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtpPassword">
                Password *
                {defaultValues && (
                  <Badge variant="outline" className="ml-2 text-xs">stored (enter to change)</Badge>
                )}
              </Label>
              <div className="relative">
                <Input
                  id="smtpPassword"
                  type={showPassword ? "text" : "password"}
                  value={values.smtpPassword}
                  onChange={(e) => set("smtpPassword", e.target.value)}
                  placeholder={defaultValues ? "••••••••" : "Enter password"}
                  required={!defaultValues}
                  className="pr-9"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Switch
              id="useTls"
              checked={values.useTls}
              onCheckedChange={(v) => set("useTls", v)}
            />
            <Label htmlFor="useTls">Use TLS/STARTTLS</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sender Identity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="smtpFromName">From Name *</Label>
              <Input
                id="smtpFromName"
                value={values.smtpFromName}
                onChange={(e) => set("smtpFromName", e.target.value)}
                placeholder="Acme Corp HR"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtpFromEmail">From Email *</Label>
              <Input
                id="smtpFromEmail"
                type="email"
                value={values.smtpFromEmail}
                onChange={(e) => set("smtpFromEmail", e.target.value)}
                placeholder="hr@acme.com"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {testResult && (
        <div
          className={`flex items-center gap-2 p-3 rounded border text-sm ${
            testResult.success
              ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-950/20"
              : "bg-red-50 border-red-200 text-red-800 dark:bg-red-950/20"
          }`}
        >
          {testResult.success ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <XCircle className="h-4 w-4 shrink-0" />
          )}
          {testResult.message}
        </div>
      )}

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={handleTest} disabled={isTesting || isPending}>
          {isTesting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
          {isTesting ? "Testing..." : "Test Connection"}
        </Button>
        <Button type="submit" disabled={isPending || isTesting}>
          {isPending ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </form>
  );
}
