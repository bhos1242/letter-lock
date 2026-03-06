"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  ScrollText,
  Palette,
  Mail,
  Users,
  ClipboardList,
  ShieldCheck,
  Settings,
  Building2,
  LogOut,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession, signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationBellButton } from "@/components/notification-bell-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useOrg } from "@/components/org-provider";

const sidebarItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Templates", href: "/dashboard/templates", icon: FileText },
  { title: "Documents", href: "/dashboard/documents", icon: ScrollText },
  { title: "Branding", href: "/dashboard/branding", icon: Palette },
  { title: "SMTP Settings", href: "/dashboard/smtp", icon: Mail },
  { title: "Team", href: "/dashboard/team", icon: Users },
  { title: "Audit Logs", href: "/dashboard/audit-logs", icon: ClipboardList },
  { title: "Verifications", href: "/dashboard/verification-logs", icon: ShieldCheck },
  { title: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function DashboardSidebar({
  className,
  onLinkClick,
}: {
  className?: string;
  onLinkClick?: () => void;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const org = useOrg();

  return (
    <div className={cn("flex h-full w-64 flex-col bg-background border-r", className)}>
      <div className="flex h-16 items-center justify-between border-b px-4 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Building2 className="h-5 w-5 shrink-0 text-primary" />
          <span className="font-semibold text-sm truncate">{org.orgName}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Badge variant="outline" className="text-xs px-1.5 py-0">
            {org.role}
          </Badge>
          <NotificationBellButton />
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 p-3 overflow-y-auto">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onLinkClick}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.title}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start px-2 h-auto py-2">
              <div className="flex items-center gap-3 text-left min-w-0">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage
                    src={session?.user?.image || ""}
                    alt={session?.user?.name || ""}
                    key={session?.user?.image}
                  />
                  <AvatarFallback>
                    {session?.user?.name?.slice(0, 2).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-sm font-medium truncate">
                    {session?.user?.name || "User"}
                  </span>
                  <span className="text-xs text-muted-foreground truncate">
                    {session?.user?.email || ""}
                  </span>
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{session?.user?.name || "User"}</p>
                <p className="text-xs leading-none text-muted-foreground">{session?.user?.email || ""}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut()}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useState } from "react";

export function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 bg-background w-64 border-r">
        {/* Accessibility: Title is required for DialogContent */}
        <SheetTitle className="sr-only">Dashboard Menu</SheetTitle>
        <SheetDescription className="sr-only">
          Navigation menu for the dashboard
        </SheetDescription>
        <DashboardSidebar
          onLinkClick={() => setOpen(false)}
          className="w-full border-none"
        />
      </SheetContent>
    </Sheet>
  );
}
