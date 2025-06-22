"use client";

import { Authenticated } from "convex/react";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { usePathname } from "next/navigation";

import SidebarLeft from "@/app/dashboard/components/sidebar/sidebar-left";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

import CommandPalette from "./components/command-palette/command-palette";
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
        <Authenticated>
          <SidebarLeft />
          <SidebarInset>
            <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 bg-background">
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
                  pathname === "/dashboard" && !isMobile && "flex items-center gap-4",
                )}
              >
                <CommandPalette />
                <p>{dayjs().format("dddd, LL")}</p>
              </div>
            </header>
            <main className="flex-1 overflow-hidden">{children}</main>
            <Toaster />
          </SidebarInset>
        </Authenticated>
      </SidebarProvider>
    </>
  );
}
