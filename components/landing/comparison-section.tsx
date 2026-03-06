import { CheckCircle2, XCircle } from "lucide-react";
import { SectionHeading } from "./atoms/section-heading";

const comparisons = [
  {
    feature: "Document creation",
    manual: "Drafted manually in Google Docs or Word, every time",
    letterlock: "Reusable templates with auto-filled branding and dynamic variables",
  },
  {
    feature: "File security",
    manual: "Editable — anyone who receives it can modify the content",
    letterlock: "Immutable, sealed PDF with SHA-256 hash stored at issuance",
  },
  {
    feature: "Verification",
    manual: "No way to verify — the recipient has to trust the file",
    letterlock: "Public verification portal — anyone can check in seconds, no login needed",
  },
  {
    feature: "Branding",
    manual: "Letterhead, signature, and stamp placed manually every time",
    letterlock: "Uploaded once, applied automatically to every generated document",
  },
  {
    feature: "Audit trail",
    manual: "No record of who issued what, when, or whether it was changed",
    letterlock: "Full, immutable audit log — issuance, approvals, revocations, emails, verifications",
  },
  {
    feature: "Revocation",
    manual: "No way to invalidate a letter once it has been issued",
    letterlock: "Revoke any document in one click — status visible on the verification portal instantly",
  },
  {
    feature: "Email delivery",
    manual: "Manually attached and sent from a personal or shared inbox",
    letterlock: "Sent from your company domain via your SMTP, with the PDF attached automatically",
  },
  {
    feature: "HR workflow",
    manual: "Scattered across shared drives, emails, and personal folders",
    letterlock: "Centralised — all documents, templates, and logs in one organised workspace",
  },
];

export function ComparisonSection() {
  return (
    <section className="bg-slate-50 py-20 lg:py-28">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Comparison"
          title="Manual workflows vs LetterLock"
          description="The difference isn't just efficiency — it's the difference between a document that can be trusted and one that can't."
        />

        <div className="mt-14">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_1fr_1fr] gap-4 mb-3 px-4">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Feature</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-400" /> Manual Process
            </div>
            <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600" /> LetterLock
            </div>
          </div>

          {/* Rows */}
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm divide-y divide-slate-100">
            {comparisons.map((row, index) => (
              <div
                key={row.feature}
                className={`grid grid-cols-[1fr_1fr_1fr] gap-4 px-5 py-4 transition-colors hover:bg-slate-50/60 ${
                  index % 2 === 0 ? "" : "bg-slate-50/30"
                }`}
              >
                <div className="text-xs font-semibold text-slate-700 flex items-start">
                  {row.feature}
                </div>
                <div className="flex items-start gap-2">
                  <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-500 leading-relaxed">{row.manual}</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-700 leading-relaxed font-medium">{row.letterlock}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
