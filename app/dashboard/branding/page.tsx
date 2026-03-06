import { getBranding } from "@/app/actions/branding";
import { BrandingForm } from "./branding-form";

export default async function BrandingPage() {
  const branding = await getBranding();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Branding</h1>
        <p className="text-muted-foreground text-sm">
          Upload your organization&apos;s logo, letterhead, stamp, and signature for PDF letters.
        </p>
      </div>
      <BrandingForm
        defaultValues={{
          primaryColor: branding?.primaryColor ?? "#2563eb",
          supportEmail: branding?.supportEmail ?? "",
          website: branding?.website ?? "",
          address: branding?.address ?? "",
          logoUrl: branding?.logoUrl ?? "",
          letterheadUrl: branding?.letterheadUrl ?? "",
          stampUrl: branding?.stampUrl ?? "",
          signatureUrl: branding?.signatureUrl ?? "",
        }}
      />
    </div>
  );
}
