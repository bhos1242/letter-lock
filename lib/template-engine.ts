// Supported template variables
export const SUPPORTED_VARIABLES = [
  "candidate_name",
  "employee_name",
  "employee_id",
  "job_title",
  "department",
  "salary",
  "joining_date",
  "start_date",
  "end_date",
  "manager_name",
  "issue_date",
  "company_name",
  "company_address",
  "company_website",
  "recipient_email",
] as const;

export type TemplateVariable = (typeof SUPPORTED_VARIABLES)[number];

export type VariableValues = Partial<Record<TemplateVariable, string>>;

// Regex that matches {{variable_name}} placeholders
const VARIABLE_REGEX = /\{\{(\s*[\w_]+\s*)\}\}/g;

/**
 * Extracts all {{variable}} placeholders found in the template content.
 */
export function extractVariables(content: string): string[] {
  const found = new Set<string>();
  let match: RegExpExecArray | null;
  const regex = new RegExp(VARIABLE_REGEX.source, "g");

  while ((match = regex.exec(content)) !== null) {
    found.add(match[1].trim());
  }

  return Array.from(found);
}

/**
 * Sanitizes a variable value to prevent XSS in HTML templates.
 */
function sanitizeValue(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

/**
 * Replaces {{variable}} placeholders in content with provided values.
 * - Unknown variables that have no value are left as-is (for preview) or throw (for issuance).
 */
export function renderTemplate(
  content: string,
  values: VariableValues,
  options: { strict?: boolean; sanitize?: boolean } = {}
): string {
  const { strict = false, sanitize = true } = options;

  return content.replace(VARIABLE_REGEX, (_, rawKey: string) => {
    const key = rawKey.trim() as TemplateVariable;
    const val = values[key];

    if (val === undefined || val === null || val === "") {
      if (strict) {
        throw new Error(`Missing required variable: {{${key}}}`);
      }
      return `{{${key}}}`; // leave placeholder for preview
    }

    return sanitize ? sanitizeValue(String(val)) : String(val);
  });
}

/**
 * Validates that all required variables are present in the values object.
 * Returns an array of missing variable names.
 */
export function validateVariables(
  requiredVariables: string[],
  values: Record<string, string>
): string[] {
  return requiredVariables.filter(
    (v) => !values[v] || values[v].trim() === ""
  );
}

/**
 * Strips HTML tags for use in PDF plain-text rendering.
 * Preserves paragraph breaks.
 */
export function htmlToPlainText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<li>/gi, "• ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
