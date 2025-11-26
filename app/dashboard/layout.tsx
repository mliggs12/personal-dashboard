"use client";

import { usePathname } from "next/navigation";
import { Authenticated } from "convex/react";
import { Bell, Zap } from "lucide-react";

import SidebarLeft from "@/app/dashboard/components/sidebar/sidebar-left";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { useIsMobile } from "@/hooks/use-mobile";
import dayjs from "@/lib/dayjs.config";
import { cn } from "@/lib/utils";

import CommandPalette from "./components/command-palette/command-palette";
import DashboardBreadcrumbs from "./components/dashboard-breadcrumbs";

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
              <div className="flex items-center gap-2 pr-4 ml-auto">
                {/* Mobile icons for dashboard page only */}
                {isMobile && pathname === "/dashboard" && (
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Zap className="h-5 w-5 text-yellow-500" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Bell className="h-5 w-5" />
                    </Button>
                  </div>
                )}
                {/* Desktop content */}
                <div
                  className={cn(
                    "hidden",
                    pathname === "/dashboard" && !isMobile && "flex items-center gap-4",
                  )}
                >
                  <CommandPalette />
                  <p>{dayjs().format("dddd, LL")}</p>
                </div>
              </div>
            </header>
            <main className={cn(
              "h-[calc(100vh-64px)] md:h-[calc(100vh-48px)]",
              isMobile ? "overflow-y-auto" : "overflow-hidden"
            )}>{children}</main>
            <Toaster />
          </SidebarInset>
        </Authenticated>
      </SidebarProvider>
    </>
  );
}
