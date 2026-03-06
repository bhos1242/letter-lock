import { Quote } from "lucide-react";
import { SectionHeading } from "./atoms/section-heading";

const testimonials = [
  {
    quote:
      "We used to spend 2–3 hours every week manually preparing offer letters in Google Docs. With LetterLock, we issue a verified, branded PDF in under two minutes. The QR verification feature has genuinely impressed our new hires.",
    name: "Priya Sharma",
    role: "Head of HR",
    company: "TechVentures Pvt Ltd",
    initials: "PS",
    color: "bg-blue-600",
  },
  {
    quote:
      "Our training institute issues hundreds of internship letters every quarter. Before LetterLock, we had no way to handle verification requests. Now companies scan the QR code on the letter and confirm authenticity in seconds.",
    name: "Ravi Menon",
    role: "Founder & Director",
    company: "ScaleUp Academy",
    initials: "RM",
    color: "bg-emerald-600",
  },
  {
    quote:
      "The audit trail alone is worth it. We can see exactly who issued what, when, and whether it's been revoked. When a dispute came up about an experience letter, we resolved it in minutes with the verification log.",
    name: "Deepa Krishnan",
    role: "Operations Lead",
    company: "StaffPro Solutions",
    initials: "DK",
    color: "bg-violet-600",
  },
];

export function TestimonialsSection() {
  return (
    <section className="bg-white py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="What teams say"
          title="Trusted by HR teams that care about credibility"
          description="From startups to training institutes, LetterLock has become the standard for verifiable HR document issuance."
        />

        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-7">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-slate-50 border border-slate-200 rounded-2xl p-7 flex flex-col hover:border-slate-300 hover:shadow-sm transition-all duration-200"
            >
              <Quote className="w-6 h-6 text-slate-300 mb-4 shrink-0" />
              <p className="text-sm text-slate-600 leading-relaxed flex-1 mb-6">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center shrink-0`}
                >
                  <span className="text-xs font-bold text-white">{t.initials}</span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">{t.name}</div>
                  <div className="text-xs text-slate-500">
                    {t.role}, {t.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
