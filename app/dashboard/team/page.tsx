import { getOrgMembers } from "@/app/actions/org";
import { TeamTable } from "./team-table";
import { InviteMemberDialog } from "./invite-member-dialog";

export default async function TeamPage() {
  const members = await getOrgMembers();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Team</h1>
          <p className="text-muted-foreground text-sm">
            Manage organization members and their roles.
          </p>
        </div>
        <InviteMemberDialog />
      </div>
      <TeamTable members={members} />
    </div>
  );
}
