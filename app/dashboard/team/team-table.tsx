"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoreHorizontal, UserMinus } from "lucide-react";
import { changeMemberRole, removeMember } from "@/app/actions/org";
import { useOrg } from "@/components/org-provider";
import { MemberRole } from "@/lib/generated/prisma/client";

type Member = {
  id: string;
  role: MemberRole;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
};

const ROLE_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  OWNER: "default",
  ADMIN: "secondary",
  HR: "outline",
  APPROVER: "outline",
  VIEWER: "outline",
};

export function TeamTable({ members }: { members: Member[] }) {
  const router = useRouter();
  const org = useOrg();
  const [isPending, startTransition] = useTransition();

  function handleRoleChange(memberId: string, newRole: MemberRole) {
    startTransition(async () => {
      const result = await changeMemberRole(memberId, newRole);
      if (result.success) {
        toast.success("Role updated");
        router.refresh();
      }
    });
  }

  function handleRemove(memberId: string) {
    startTransition(async () => {
      const result = await removeMember(memberId);
      if (result.success) {
        toast.success("Member removed");
        router.refresh();
      }
    });
  }

  const canManage = org.role === "OWNER" || org.role === "ADMIN";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Members</CardTitle>
        <CardDescription>{members.length} member{members.length !== 1 ? "s" : ""}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              {canManage && <TableHead className="w-[60px]"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((m) => (
              <TableRow key={m.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={m.user.image ?? ""} />
                      <AvatarFallback>
                        {m.user.name?.slice(0, 2).toUpperCase() ?? "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{m.user.name ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">{m.user.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={ROLE_VARIANT[m.role] ?? "outline"} className="text-xs">
                    {m.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(m.createdAt).toLocaleDateString()}
                </TableCell>
                {canManage && (
                  <TableCell>
                    {m.role !== "OWNER" && m.user.id !== org.memberships.find(mb => mb.organizationId === org.orgId)?.organizationId && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isPending}>
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {(["ADMIN", "HR", "APPROVER", "VIEWER"] as MemberRole[])
                            .filter((r) => r !== m.role)
                            .map((r) => (
                              <DropdownMenuItem key={r} onClick={() => handleRoleChange(m.id, r)}>
                                Change to {r}
                              </DropdownMenuItem>
                            ))}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleRemove(m.id)}
                          >
                            <UserMinus className="h-4 w-4 mr-2" />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
