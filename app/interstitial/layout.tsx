"use client";

import { cn } from "@/lib/utils";
import Sidebar from "./components/sidebar/sidebar";
import { useStore } from "@/hooks/use-store";
import { useSidebarToggle } from "@/hooks/use-sidebar-toggle";

export default function InterstitialLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sidebar = useStore(useSidebarToggle, (state) => state);

  return (
    <main
      className={cn(
        "pl-4 min-h-[calc(100vh-4rem)] transition-[margin-left] ease-in-out duration-300",
        sidebar?.isOpen === false ? "lg:ml-[92px]" : "lg:ml-[290px]",
      )}
    >
      <Sidebar />
      {children}
    </main>
  );
}
