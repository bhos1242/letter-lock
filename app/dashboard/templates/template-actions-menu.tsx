"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Archive, Globe } from "lucide-react";
import { publishTemplate, archiveTemplate } from "@/app/actions/templates";
import { useRouter } from "next/navigation";

export function TemplateActionsMenu({
  templateId,
  status,
}: {
  templateId: string;
  status: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handlePublish() {
    startTransition(async () => {
      const result = await publishTemplate(templateId);
      if (result.success) {
        toast.success("Template published");
        router.refresh();
      }
    });
  }

  function handleArchive() {
    startTransition(async () => {
      const result = await archiveTemplate(templateId);
      if (result.success) {
        toast.success("Template archived");
        router.refresh();
      }
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isPending}>
          <MoreHorizontal className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {status !== "PUBLISHED" && status !== "ARCHIVED" && (
          <DropdownMenuItem onClick={handlePublish}>
            <Globe className="h-4 w-4 mr-2" />
            Publish
          </DropdownMenuItem>
        )}
        {status !== "ARCHIVED" && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleArchive} className="text-muted-foreground">
              <Archive className="h-4 w-4 mr-2" />
              Archive
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
