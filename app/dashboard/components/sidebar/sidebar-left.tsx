"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { LayoutDashboard, ShieldCheck } from "lucide-react";
import { useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import { ModeToggle } from "@/components/ui/mode-toggle";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

import NavMain from "./nav-main";

export default function SidebarLeft({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const currentUser = useQuery(api.users.current);
  const isAuthorized =
    currentUser &&
    [
      process.env.NEXT_PUBLIC_USER_1,
      process.env.NEXT_PUBLIC_USER_2,
    ].includes(currentUser._id);

  return (
    <Sidebar
      collapsible="icon"
      {...props}
    >
      <SidebarHeader className="pb-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size="lg"
              tooltip="Dashboard"
            >
              <Link href="/dashboard">
                <LayoutDashboard />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain />
      </SidebarContent>
      <SidebarFooter>
        <div
          className={cn(
            "flex group-has-[[data-collapsible=icon]]/sidebar-wrapper:flex-col group-has-[[data-collapsible=icon]]/sidebar-wrapper:items-center gap-4 justify-end",
          )}
        >
          <ModeToggle />
          <UserButton>
            {isAuthorized && (
              <UserButton.MenuItems>
                <UserButton.Link label="DSTP Admin" href="/dashboard/dstp-admin" labelIcon={<ShieldCheck className="w-4 h-4" />} />
              </UserButton.MenuItems>
            )}
          </UserButton>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
