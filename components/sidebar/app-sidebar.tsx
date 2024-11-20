import Link from "next/link";

import {
  Brain,
  Shapes,
  Sunrise,
  SquarePen,
  SquareCheckBig,
  TableProperties,
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

import NavMain from "./nav-main";
import { UserButton } from "@clerk/nextjs";

import { cn } from "@/lib/utils";

const data = {
  navItems: [
    {
      title: "Creativity",
      url: "/creativity",
      icon: Shapes,
    },
    {
      title: "Tasks",
      url: "/tasks",
      icon: SquareCheckBig,
    },
    {
      title: "Plan",
      url: "/plan",
      icon: TableProperties,
    },
    {
      title: "Interstitial",
      url: "/interstitial",
      icon: Timer,
    },
    {
      title: "Beliefs",
      url: "/beliefs",
      icon: Sunrise,
    },
    {
      title: "Notes",
      url: "/notes",
      icon: SquarePen,
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
                <Brain />
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
