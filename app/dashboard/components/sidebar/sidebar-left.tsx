import { UserButton } from "@clerk/nextjs";
import { Box } from "lucide-react";
import Link from "next/link";

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

import MainNav from "./main-nav";

export default function SidebarLeft({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
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
                <Box />
                <span>Enthousiazein</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <MainNav />
      </SidebarContent>
      <SidebarFooter>
        <div
          className={cn(
            "flex group-has-[[data-collapsible=icon]]/sidebar-wrapper:flex-col group-has-[[data-collapsible=icon]]/sidebar-wrapper:items-center gap-4 justify-end",
          )}
        >
          <ModeToggle />
          <UserButton />
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
