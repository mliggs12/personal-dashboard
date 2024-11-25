import Link from "next/link";

import {
  Box,
  Brain,
  ListTodo,
  Shapes,
  Skull,
  StickyNote,
  Sunrise,
  Timer,
} from "lucide-react";

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

import { UserButton } from "@clerk/nextjs";
import NavMain from "./nav-main";

import { cn } from "@/lib/utils";

const data = {
  navItems: [
    {
      title: "Tasks",
      url: "/tasks",
      icon: ListTodo,
    },
    {
      title: "Notes",
      url: "/notes",
      icon: StickyNote,
    },
    {
      title: "Interstitial/Pomodoro",
      url: "/interstitial",
      icon: Timer,
    },
    {
      title: "Mind Dump",
      url: "/me5",
      icon: Brain,
    },
    // {
    //   title: "Plan",
    //   url: "/plan",
    //   icon: TableProperties,
    // },
    {
      title: "Intentions",
      url: "/creativity",
      icon: Shapes,
    },
    {
      title: "Beliefs",
      url: "/beliefs",
      icon: Sunrise,
    },
    {
      title: "Memento Mori",
      url: "/wellness",
      icon: Skull,
    },
  ],
};

export default function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      collapsible="icon"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Dashboard"
            >
              <Link href="/">
                <Box />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navItems} />
      </SidebarContent>
      <SidebarFooter>
        <div className={cn("flex flex-col gap-2 items-center")}>
          <ModeToggle />
          <UserButton />
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
