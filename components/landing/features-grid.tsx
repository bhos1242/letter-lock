import {
  FileText,
  QrCode,
  Globe,
  Hash,
  Stamp,
  BookOpen,
  RotateCcw,
  Mail,
  Building2,
  GitBranch,
  FileOutput,
  Clock,
} from "lucide-react";
import { SectionHeading } from "./atoms/section-heading";

const features = [
  {
    icon: FileText,
    title: "Branded Letter Templates",
    desc: "Create reusable templates with TipTap rich-text editor and dynamic {{variable}} placeholders.",
  },
  {
    icon: QrCode,
    title: "QR Code on Every PDF",
    desc: "Each issued document includes an embedded QR code linking directly to its verification page.",
  },
  {
    icon: Globe,
    title: "Public Verification Portal",
    desc: "A clean, public-facing page where anyone can verify a document's authenticity — no login required.",
  },
  {
    icon: Hash,
    title: "Unique Verification ID",
    desc: "Every document gets a human-readable ID (e.g. OL-2024-000142) and an 8-character verification code.",
  },
  {
    icon: Stamp,
    title: "Digital Stamp & Signature",
    desc: "Upload your company stamp and authorised signature. LetterLock places them automatically in every PDF.",
  },
  {
    icon: BookOpen,
    title: "Complete Audit Logs",
    desc: "Every action — issuance, approval, revocation, email, verification — is logged with actor and timestamp.",
  },
  {
    icon: RotateCcw,
    title: "Document Revocation",
    desc: "Revoke any issued document with a reason. The public verification page instantly reflects the status.",
  },
  {
    icon: Mail,
    title: "Company SMTP Delivery",
    desc: "Send letters from your own email domain using your SMTP credentials — encrypted and stored securely.",
  },
  {
    icon: Building2,
    title: "Multi-Tenant Orgs",
    desc: "Each company gets a fully isolated workspace — separate templates, documents, branding, and logs.",
  },
  {
    icon: GitBranch,
    title: "Approval Workflow",
    desc: "Mark templates as requiring approval. HR drafts, approvers review and release — tracked throughout.",
  },
  {
    icon: FileOutput,
    title: "Professional PDF Generation",
    desc: "Server-side PDF rendering with letterhead, body content, signature, stamp, and verification footer.",
  },
  {
    icon: Clock,
    title: "Issuance History",
    desc: "Track every document ever issued. Filter by status, type, and recipient. Full lifecycle visibility.",
  },
];

export function FeaturesGrid() {
  return (
    <section id="features" className="bg-white py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Features"
          title="Everything you need to issue trusted documents"
          description="LetterLock is purpose-built for one job: making HR document issuance and verification simple, secure, and reliable."
        />

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group bg-slate-50 border border-slate-200 rounded-xl p-5 hover:bg-white hover:border-blue-200 hover:shadow-md transition-all duration-200 cursor-default"
            >
              <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors duration-200">
                <feature.icon className="w-4 h-4 text-blue-600 group-hover:text-white transition-colors duration-200" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 mb-1.5">{feature.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
