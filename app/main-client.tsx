"use client";

import { Authenticated, Unauthenticated } from "convex/react";

import AppSidebar from "@/components/sidebar/app-sidebar";
import { Toaster } from "@/components/ui/toaster";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";

export default function MainClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Authenticated>
        <AppSidebar />
        <SidebarInset className="h-screen overflow-y-hidden">
          <SidebarTrigger className="-ml-1" />
          <div className="container">{children}</div>
          <Toaster />
        </SidebarInset>
      </Authenticated>

      <Unauthenticated>
        <div className="flex gap-24 container mx-auto pt-6">{children}</div>
      </Unauthenticated>
    </>
  );
}
