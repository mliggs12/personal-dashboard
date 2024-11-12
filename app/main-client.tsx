"use client";

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
      <AppSidebar />
      {/* <main> */}
      <SidebarInset className="h-dvh flex gap-24 container">
        {/* <SidebarTrigger className="-ml-1" /> */}
        {children}
        <Toaster />
      </SidebarInset>
    </>
  );
}
