import { ShieldCheck, XCircle, AlertCircle, QrCode, Hash, ExternalLink } from "lucide-react";
import { SectionHeading } from "./atoms/section-heading";

const verificationStates = [
  {
    status: "VERIFIED",
    label: "Document Verified",
    color: "emerald",
    icon: ShieldCheck,
    bgClass: "bg-emerald-50 border-emerald-200",
    iconBgClass: "bg-emerald-100",
    iconColor: "text-emerald-600",
    statusBg: "bg-emerald-100 text-emerald-800",
    dotColor: "bg-emerald-500",
    fields: [
      { label: "Document Type", value: "Offer Letter" },
      { label: "Issued To", value: "Arjun Patel" },
      { label: "Issued By", value: "Acme Corporation" },
      { label: "Issued On", value: "18 Dec 2024" },
      { label: "Document ID", value: "OL-2024-000142" },
    ],
    note: "This document is authentic and has not been tampered with.",
  },
  {
    status: "REVOKED",
    label: "Document Revoked",
    color: "red",
    icon: XCircle,
    bgClass: "bg-red-50 border-red-200",
    iconBgClass: "bg-red-100",
    iconColor: "text-red-600",
    statusBg: "bg-red-100 text-red-800",
    dotColor: "bg-red-500",
    fields: [
      { label: "Document Type", value: "Experience Letter" },
      { label: "Issued To", value: "Sneha Mehta" },
      { label: "Issued By", value: "TechVentures Pvt Ltd" },
      { label: "Revoked On", value: "03 Jan 2025" },
      { label: "Reason", value: "Employee records updated" },
    ],
    note: "This document has been officially revoked by the issuing organisation.",
  },
  {
    status: "SUPERSEDED",
    label: "Document Superseded",
    color: "amber",
    icon: AlertCircle,
    bgClass: "bg-amber-50 border-amber-200",
    iconBgClass: "bg-amber-100",
    iconColor: "text-amber-600",
    statusBg: "bg-amber-100 text-amber-800",
    dotColor: "bg-amber-500",
    fields: [
      { label: "Document Type", value: "Internship Letter" },
      { label: "Issued To", value: "Rohan Gupta" },
      { label: "Issued By", value: "ScaleUp Academy" },
      { label: "Original Date", value: "10 Nov 2024" },
      { label: "Status", value: "Replaced by newer version" },
    ],
    note: "A newer version of this document exists. The superseding document is the authoritative record.",
  },
];

export function VerificationShowcase() {
  return (
    <section className="bg-white py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Verification"
          title="Trust that anyone can check, instantly"
          description="Every LetterLock document carries a unique Verification ID and QR code. Scan or enter the code — the result is immediate, permanent, and publicly accessible."
        />

        {/* How verification works */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5 mb-14">
          <div className="flex flex-col items-center text-center p-6 bg-slate-50 rounded-xl border border-slate-200">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <QrCode className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 mb-2">Scan QR Code</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every PDF includes an embedded QR code in the footer. Scan it with any phone to reach the verification page instantly.
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-6 bg-slate-50 rounded-xl border border-slate-200">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <Hash className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 mb-2">Enter Verification Code</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Enter the 8-character verification code printed on the letter at letterlock.io/verify. No account or login required.
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-6 bg-slate-50 rounded-xl border border-slate-200">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <ExternalLink className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 mb-2">Instant Public Result</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              The verification page shows the document's current status — valid, revoked, or superseded — with issuing organisation details.
            </p>
          </div>
        </div>

        {/* Verification state cards */}
        <h3 className="text-center text-sm font-semibold text-slate-500 uppercase tracking-wider mb-8">
          What verifiers see
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {verificationStates.map((state) => (
            <div
              key={state.status}
              className={`rounded-2xl border-2 p-6 ${state.bgClass}`}
            >
              {/* Status header */}
              <div className="flex items-center justify-between mb-5">
                <div className={`w-10 h-10 ${state.iconBgClass} rounded-xl flex items-center justify-center`}>
                  <state.icon className={`w-5 h-5 ${state.iconColor}`} />
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${state.statusBg}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${state.dotColor}`} />
                  {state.status}
                </span>
              </div>

              <h4 className="text-base font-bold text-slate-900 mb-4">{state.label}</h4>

              {/* Fields */}
              <div className="space-y-2.5 mb-4">
                {state.fields.map((field) => (
                  <div key={field.label} className="flex items-start justify-between gap-2">
                    <span className="text-xs text-slate-500 shrink-0">{field.label}</span>
                    <span className="text-xs font-medium text-slate-900 text-right">{field.value}</span>
                  </div>
                ))}
              </div>

              {/* Note */}
              <p className="text-xs text-slate-500 italic border-t border-slate-200/60 pt-4">
                {state.note}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
