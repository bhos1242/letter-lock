import crypto from "crypto";
import { TemplateType } from "./generated/prisma/client";

const TYPE_PREFIX: Record<TemplateType, string> = {
  OFFER_LETTER: "OL",
  INTERNSHIP_LETTER: "IL",
  EXPERIENCE_LETTER: "EL",
  RECOMMENDATION_LETTER: "RL",
};

/**
 * Generates a human-readable document ID.
 * Format: OL-2026-000042
 */
export function generateHumanReadableId(
  type: TemplateType,
  sequence: number
): string {
  const prefix = TYPE_PREFIX[type];
  const year = new Date().getFullYear();
  const seq = String(sequence).padStart(6, "0");
  return `${prefix}-${year}-${seq}`;
}

/**
 * Generates a UUID v4 for use as the UVID (Unique Verification ID).
 */
export function generateUVID(): string {
  return crypto.randomUUID();
}

/**
 * Generates an 8-character alphanumeric verification code.
 * Avoids ambiguous characters (0, O, I, l).
 */
export function generateVerificationCode(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let code = "";
  const bytes = crypto.randomBytes(8);
  for (let i = 0; i < 8; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return code;
}

/**
 * Gets the next document sequence number for an organization.
 * Uses the current count of documents for that org to generate sequential IDs.
 */
export async function getNextSequence(
  prisma: { document: { count: (args: { where: { organizationId: string } }) => Promise<number> } },
  organizationId: string
): Promise<number> {
  const count = await prisma.document.count({ where: { organizationId } });
  return count + 1;
}
