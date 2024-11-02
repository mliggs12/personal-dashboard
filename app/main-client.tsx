"use client";

import { Authenticated, Unauthenticated } from "convex/react";

import AppSidebar from "@/components/sidebar/app-sidebar";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";

export default function MainClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Authenticated>
        <AppSidebar />
        {/* <main> */}
        <SidebarInset className="h-dvh flex gap-24 container pt-2">
          {/* <SidebarTrigger className="-ml-1" /> */}
          {children}
          <Toaster />
        </SidebarInset>
      </Authenticated>

      <Unauthenticated>
        <div className="flex gap-24 container pt-6">{children}</div>
      </Unauthenticated>
    </>
  );
}
