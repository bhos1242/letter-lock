import { FileText, GraduationCap, Briefcase, Star } from "lucide-react";
import { SectionHeading } from "./atoms/section-heading";

const useCases = [
  {
    icon: FileText,
    type: "OFFER_LETTER",
    title: "Offer Letters",
    color: "blue",
    bgClass: "bg-blue-50",
    iconBgClass: "bg-blue-100",
    iconColor: "text-blue-600",
    borderClass: "border-blue-100",
    variables: ["Candidate name", "Job title", "Department", "Salary", "Joining date", "Manager name"],
    desc: "Issue formal offers with your branding. Candidates can verify authenticity before accepting.",
  },
  {
    icon: GraduationCap,
    type: "INTERNSHIP_LETTER",
    title: "Internship Letters",
    color: "violet",
    bgClass: "bg-violet-50",
    iconBgClass: "bg-violet-100",
    iconColor: "text-violet-600",
    borderClass: "border-violet-100",
    variables: ["Intern name", "Project / role", "Duration", "Stipend", "Supervisor name", "Completion date"],
    desc: "Generate verifiable internship letters students can share with employers and universities.",
  },
  {
    icon: Briefcase,
    type: "EXPERIENCE_LETTER",
    title: "Experience Letters",
    color: "emerald",
    bgClass: "bg-emerald-50",
    iconBgClass: "bg-emerald-100",
    iconColor: "text-emerald-600",
    borderClass: "border-emerald-100",
    variables: ["Employee name", "Designation", "Department", "Tenure", "Last date", "Performance note"],
    desc: "Issue authenticated experience letters that background-check firms can verify on the spot.",
  },
  {
    icon: Star,
    type: "RECOMMENDATION_LETTER",
    title: "Recommendation Letters",
    color: "amber",
    bgClass: "bg-amber-50",
    iconBgClass: "bg-amber-100",
    iconColor: "text-amber-600",
    borderClass: "border-amber-100",
    variables: ["Candidate name", "Recommender name", "Relationship", "Duration known", "Key strengths", "Purpose"],
    desc: "Personalised recommendation letters with verifiable authenticity — for jobs, admissions, or awards.",
  },
];

export function UseCasesSection() {
  return (
    <section className="bg-white py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Use Cases"
          title="Four document types, one platform"
          description="LetterLock supports all common HR and official letter formats. Each type has a dedicated template type with relevant variable support."
        />

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {useCases.map((uc) => (
            <div
              key={uc.type}
              className={`rounded-2xl border-2 ${uc.borderClass} ${uc.bgClass} p-6 hover:shadow-sm transition-all duration-200`}
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className={`w-11 h-11 ${uc.iconBgClass} rounded-xl flex items-center justify-center shrink-0`}>
                  <uc.icon className={`w-5 h-5 ${uc.iconColor}`} />
                </div>
                <span className={`text-[10px] font-mono font-semibold px-2.5 py-1 rounded-md ${uc.iconBgClass} ${uc.iconColor}`}>
                  {uc.type}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-2">{uc.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">{uc.desc}</p>

              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Supported variables
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {uc.variables.map((v) => (
                    <span
                      key={v}
                      className="text-[11px] font-mono bg-white/80 text-slate-600 px-2 py-0.5 rounded border border-slate-200"
                    >
                      {"{{"}{v.toLowerCase().replace(/ /g, "_")}{"}}"}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
