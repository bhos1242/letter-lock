import { ShieldCheck, QrCode, Layers, RotateCcw, BookOpen, Zap } from "lucide-react";
import { SectionHeading } from "./atoms/section-heading";
import { BadgePill } from "./atoms/badge-pill";

const solutions = [
  {
    icon: Layers,
    title: "Branded templates in one place",
    desc: "Create reusable templates with your letterhead, logo, and signature. Issue every document consistently in minutes.",
  },
  {
    icon: Zap,
    title: "Generate a verified PDF instantly",
    desc: "Fill in recipient details, click issue — LetterLock generates a professional, tamper-evident PDF automatically.",
  },
  {
    icon: QrCode,
    title: "QR code + UVID on every letter",
    desc: "Every document gets a unique Verification ID and an embedded QR code linked to its public verification page.",
  },
  {
    icon: ShieldCheck,
    title: "Anyone can verify, no login needed",
    desc: "Recipients, employers, and background-check firms can verify any document on your public verification portal — for free, forever.",
  },
  {
    icon: RotateCcw,
    title: "Revoke documents when needed",
    desc: "Employee left on bad terms? Revoke the letter in one click. Verifiers instantly see the revocation status and reason.",
  },
  {
    icon: BookOpen,
    title: "Complete audit trail",
    desc: "Every issuance, approval, email, and verification event is logged. Full accountability, always.",
  },
];

export function SolutionSection() {
  return (
    <section className="bg-slate-50 py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Heading */}
          <div>
            <BadgePill variant="green">
              <ShieldCheck className="w-3 h-3" />
              The solution
            </BadgePill>
            <h2 className="mt-4 text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              Meet LetterLock.
              <br />
              <span className="text-blue-600">HR letters done right.</span>
            </h2>
            <p className="mt-4 text-lg text-slate-500 leading-relaxed">
              Replace scattered Google Docs workflows with a single, secure platform
              for issuing, delivering, and verifying official HR documents. Built for
              the teams that issue them and the people who receive them.
            </p>

            {/* Trust strip */}
            <div className="mt-8 flex flex-wrap gap-3">
              {["No editable files", "Publicly verifiable", "Revocable", "Auditable"].map(
                (tag) => (
                  <BadgePill key={tag} variant="green">
                    {tag}
                  </BadgePill>
                )
              )}
            </div>
          </div>

          {/* Right: Solution cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {solutions.map((solution) => (
              <div
                key={solution.title}
                className="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-200 hover:shadow-sm transition-all duration-200 group"
              >
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
                  <solution.icon className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mb-1.5">
                  {solution.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">{solution.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
