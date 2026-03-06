"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  MoreHorizontal,
  Download,
  Mail,
  XCircle,
  ShieldCheck,
  ExternalLink,
  CheckCircle,
} from "lucide-react";
import { revokeDocument, resendDocumentEmail, approveDocument } from "@/app/actions/documents";

interface DocActionsProps {
  doc: {
    id: string;
    status: string;
    recipientEmail: string | null;
    uvid: string;
  };
}

export function DocumentActions({ doc }: DocActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showRevokeDialog, setShowRevokeDialog] = useState(false);
  const [revocationReason, setRevocationReason] = useState("");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const verifyUrl = `${appUrl}/verify/${doc.uvid}`;

  function copyVerifyLink() {
    navigator.clipboard.writeText(verifyUrl);
    toast.success("Verification link copied");
  }

  function handleRevoke() {
    if (!revocationReason.trim()) {
      toast.error("Please enter a revocation reason");
      return;
    }
    startTransition(async () => {
      const result = await revokeDocument(doc.id, revocationReason);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Document revoked");
      setShowRevokeDialog(false);
      router.refresh();
    });
  }

  function handleResend() {
    startTransition(async () => {
      const result = await resendDocumentEmail(doc.id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Email resent");
      router.refresh();
    });
  }

  function handleApprove() {
    startTransition(async () => {
      try {
        await approveDocument(doc.id);
        toast.success("Document approved and issued");
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to approve document");
      }
    });
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {doc.status === "PENDING_APPROVAL" && (
          <Button size="sm" onClick={handleApprove} disabled={isPending}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Approve & Issue
          </Button>
        )}

        {doc.status === "ISSUED" && (
          <Button variant="outline" size="sm" asChild>
            <a href={`/api/documents/${doc.id}/pdf`} download>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </a>
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={isPending}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={copyVerifyLink}>
              <ShieldCheck className="h-4 w-4 mr-2" />
              Copy Verify Link
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href={verifyUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Verification Page
              </a>
            </DropdownMenuItem>
            {doc.status === "ISSUED" && doc.recipientEmail && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleResend}>
                  <Mail className="h-4 w-4 mr-2" />
                  Resend Email
                </DropdownMenuItem>
              </>
            )}
            {doc.status === "ISSUED" && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => setShowRevokeDialog(true)}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Revoke Document
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={showRevokeDialog} onOpenChange={setShowRevokeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke Document</DialogTitle>
            <DialogDescription>
              Revoking a document makes it permanently invalid. It will still be verifiable but
              shown as REVOKED. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reason">Revocation Reason *</Label>
            <Textarea
              id="reason"
              placeholder="e.g. Offer withdrawn, employee no longer with company, etc."
              value={revocationReason}
              onChange={(e) => setRevocationReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRevokeDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRevoke}
              disabled={isPending || !revocationReason.trim()}
            >
              {isPending ? "Revoking..." : "Revoke Document"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
