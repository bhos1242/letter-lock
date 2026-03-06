"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Search, ArrowRight } from "lucide-react";

export default function VerifyPage() {
  const router = useRouter();
  const [uvid, setUvid] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = uvid.trim();
    if (!cleaned) return;
    startTransition(() => {
      router.push(`/verify/${encodeURIComponent(cleaned)}`);
    });
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-lg">
        <div className="flex flex-col items-center mb-8 gap-3">
          <div className="rounded-full bg-primary/10 p-4">
            <ShieldCheck className="h-10 w-10 text-primary" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold">Document Verification</h1>
            <p className="text-muted-foreground mt-2 text-base">
              Verify the authenticity of any letter issued through this platform.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Enter Verification ID</CardTitle>
            <CardDescription>
              Paste the UVID (Unique Verification ID) found in the document footer or scan the QR code.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="uvid">Verification ID (UVID)</Label>
                <Input
                  id="uvid"
                  placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                  value={uvid}
                  onChange={(e) => setUvid(e.target.value)}
                  className="font-mono"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={!uvid.trim() || isPending}
              >
                <Search className="h-4 w-4 mr-2" />
                Verify Document
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            The UVID is printed in the footer of every issued document.
            <br />
            You can also scan the QR code on the document directly.
          </p>
        </div>
      </div>
    </div>
  );
}
