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
import { UserButton } from "@clerk/nextjs";

import NavMain from "@/components/nav-main";
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

const data = {
  navItems: [
    {
      title: "Creativity",
      url: "/creativity",
      icon: Shapes,
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
    {
      title: "Tasks",
      url: "/tasks",
      icon: SquareCheckBig,
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
            <SidebarMenuButton asChild>
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
        <div className="flex items-center justify-end gap-4">
          <UserButton />
          <ModeToggle />
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
