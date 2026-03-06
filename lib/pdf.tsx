// Server-only: PDF generation using @react-pdf/renderer
// Do NOT import this file in client components.

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  renderToBuffer,
  Font,
} from "@react-pdf/renderer";
import { htmlToPlainText } from "./template-engine";

// Register a clean sans-serif font (uses built-in Helvetica as fallback)
Font.registerHyphenationCallback((word) => [word]);

interface LetterPDFData {
  organizationName: string;
  organizationAddress?: string;
  primaryColor?: string;
  logoUrl?: string;
  letterheadUrl?: string;
  signatureUrl?: string;
  stampUrl?: string;
  documentType: string;
  humanReadableId: string;
  uvid: string;
  verificationCode: string;
  verifyUrl: string;
  qrCodeDataUrl: string;
  renderedContent: string; // HTML content after variable replacement
  recipientName: string;
  issuedAt: Date;
}

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10.5,
    color: "#1e293b",
    paddingTop: 0,
    paddingBottom: 60,
    paddingHorizontal: 0,
  },
  letterhead: {
    width: "100%",
    height: 120,
    objectFit: "cover",
  },
  headerBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#e2e8f0",
  },
  logo: {
    width: 64,
    height: 64,
    objectFit: "contain",
    marginRight: 16,
  },
  orgInfo: {
    flex: 1,
  },
  orgName: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
    marginBottom: 2,
  },
  orgAddress: {
    fontSize: 9,
    color: "#64748b",
    lineHeight: 1.4,
  },
  body: {
    paddingHorizontal: 40,
    paddingTop: 28,
  },
  docTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    letterSpacing: 1.5,
    marginBottom: 6,
    color: "#0f172a",
    textDecoration: "underline",
  },
  dateRow: {
    fontSize: 9.5,
    color: "#64748b",
    marginBottom: 24,
    textAlign: "right",
  },
  paragraph: {
    fontSize: 10.5,
    lineHeight: 1.7,
    color: "#1e293b",
    marginBottom: 12,
    textAlign: "justify",
  },
  signatureSection: {
    marginTop: 32,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  signatureBlock: {
    alignItems: "flex-start",
  },
  signatureImage: {
    width: 100,
    height: 50,
    objectFit: "contain",
    marginBottom: 4,
  },
  stampImage: {
    width: 80,
    height: 80,
    objectFit: "contain",
    opacity: 0.85,
  },
  sigLine: {
    borderTopWidth: 1,
    borderTopColor: "#cbd5e1",
    width: 140,
    paddingTop: 4,
    fontSize: 9,
    color: "#64748b",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingHorizontal: 40,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8fafc",
  },
  footerText: {
    flex: 1,
  },
  footerLabel: {
    fontSize: 7.5,
    color: "#94a3b8",
    marginBottom: 2,
  },
  footerValue: {
    fontSize: 8,
    color: "#475569",
    fontFamily: "Helvetica-Bold",
    marginBottom: 3,
  },
  footerVerify: {
    fontSize: 7.5,
    color: "#3b82f6",
  },
  qrCode: {
    width: 64,
    height: 64,
  },
});

function getDocumentTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    OFFER_LETTER: "OFFER LETTER",
    INTERNSHIP_LETTER: "INTERNSHIP LETTER",
    EXPERIENCE_LETTER: "EXPERIENCE LETTER",
    RECOMMENDATION_LETTER: "RECOMMENDATION LETTER",
  };
  return labels[type] ?? type;
}

function LetterDocument({ data }: { data: LetterPDFData }) {
  const plainContent = htmlToPlainText(data.renderedContent);
  const paragraphs = plainContent.split("\n\n").filter(Boolean);
  const docLabel = getDocumentTypeLabel(data.documentType);
  const issuedDate = data.issuedAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Document
      title={`${docLabel} — ${data.humanReadableId}`}
      author={data.organizationName}
      subject={data.documentType}
      creator="VerifyLetters Platform"
    >
      <Page size="A4" style={styles.page}>
        {/* Letterhead image (optional) */}
        {data.letterheadUrl ? (
          <Image src={data.letterheadUrl} style={styles.letterhead} />
        ) : null}

        {/* Header: Logo + Org Info */}
        <View style={styles.headerBox}>
          {data.logoUrl ? (
            <Image src={data.logoUrl} style={styles.logo} />
          ) : null}
          <View style={styles.orgInfo}>
            <Text style={styles.orgName}>{data.organizationName}</Text>
            {data.organizationAddress ? (
              <Text style={styles.orgAddress}>{data.organizationAddress}</Text>
            ) : null}
          </View>
        </View>

        {/* Body */}
        <View style={styles.body}>
          <Text
            style={[
              styles.docTitle,
              data.primaryColor ? { color: data.primaryColor } : {},
            ]}
          >
            {docLabel}
          </Text>
          <Text style={styles.dateRow}>Date: {issuedDate}</Text>

          {/* Letter paragraphs */}
          {paragraphs.map((para, i) => (
            <Text key={i} style={styles.paragraph}>
              {para}
            </Text>
          ))}

          {/* Signature & Stamp */}
          <View style={styles.signatureSection}>
            <View style={styles.signatureBlock}>
              {data.signatureUrl ? (
                <Image src={data.signatureUrl} style={styles.signatureImage} />
              ) : null}
              <View style={styles.sigLine}>
                <Text>Authorized Signatory</Text>
                <Text>{data.organizationName}</Text>
              </View>
            </View>

            {data.stampUrl ? (
              <Image src={data.stampUrl} style={styles.stampImage} />
            ) : null}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <View style={styles.footerText}>
            <Text style={styles.footerLabel}>Document Reference</Text>
            <Text style={styles.footerValue}>{data.humanReadableId}</Text>
            <Text style={styles.footerLabel}>Verification ID (UVID)</Text>
            <Text style={styles.footerValue}>{data.uvid}</Text>
            <Text style={styles.footerLabel}>Verification Code</Text>
            <Text style={styles.footerValue}>{data.verificationCode}</Text>
            <Text
              style={[
                styles.footerVerify,
                data.primaryColor ? { color: data.primaryColor } : {},
              ]}
            >
              {data.verifyUrl}
            </Text>
          </View>
          <Image src={data.qrCodeDataUrl} style={styles.qrCode} />
        </View>
      </Page>
    </Document>
  );
}

/**
 * Generates a PDF letter and returns it as a Buffer.
 * Also returns the SHA-256 hash of the PDF.
 */
export async function generateLetterPDF(
  data: LetterPDFData
): Promise<{ buffer: Buffer; hashSha256: string }> {
  const buffer = await renderToBuffer(<LetterDocument data={data} />);

  const crypto = await import("crypto");
  const hashSha256 = crypto
    .createHash("sha256")
    .update(buffer)
    .digest("hex");

  return { buffer, hashSha256 };
}
