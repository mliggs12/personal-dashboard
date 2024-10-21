"use client";

import AppSidebar from "@/components/app-sidebar";
import { Toaster } from "@/components/ui/toaster";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";

export default function MainClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AppSidebar />
      <SidebarInset>
        <SidebarTrigger className="-ml-1" />
        <div className="flex gap-24 container mx-auto pt-6">{children}</div>
        <Toaster />
      </SidebarInset>
    </>
  );
}
