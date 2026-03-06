"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Lock, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Product", href: "#features" },
  { label: "How it Works", href: "#how-it-works" },
  { label: "Security", href: "#security" },
  { label: "Pricing", href: "#pricing" },
];

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm"
          : "bg-transparent"
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 font-bold text-xl">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4 text-white" />
            </div>
            <span className={cn("transition-colors", scrolled ? "text-slate-900" : "text-white")}>
              LetterLock
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:opacity-100",
                  scrolled
                    ? "text-slate-500 hover:text-slate-900"
                    : "text-slate-300 hover:text-white"
                )}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                scrolled ? "text-slate-600 hover:text-slate-900" : "text-slate-300 hover:text-white hover:bg-white/10"
              )}
              asChild
            >
              <Link href="/verify">Verify Document</Link>
            </Button>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              asChild
            >
              <Link href="/dashboard">Book a Demo</Link>
            </Button>
          </div>

          {/* Mobile toggle */}
          <button
            className={cn(
              "md:hidden p-2 rounded-md transition-colors",
              scrolled ? "text-slate-600" : "text-white"
            )}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-1">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="block text-sm font-medium text-slate-600 py-2.5 hover:text-slate-900"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="pt-3 space-y-2 border-t border-slate-100 mt-2">
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link href="/verify">Verify Document</Link>
            </Button>
            <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white" asChild>
              <Link href="/dashboard">Book a Demo</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
