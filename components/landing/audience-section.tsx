import { Building2, Users, GraduationCap, Briefcase, Globe, UserCheck } from "lucide-react";
import { SectionHeading } from "./atoms/section-heading";

const audiences = [
  {
    icon: Building2,
    label: "Startups",
    desc: "Move fast without sacrificing document integrity. Issue verified letters from day one.",
  },
  {
    icon: Briefcase,
    label: "SMBs",
    desc: "Professionalise your HR operations with minimal overhead and maximum credibility.",
  },
  {
    icon: Users,
    label: "Staffing Agencies",
    desc: "Issue verified placement letters at scale for every candidate you place.",
  },
  {
    icon: GraduationCap,
    label: "Training Institutes",
    desc: "Issue credible internship completion and training letters students can prove are real.",
  },
  {
    icon: Globe,
    label: "Placement Cells",
    desc: "Help students prove the authenticity of offer letters from campus placements.",
  },
  {
    icon: UserCheck,
    label: "HR Teams",
    desc: "Centralised issuance, tracking, revocation, and a clean audit trail — all in one place.",
  },
];

export function AudienceSection() {
  return (
    <section className="bg-slate-50 py-20 lg:py-28 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Who it's for"
          title="Built for teams that issue trusted documents"
          description="Whether you're a 10-person startup or a 500-seat placement cell, LetterLock gives you the infrastructure to issue HR documents with confidence."
        />

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {audiences.map((audience) => (
            <div
              key={audience.label}
              className="bg-white rounded-xl border border-slate-200 p-6 hover:border-blue-200 hover:shadow-sm transition-all duration-200 group"
            >
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                <audience.icon className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">{audience.label}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{audience.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
