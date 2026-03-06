import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  ShieldCheck,
  FileText,
  QrCode,
  Mail,
  Building2,
  Users,
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Template Management",
    description:
      "Create reusable HR letter templates with dynamic variable placeholders for rapid document generation.",
  },
  {
    icon: ShieldCheck,
    title: "Tamper-Evident Verification",
    description:
      "Every issued document gets a unique UVID and verification code — verifiable by anyone, anytime.",
  },
  {
    icon: QrCode,
    title: "QR Code Embedded",
    description:
      "PDFs include a QR code linking directly to the public verification page for instant authenticity checks.",
  },
  {
    icon: Mail,
    title: "Org SMTP Email",
    description:
      "Send letters directly from your company's email address using your own SMTP configuration.",
  },
  {
    icon: Building2,
    title: "Multi-Tenant",
    description:
      "Each organization has fully isolated data — templates, documents, branding, SMTP, and audit logs.",
  },
  {
    icon: Users,
    title: "Role-Based Access",
    description:
      "Owner, Admin, HR, Approver, and Viewer roles with granular permission controls.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col">
      <section className="container mx-auto flex flex-col items-center justify-center gap-6 pb-8 pt-16 md:pt-24 px-4">
        <Badge variant="secondary" className="px-4 py-1">
          Secure Letter Generation &amp; Verification Platform
        </Badge>
        <h1 className="text-center text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Issue Verifiable HR Letters
          <br />
          <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            With Confidence
          </span>
        </h1>
        <p className="max-w-2xl text-center text-lg text-muted-foreground">
          Generate professional offer letters, experience letters, internship letters, and
          more — with built-in QR verification, PDF generation, and org-branded email delivery.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button size="lg" asChild>
            <Link href="/dashboard">
              Open Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/verify">
              Verify a Document
              <ShieldCheck className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="container mx-auto py-16 md:py-24 px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold mb-2">Everything your HR team needs</h2>
          <p className="text-muted-foreground">
            A production-ready platform built for modern organizations.
          </p>
        </div>
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardHeader>
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 mb-2">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-base">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="container mx-auto pb-16 md:pb-24 px-4">
        <Card className="mx-auto max-w-3xl text-center">
          <CardHeader>
            <CardTitle className="text-2xl">
              Ready to get started?
            </CardTitle>
            <CardDescription className="text-base">
              Create your organization and issue your first verifiable document in minutes.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3 justify-center">
            <Button size="lg" asChild>
              <Link href="/dashboard">
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/verify">Verify a Document</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
