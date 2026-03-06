import { SectionHeading } from "./atoms/section-heading";
import { FileText, Plus, Search, ShieldCheck, CheckCircle2 } from "lucide-react";

export function ProductPreviewSection() {
  return (
    <section className="bg-slate-50 py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Product Preview"
          title="Clean, focused, built for HR teams"
          description="No bloat. No steep learning curve. LetterLock does one thing — and does it well."
        />

        <div className="mt-14 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Preview 1: Documents dashboard */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-semibold text-slate-700">Documents</span>
              </div>
              <button className="flex items-center gap-1 text-xs text-blue-600 font-medium bg-blue-50 px-2.5 py-1 rounded-md">
                <Plus className="w-3 h-3" />
                Issue New
              </button>
            </div>
            <div className="p-4 space-y-1">
              {[
                { id: "OL-2024-000142", name: "Arjun Patel", type: "Offer Letter", status: "ISSUED", color: "emerald" },
                { id: "EL-2024-000141", name: "Sneha Mehta", type: "Experience Letter", status: "ISSUED", color: "emerald" },
                { id: "IL-2024-000140", name: "Rohan Gupta", type: "Internship Letter", status: "PENDING", color: "amber" },
                { id: "RL-2024-000139", name: "Meena Iyer", type: "Recommendation", status: "DRAFT", color: "slate" },
                { id: "OL-2024-000138", name: "Kiran Shah", type: "Offer Letter", status: "REVOKED", color: "red" },
              ].map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors group cursor-default"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-800 truncate">{doc.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{doc.id}</div>
                  </div>
                  <span
                    className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      doc.color === "emerald"
                        ? "bg-emerald-100 text-emerald-700"
                        : doc.color === "amber"
                        ? "bg-amber-100 text-amber-700"
                        : doc.color === "red"
                        ? "bg-red-100 text-red-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {doc.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Preview 2: Issue document form */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="bg-slate-50 border-b border-slate-200 px-5 py-3">
              <span className="text-sm font-semibold text-slate-700">Issue Document</span>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Template</label>
                <div className="w-full h-8 bg-slate-50 border border-slate-200 rounded-md px-3 flex items-center">
                  <span className="text-xs text-slate-600">Standard Offer Letter</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Recipient Name</label>
                <div className="w-full h-8 bg-slate-50 border border-slate-200 rounded-md px-3 flex items-center">
                  <span className="text-xs text-slate-400">Arjun Patel</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Job Title</label>
                  <div className="w-full h-8 bg-slate-50 border border-slate-200 rounded-md px-3 flex items-center">
                    <span className="text-xs text-slate-400">Software Engineer</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Salary</label>
                  <div className="w-full h-8 bg-slate-50 border border-slate-200 rounded-md px-3 flex items-center">
                    <span className="text-xs text-slate-400">₹18,00,000 p.a.</span>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Joining Date</label>
                <div className="w-full h-8 bg-slate-50 border border-slate-200 rounded-md px-3 flex items-center">
                  <span className="text-xs text-slate-400">01 January 2025</span>
                </div>
              </div>
              <div className="flex items-center gap-2 py-1">
                <div className="w-4 h-4 rounded bg-blue-600 flex items-center justify-center">
                  <CheckCircle2 className="w-3 h-3 text-white" />
                </div>
                <span className="text-xs text-slate-600">Send via company email</span>
              </div>
              <button className="w-full h-9 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors">
                Issue Document
              </button>
            </div>
          </div>

          {/* Preview 3: Public verification result */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-mono text-slate-500">letterlock.io/verify/…</span>
            </div>
            <div className="p-5">
              {/* Verified banner */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3 mb-5">
                <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <div className="text-sm font-bold text-emerald-900">Document Verified</div>
                  <div className="text-xs text-emerald-700 mt-0.5">
                    This document is authentic and unmodified.
                  </div>
                </div>
              </div>

              {/* Document info */}
              <div className="space-y-3 mb-5">
                {[
                  { label: "Document Type", value: "Offer Letter" },
                  { label: "Issued To", value: "Arjun Patel" },
                  { label: "Issued By", value: "Acme Corporation" },
                  { label: "Issued On", value: "18 Dec 2024" },
                  { label: "Reference ID", value: "OL-2024-000142" },
                ].map((field) => (
                  <div key={field.label} className="flex justify-between text-xs">
                    <span className="text-slate-500">{field.label}</span>
                    <span className="font-medium text-slate-900">{field.value}</span>
                  </div>
                ))}
              </div>

              {/* Org badge */}
              <div className="flex items-center gap-3 bg-slate-50 rounded-lg px-3 py-2.5 border border-slate-200">
                <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">AC</span>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-800">Acme Corporation</div>
                  <div className="text-[11px] text-slate-500">Verified issuer · LetterLock</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
