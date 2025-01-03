"use client";

import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { usePathname } from "next/navigation";

import SidebarLeft from "@/app/dashboard/components/sidebar/sidebar-left";
import SidebarRight from "@/app/dashboard/components/sidebar/sidebar-right";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

import DashboardBreadcrumbs from "./components/dashboard-breadcrumbs";

dayjs.extend(localizedFormat);

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isMobile = useIsMobile();

  return (
    <>
      <SidebarProvider defaultOpen={false}>
        <SidebarLeft />
        <SidebarInset>
          <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 bg-background">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-2" />
              <Separator
                orientation="vertical"
                className="mr-2 h-4"
              />
              <DashboardBreadcrumbs />
            </div>
            <div
              className={cn(
                "hidden pr-4 ml-auto",
                pathname === "/dashboard" && !isMobile && "flex",
              )}
            >
              <p>{dayjs().format("dddd, LL")}</p>
            </div>
          </header>
          <main className="flex-1 overflow-hidden">{children}</main>
          <Toaster />
        </SidebarInset>
        {/* <SidebarRight /> */}
      </SidebarProvider>
    </>
  );
}
