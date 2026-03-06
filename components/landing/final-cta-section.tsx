import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck } from "lucide-react";

export function FinalCTASection() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden bg-slate-900">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-[linear-gradient(135deg,#0F172A_0%,#1e3a5f_50%,#0F172A_100%)]" />
      {/* Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:48px_48px]" />
      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
        <div className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-500/30 text-blue-300 text-xs font-semibold px-4 py-2 rounded-full mb-8">
          <ShieldCheck className="w-3.5 h-3.5" />
          Trusted document infrastructure for your team
        </div>

        <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-6">
          Ready to issue HR documents
          <br />
          <span className="text-blue-400">with confidence?</span>
        </h2>

        <p className="text-lg text-slate-300 leading-relaxed mb-10 max-w-2xl mx-auto">
          Stop sending editable letters that no one can verify. Start issuing tamper-evident,
          QR-verified documents your team and recipients can trust — forever.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-10 h-13 text-base shadow-lg shadow-blue-900/30"
            asChild
          >
            <Link href="/dashboard">
              Book a Demo
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-slate-600 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-500 h-13 text-base"
            asChild
          >
            <Link href="/verify">
              <ShieldCheck className="mr-2 w-4 h-4" />
              Try Verifying a Document
            </Link>
          </Button>
        </div>

        <p className="mt-8 text-sm text-slate-500">
          No credit card required for demo · Custom onboarding included · Cancel anytime
        </p>
      </div>
    </section>
  );
}
