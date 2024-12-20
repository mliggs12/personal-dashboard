import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";

import SidebarRightTrigger from "./sidebar-right-trigger";

export default function SidebarRight({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      side="right"
      className="absolute hidden md:flex top-0 pt-1 h-svh w-[15px] border-l"
      {...props}
    >
      <SidebarHeader>
        <SidebarRightTrigger />
      </SidebarHeader>
      <SidebarContent>Backlog</SidebarContent>
      <SidebarFooter></SidebarFooter>
    </Sidebar>
  );
}
