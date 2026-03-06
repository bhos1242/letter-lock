import { getEmailConfig } from "@/app/actions/email-config";
import { SmtpForm } from "./smtp-form";

export default async function SmtpSettingsPage() {
  const config = await getEmailConfig();

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">SMTP Settings</h1>
        <p className="text-muted-foreground text-sm">
          Configure your organization&apos;s outbound email server. Credentials are encrypted before storage.
        </p>
      </div>
      <SmtpForm
        defaultValues={
          config
            ? {
                smtpHost: config.smtpHost,
                smtpPort: String(config.smtpPort),
                smtpUsername: config.smtpUsername,
                smtpFromName: config.smtpFromName,
                smtpFromEmail: config.smtpFromEmail,
                useTls: config.useTls,
              }
            : undefined
        }
      />
    </div>
  );
}
