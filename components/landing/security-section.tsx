import {
  Lock,
  ShieldCheck,
  Eye,
  Users,
  FileSearch,
  Database,
} from "lucide-react";
import { SectionHeading } from "./atoms/section-heading";

const pillars = [
  {
    icon: ShieldCheck,
    title: "Tamper-Evident Documents",
    desc: "A SHA-256 hash of every generated PDF is stored at issuance. Any modification to the file will produce a hash mismatch — detectable instantly.",
  },
  {
    icon: Database,
    title: "Tenant-Isolated Data",
    desc: "Every organisation operates in a fully isolated data context. Your documents, templates, and logs are never accessible to other tenants.",
  },
  {
    icon: FileSearch,
    title: "Immutable Audit Trail",
    desc: "Every action — document issuance, approval, revocation, email sent, verification attempt — is permanently logged with actor, timestamp, and target.",
  },
  {
    icon: Users,
    title: "Role-Based Access Control",
    desc: "Five permission levels (Owner, Admin, HR, Approver, Viewer) ensure staff only access what they need. Approvals and revocations require elevated roles.",
  },
  {
    icon: Lock,
    title: "Encrypted Credentials at Rest",
    desc: "SMTP passwords and sensitive credentials are encrypted with AES-256-GCM before storage. Never stored or logged in plaintext.",
  },
  {
    icon: Eye,
    title: "Controlled Public Exposure",
    desc: "The public verification portal shows only what's necessary to confirm authenticity — no full document content, no personal data beyond what's required.",
  },
];

export function SecuritySection() {
  return (
    <section id="security" className="bg-slate-900 py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Security & Trust"
          title="Secure by design. Auditable by default."
          description="LetterLock is built with a security-first architecture. Every document is tamper-evident, every action is logged, and every credential is protected."
          light
        />

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pillars.map((pillar) => (
            <div
              key={pillar.title}
              className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800 hover:border-slate-600 transition-all duration-200 group"
            >
              <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600/30 transition-colors">
                <pillar.icon className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">{pillar.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{pillar.desc}</p>
            </div>
          ))}
        </div>

        {/* Trust statement */}
        <div className="mt-12 text-center">
          <p className="text-slate-400 text-sm max-w-2xl mx-auto">
            LetterLock does not claim to be unhackable. We claim to be{" "}
            <span className="text-white font-medium">
              tamper-evident, verifiable, auditable, and secure by design
            </span>{" "}
            — giving your organisation and your document recipients a foundation of provable trust.
          </p>
        </div>
      </div>
    </section>
  );
}
