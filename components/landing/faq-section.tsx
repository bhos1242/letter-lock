"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { SectionHeading } from "./atoms/section-heading";

const faqs = [
  {
    q: "Is LetterLock a full HRMS?",
    a: "No. LetterLock is a focused platform for one specific job: issuing and verifying official HR documents. It does not manage payroll, attendance, leave, or employee profiles. It integrates with your existing HR workflows — think of it as your document trust layer.",
  },
  {
    q: "Can recipients verify documents without logging in?",
    a: "Yes. The public verification portal at letterlock.io/verify requires no account or login. Anyone — an employer, a university, a background-check firm — can verify a document's authenticity simply by entering the verification code or scanning the QR code on the letter.",
  },
  {
    q: "Can we use our own email domain to send letters?",
    a: "Yes. LetterLock supports per-organisation SMTP configuration. You provide your SMTP server credentials (encrypted at rest with AES-256-GCM), and all letters are sent from your company email address — not a LetterLock address.",
  },
  {
    q: "Can a document be revoked after it has been issued?",
    a: "Yes. Any authorised team member (with the Approver role or above) can revoke a document and provide a reason. The public verification page instantly reflects the revoked status and the revocation reason. This is useful for correcting errors or handling departures.",
  },
  {
    q: "What types of letters can be issued?",
    a: "LetterLock currently supports four letter types: Offer Letter, Internship Letter, Experience Letter, and Recommendation Letter. Each type has its own template format and supported variable set. Custom types can be discussed for Enterprise plans.",
  },
  {
    q: "Is LetterLock suitable for startups and training institutes?",
    a: "Absolutely. LetterLock is specifically designed for organisations that issue HR documents at any volume — from a startup that hires a few people a year to a training institute that issues thousands of internship letters per quarter.",
  },
  {
    q: "Can we upload our own letterhead, signature, and stamp?",
    a: "Yes. The branding setup allows you to upload your company letterhead (a background image), an authorised signature, and a company stamp. These are applied automatically to every generated document without manual placement.",
  },
  {
    q: "Does verification expose the full document publicly?",
    a: "No. The public verification portal shows only the document type, issuing organisation name, recipient name, issue date, and current status (valid, revoked, superseded). The full document content and sensitive variable data are not exposed publicly.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="bg-white py-20 lg:py-28">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="FAQ"
          title="Common questions"
          description="Everything you need to know before getting started."
        />

        <div className="mt-12 space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={faq.q}
              className={cn(
                "border rounded-xl overflow-hidden transition-all duration-200",
                openIndex === index
                  ? "border-blue-200 shadow-sm"
                  : "border-slate-200 hover:border-slate-300"
              )}
            >
              <button
                className="w-full flex items-start justify-between gap-4 px-6 py-5 text-left"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="text-sm font-semibold text-slate-900 leading-snug">
                  {faq.q}
                </span>
                <ChevronDown
                  className={cn(
                    "w-5 h-5 text-slate-400 shrink-0 mt-0.5 transition-transform duration-200",
                    openIndex === index && "rotate-180 text-blue-500"
                  )}
                />
              </button>

              {openIndex === index && (
                <div className="px-6 pb-5">
                  <p className="text-sm text-slate-500 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
