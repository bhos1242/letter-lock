import { AlertTriangle, FileEdit, Eye, Clock, FolderOpen, XCircle } from "lucide-react";
import { SectionHeading } from "./atoms/section-heading";

const problems = [
  {
    icon: FileEdit,
    title: "Built manually in Google Docs",
    desc: "Every letter is drafted from scratch. Inconsistent formatting. No templates. No standardisation.",
  },
  {
    icon: XCircle,
    title: "Anyone can edit the file",
    desc: "Shared as an editable Word or Google Doc — easily modified, no way to prove authenticity.",
  },
  {
    icon: Eye,
    title: "No verification possible",
    desc: "Recipients have no way to confirm if the document is real. Employers and background checkers just have to trust it.",
  },
  {
    icon: Clock,
    title: "Slow, manual ops",
    desc: "HR teams spend hours placing letterheads, stamps, and signatures manually in every single document.",
  },
  {
    icon: AlertTriangle,
    title: "No audit trail",
    desc: "Who issued it? When? Has it been revoked? No record exists. No accountability.",
  },
  {
    icon: FolderOpen,
    title: "Scattered across drives and emails",
    desc: "Documents live in shared folders, email threads, and personal drives with zero central visibility.",
  },
];

export function ProblemSection() {
  return (
    <section className="bg-white py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="The problem"
          title="The way HR documents work today is broken"
          description="Most companies still issue offer letters, experience letters, and internship letters the same way they did a decade ago. Manually, without verification, and with no accountability."
        />

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {problems.map((problem) => (
            <div
              key={problem.title}
              className="relative bg-red-50/50 border border-red-100 rounded-xl p-6 group"
            >
              <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <problem.icon className="w-4.5 h-4.5 text-red-500" />
              </div>
              <h3 className="text-sm font-semibold text-slate-800 mb-2">{problem.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{problem.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-base text-slate-500">
            The result?{" "}
            <span className="font-semibold text-slate-800">
              Forged letters. Disputed claims. Zero trust.
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
