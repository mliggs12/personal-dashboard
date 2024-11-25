"use client";

import AppSidebar from "@/components/sidebar/app-sidebar";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { Authenticated } from "convex/react";

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
        <SidebarInset className="h-dvh flex container">
          <SidebarTrigger className="-ml-1" />
          {children}
          <Toaster />
        </SidebarInset>
      </Authenticated>
    </>
  );
}
