import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  QrCode,
  FileText,
  Stamp,
} from "lucide-react";
import { BadgePill } from "./atoms/badge-pill";

export function HeroSection() {
  return (
    <section className="bg-slate-900 pt-28 pb-20 lg:pt-36 lg:pb-28 overflow-hidden relative">
      {/* Subtle grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:48px_48px]" />
      {/* Blue glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Copy */}
          <div>
            <BadgePill variant="blue">
              <ShieldCheck className="w-3 h-3" />
              Tamper-Evident HR Documents
            </BadgePill>

            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-white leading-[1.1] tracking-tight">
              Issue HR letters
              <br />
              <span className="text-blue-400">anyone can verify.</span>
            </h1>

            <p className="mt-6 text-lg text-slate-300 leading-relaxed max-w-lg">
              LetterLock helps companies generate official offer letters, internship
              letters, experience letters, and recommendation letters — branded,
              verified, and audit-ready from day one.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-12 text-base shadow-lg shadow-blue-900/30"
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
                className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-600 h-12 text-base"
                asChild
              >
                <Link href="/verify">Verify a Document</Link>
              </Button>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3">
              {[
                "QR Code on every PDF",
                "Audit logs included",
                "Revocation support",
                "Company branding",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-slate-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Right: Document mock UI */}
          <div className="relative hidden lg:flex justify-end">
            <div className="relative w-full max-w-md">
              {/* Main document card */}
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200/20">
                {/* Top bar */}
                <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">AC</span>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-800">Acme Corporation</div>
                      <div className="text-[11px] text-slate-500">hr@acmecorp.com</div>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-[11px] font-semibold px-2.5 py-1 rounded-full border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    ISSUED
                  </span>
                </div>

                {/* Document body */}
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-semibold text-slate-800">Offer Letter</span>
                      </div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">OL-2024-000142</div>
                    </div>
                    <div className="text-xs text-slate-500">Dec 18, 2024</div>
                  </div>

                  {/* Letterhead mock */}
                  <div className="bg-slate-50 rounded-xl p-4 mb-4 border border-slate-100">
                    <div className="mb-3">
                      <div className="h-2 rounded bg-slate-200 w-3/4 mb-1.5" />
                      <div className="h-1.5 rounded bg-slate-200 w-1/2" />
                    </div>
                    <div className="space-y-1.5">
                      <div className="h-1.5 rounded bg-slate-200 w-full" />
                      <div className="h-1.5 rounded bg-slate-200 w-11/12" />
                      <div className="h-1.5 rounded bg-slate-200 w-4/5" />
                    </div>
                    <div className="mt-3 space-y-1.5">
                      <div className="h-1.5 rounded bg-slate-200 w-full" />
                      <div className="h-1.5 rounded bg-slate-200 w-2/3" />
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-slate-200 rounded" />
                        <div>
                          <div className="h-1.5 rounded bg-slate-200 w-16 mb-1" />
                          <div className="h-1 rounded bg-slate-200 w-12" />
                        </div>
                      </div>
                      <div className="w-8 h-8 bg-slate-200 rounded opacity-60">
                        <Stamp className="w-4 h-4 text-slate-400 m-2" />
                      </div>
                    </div>
                  </div>

                  {/* Verification footer */}
                  <div className="flex items-center justify-between bg-slate-900 rounded-xl p-3.5">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Verification Code</div>
                      <div className="font-mono text-sm font-bold text-white tracking-[0.15em]">X7K2-P9NM</div>
                      <div className="text-[10px] text-slate-500 mt-1 font-mono">letterlock.io/verify/uvid-…</div>
                    </div>
                    <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center">
                      <QrCode className="w-10 h-10 text-slate-900" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Verified badge */}
              <div className="absolute -top-3 -right-3 bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Document Verified
              </div>

              {/* Stats card */}
              <div className="absolute -bottom-5 -left-6 bg-white rounded-xl shadow-xl border border-slate-100 p-4">
                <div className="text-[11px] text-slate-500 mb-1">Documents Issued</div>
                <div className="text-2xl font-bold text-slate-900">2,847</div>
                <div className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                  <span>↑</span> 12% this month
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
