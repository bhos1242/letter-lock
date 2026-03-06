"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { updateBranding } from "@/app/actions/branding";
import { Upload, Loader2, Image as ImageIcon } from "lucide-react";

interface BrandingFormProps {
  defaultValues: {
    primaryColor: string;
    supportEmail: string;
    website: string;
    address: string;
    logoUrl: string;
    letterheadUrl: string;
    stampUrl: string;
    signatureUrl: string;
  };
}

function AssetUploadField({
  label,
  description,
  currentUrl,
  onUploaded,
  kind,
}: {
  label: string;
  description: string;
  currentUrl: string;
  onUploaded: (url: string) => void;
  kind: string;
}) {
  const [isUploading, setIsUploading] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("kind", kind);

      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();

      if (!res.ok || data.error) {
        toast.error(data.error ?? "Upload failed");
        return;
      }

      onUploaded(data.url);
      toast.success(`${label} uploaded`);
    } catch {
      toast.error("Upload failed");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-3">
        {currentUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={currentUrl}
            alt={label}
            className="h-12 w-12 object-contain rounded border bg-muted"
          />
        ) : (
          <div className="h-12 w-12 rounded border bg-muted flex items-center justify-center">
            <ImageIcon className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
        <div className="flex-1">
          <label className="cursor-pointer">
            <Button type="button" variant="outline" size="sm" asChild disabled={isUploading}>
              <span>
                {isUploading ? (
                  <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-3.5 w-3.5 mr-2" />
                )}
                {isUploading ? "Uploading..." : "Upload"}
              </span>
            </Button>
            <input
              type="file"
              className="sr-only"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/svg+xml"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </label>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>
      </div>
    </div>
  );
}

export function BrandingForm({ defaultValues }: BrandingFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [values, setValues] = useState(defaultValues);

  function set(key: keyof typeof values, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const fd = new FormData();
      for (const [key, value] of Object.entries(values)) {
        fd.set(key, value);
      }

      const result = await updateBranding(fd);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Branding saved");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Brand Assets</CardTitle>
          <CardDescription>
            These images appear in all generated PDF letters.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <AssetUploadField
            label="Company Logo"
            description="Shown in the PDF header. PNG or SVG recommended, max 5MB."
            currentUrl={values.logoUrl}
            onUploaded={(url) => set("logoUrl", url)}
            kind="LOGO"
          />
          <Separator />
          <AssetUploadField
            label="Letterhead Background"
            description="Full-width banner at top of PDF. Recommended size: 794×120px."
            currentUrl={values.letterheadUrl}
            onUploaded={(url) => set("letterheadUrl", url)}
            kind="LETTERHEAD"
          />
          <Separator />
          <AssetUploadField
            label="Authorized Signature"
            description="Appears above signatory line. Transparent PNG recommended."
            currentUrl={values.signatureUrl}
            onUploaded={(url) => set("signatureUrl", url)}
            kind="SIGNATURE"
          />
          <Separator />
          <AssetUploadField
            label="Official Stamp"
            description="Company seal/stamp image. Transparent PNG recommended."
            currentUrl={values.stampUrl}
            onUploaded={(url) => set("stampUrl", url)}
            kind="STAMP"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Organization Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Primary Color</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  id="primaryColor"
                  value={values.primaryColor}
                  onChange={(e) => set("primaryColor", e.target.value)}
                  className="h-9 w-12 rounded border cursor-pointer"
                />
                <Input
                  value={values.primaryColor}
                  onChange={(e) => set("primaryColor", e.target.value)}
                  placeholder="#2563eb"
                  className="font-mono"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="supportEmail">Support Email</Label>
              <Input
                id="supportEmail"
                type="email"
                value={values.supportEmail}
                onChange={(e) => set("supportEmail", e.target.value)}
                placeholder="hr@company.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              value={values.website}
              onChange={(e) => set("website", e.target.value)}
              placeholder="https://www.company.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Office Address</Label>
            <Textarea
              id="address"
              value={values.address}
              onChange={(e) => set("address", e.target.value)}
              placeholder="123 Business Ave, City, State 12345"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save Branding"}
        </Button>
      </div>
    </form>
  );
}
