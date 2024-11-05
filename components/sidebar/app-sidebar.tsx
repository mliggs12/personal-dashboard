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
                <span>Enthousiazein</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navItems} />
      </SidebarContent>
      <SidebarFooter>
        <ModeToggle />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
