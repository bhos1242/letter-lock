import nodemailer from "nodemailer";
import { prisma_db } from "./prisma";
import { decryptSecret } from "./crypto";

interface SendLetterEmailOptions {
  orgId: string;
  documentId: string;
  recipientEmail: string;
  recipientName: string;
  documentType: string;
  humanReadableId: string;
  uvid: string;
  pdfBuffer?: Buffer;
  verifyUrl: string;
  orgName: string;
}

function getDocumentTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    OFFER_LETTER: "Offer Letter",
    INTERNSHIP_LETTER: "Internship Letter",
    EXPERIENCE_LETTER: "Experience Letter",
    RECOMMENDATION_LETTER: "Recommendation Letter",
  };
  return labels[type] ?? type;
}

function buildLetterEmailHtml(opts: {
  recipientName: string;
  documentType: string;
  orgName: string;
  humanReadableId: string;
  verifyUrl: string;
}): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${opts.documentType} from ${opts.orgName}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background: #f4f4f4;">
  <div style="background: white; border-radius: 8px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <h2 style="color: #1e293b; margin-top: 0;">${opts.documentType}</h2>
    <p>Dear ${opts.recipientName},</p>
    <p>Please find attached your <strong>${opts.documentType}</strong> issued by <strong>${opts.orgName}</strong>.</p>
    <p>Document Reference: <strong>${opts.humanReadableId}</strong></p>
    <p>You can verify the authenticity of this document at any time using the link below:</p>
    <div style="text-align: center; margin: 24px 0;">
      <a href="${opts.verifyUrl}" style="display: inline-block; padding: 12px 28px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">
        Verify Document
      </a>
    </div>
    <p style="color: #64748b; font-size: 14px;">Or visit: ${opts.verifyUrl}</p>
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
    <p style="color: #94a3b8; font-size: 12px; margin: 0;">
      This document is tamper-evident and verifiable. If you did not expect this email, please contact ${opts.orgName} directly.
    </p>
  </div>
</body>
</html>`;
}

/**
 * Sends the issued letter PDF to the recipient using the org's SMTP config.
 */
export async function sendLetterEmail(opts: SendLetterEmailOptions): Promise<void> {
  const config = await prisma_db.organizationEmailConfig.findUnique({
    where: { organizationId: opts.orgId },
  });

  if (!config) {
    throw new Error("No SMTP configuration found for this organization. Please configure SMTP in settings.");
  }

  const smtpPassword = decryptSecret(config.smtpPasswordEncrypted);

  const transporter = nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.useTls && config.smtpPort === 465,
    requireTLS: config.useTls && config.smtpPort !== 465,
    auth: {
      user: config.smtpUsername,
      pass: smtpPassword,
    },
  });

  const docTypeLabel = getDocumentTypeLabel(opts.documentType);
  const subject = `${docTypeLabel} from ${opts.orgName} — Ref: ${opts.humanReadableId}`;

  const mailOptions: nodemailer.SendMailOptions = {
    from: `"${config.smtpFromName}" <${config.smtpFromEmail}>`,
    to: opts.recipientEmail,
    subject,
    html: buildLetterEmailHtml({
      recipientName: opts.recipientName,
      documentType: docTypeLabel,
      orgName: opts.orgName,
      humanReadableId: opts.humanReadableId,
      verifyUrl: opts.verifyUrl,
    }),
  };

  if (opts.pdfBuffer) {
    mailOptions.attachments = [
      {
        filename: `${opts.humanReadableId}.pdf`,
        content: opts.pdfBuffer,
        contentType: "application/pdf",
      },
    ];
  }

  // Log before send
  const logEntry = await prisma_db.emailLog.create({
    data: {
      organizationId: opts.orgId,
      documentId: opts.documentId,
      recipientEmail: opts.recipientEmail,
      subject,
      status: "PENDING",
    },
  });

  try {
    const info = await transporter.sendMail(mailOptions);

    await prisma_db.emailLog.update({
      where: { id: logEntry.id },
      data: {
        status: "SENT",
        providerMessageId: info.messageId,
        sentAt: new Date(),
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    await prisma_db.emailLog.update({
      where: { id: logEntry.id },
      data: {
        status: "FAILED",
        errorMessage,
      },
    });
    throw error;
  }
}

/**
 * Tests an SMTP configuration without sending a real email.
 */
export async function testSmtpConnection(config: {
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
  useTls: boolean;
}): Promise<{ success: boolean; message: string }> {
  try {
    const transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.useTls && config.smtpPort === 465,
      requireTLS: config.useTls && config.smtpPort !== 465,
      auth: {
        user: config.smtpUsername,
        pass: config.smtpPassword,
      },
    });

    await transporter.verify();
    return { success: true, message: "SMTP connection verified successfully." };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, message: `SMTP connection failed: ${message}` };
  }
}
