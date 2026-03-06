import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { SectionHeading } from "./atoms/section-heading";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Starter",
    price: "$49",
    period: "/month",
    description: "For small teams getting started with verifiable HR documents.",
    highlight: false,
    features: [
      "Up to 3 team members",
      "50 documents per month",
      "All 4 letter types",
      "QR verification on every PDF",
      "Public verification portal",
      "Company branding (logo, stamp, signature)",
      "Email delivery via company SMTP",
      "30-day audit log retention",
    ],
    cta: "Get Started",
    note: null,
  },
  {
    name: "Growth",
    price: "$149",
    period: "/month",
    description: "For growing teams that issue documents at volume.",
    highlight: true,
    features: [
      "Up to 15 team members",
      "500 documents per month",
      "All Starter features",
      "Approval workflow",
      "Document revocation",
      "Full audit log (unlimited retention)",
      "Verification event logs",
      "Priority email support",
    ],
    cta: "Start Free Trial",
    note: "14-day free trial included",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For organisations with high-volume issuance and compliance requirements.",
    highlight: false,
    features: [
      "Unlimited team members",
      "Unlimited documents",
      "All Growth features",
      "Custom onboarding & setup",
      "Dedicated account manager",
      "SLA & uptime guarantee",
      "API access",
      "SAML / SSO support",
    ],
    cta: "Contact Sales",
    note: "Custom pricing available",
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="bg-slate-50 py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Pricing"
          title="Simple, transparent pricing"
          description="Start small and scale. No hidden fees, no per-document charges on higher plans. Custom onboarding available on all plans."
        />

        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "rounded-2xl border p-8 flex flex-col transition-all duration-200",
                plan.highlight
                  ? "bg-slate-900 border-slate-800 shadow-2xl shadow-slate-900/20 scale-[1.02]"
                  : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-md"
              )}
            >
              {plan.highlight && (
                <div className="inline-flex items-center self-start bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-5">
                  Most Popular
                </div>
              )}

              <h3
                className={cn(
                  "text-lg font-bold mb-1",
                  plan.highlight ? "text-white" : "text-slate-900"
                )}
              >
                {plan.name}
              </h3>
              <p
                className={cn(
                  "text-sm mb-5 leading-relaxed",
                  plan.highlight ? "text-slate-400" : "text-slate-500"
                )}
              >
                {plan.description}
              </p>

              <div className="flex items-baseline gap-1 mb-6">
                <span
                  className={cn(
                    "text-4xl font-bold",
                    plan.highlight ? "text-white" : "text-slate-900"
                  )}
                >
                  {plan.price}
                </span>
                {plan.period && (
                  <span
                    className={cn(
                      "text-sm",
                      plan.highlight ? "text-slate-400" : "text-slate-500"
                    )}
                  >
                    {plan.period}
                  </span>
                )}
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <CheckCircle2
                      className={cn(
                        "w-4 h-4 shrink-0 mt-0.5",
                        plan.highlight ? "text-blue-400" : "text-blue-500"
                      )}
                    />
                    <span
                      className={cn(
                        "text-sm",
                        plan.highlight ? "text-slate-300" : "text-slate-600"
                      )}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                className={cn(
                  "w-full",
                  plan.highlight
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-slate-900 hover:bg-slate-800 text-white"
                )}
                asChild
              >
                <Link href="/dashboard">
                  {plan.cta}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>

              {plan.note && (
                <p
                  className={cn(
                    "text-xs text-center mt-3",
                    plan.highlight ? "text-slate-500" : "text-slate-400"
                  )}
                >
                  {plan.note}
                </p>
              )}
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-slate-500 mt-10">
          All plans include custom onboarding assistance. Need a custom plan?{" "}
          <a href="mailto:sales@letterlock.io" className="text-blue-600 hover:underline font-medium">
            Contact us
          </a>
          .
        </p>
      </div>
    </section>
  );
}
