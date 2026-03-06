import { SectionHeading } from "./atoms/section-heading";
import { Palette, ClipboardList, Send, Inbox, ShieldCheck } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Palette,
    title: "Set up your branding",
    desc: "Upload your company logo, letterhead, stamp, and authorised signature. Configure your SMTP for email delivery. Done once, applied to every document automatically.",
  },
  {
    number: "02",
    icon: ClipboardList,
    title: "Create your templates",
    desc: "Design letter templates using the rich-text editor with dynamic {{variable}} placeholders — for job title, candidate name, salary, joining date, and more.",
  },
  {
    number: "03",
    icon: Send,
    title: "Issue the document",
    desc: "Fill in recipient details and variable values. LetterLock generates a signed, branded PDF — complete with a QR code and unique Verification ID — and emails it directly.",
  },
  {
    number: "04",
    icon: Inbox,
    title: "Recipient gets an official letter",
    desc: "The recipient receives a professional, PDF-attached email from your company domain. The letter includes the verification code and QR code on every page footer.",
  },
  {
    number: "05",
    icon: ShieldCheck,
    title: "Anyone can verify authenticity",
    desc: "Scan the QR code or visit the verification portal, enter the code — instantly see whether the document is valid, revoked, or superseded. No account needed.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-slate-900 py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="How it works"
          title="From setup to verified letter in minutes"
          description="A simple, repeatable workflow for your entire HR team. No training required."
          light
        />

        <div className="mt-14 relative">
          {/* Connector line */}
          <div className="hidden lg:block absolute top-8 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
            {steps.map((step, index) => (
              <div key={step.number} className="relative flex flex-col">
                {/* Step header */}
                <div className="flex lg:flex-col items-center lg:items-start gap-4 mb-4">
                  <div className="relative shrink-0">
                    <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                      <step.icon className="w-7 h-7 text-blue-400" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-white">{index + 1}</span>
                    </div>
                  </div>
                  <div className="lg:mt-4">
                    <div className="text-xs font-mono text-slate-600 mb-1">{step.number}</div>
                    <h3 className="text-sm font-semibold text-white">{step.title}</h3>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed lg:pl-0 pl-20">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
