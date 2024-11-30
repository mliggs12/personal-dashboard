"use client";

import AppSidebar from "@/app/dashboard/components/sidebar/app-sidebar";
import { navItems } from "@/app/dashboard/components/sidebar/data";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Authenticated } from "convex/react";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { usePathname } from "next/navigation";

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
      <Authenticated>
        <SidebarProvider defaultOpen={false}>
          <AppSidebar />
          {/* <main> */}
          <SidebarInset className="h-screen">
            <header className="sticky top-0 z-2 flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-2" />
                <Separator
                  orientation="vertical"
                  className="mr-2 h-4"
                />
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbPage className="text-foreground">
                        {navItems.find((item) => item.url === pathname)
                          ?.title || "Dashboard"}
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
              <div
                className={cn(
                  "hidden pr-4",
                  pathname === "/dashboard" && !isMobile && "flex",
                )}
              >
                <p>{dayjs().format("dddd, LL")}</p>
              </div>
            </header>
            <div
              className={cn(
                "flex flex-col flex-1 container overflow-hidden p-4 pb-0",
                isMobile && "p-0",
              )}
            >
              {children}
            </div>
            <Toaster />
          </SidebarInset>
        </SidebarProvider>
      </Authenticated>
    </>
  );
}