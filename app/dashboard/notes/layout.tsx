"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { PanelLeft, PanelLeftClose, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { api } from "@/convex/_generated/api";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

import NotesTable from "./components/notes-table";
import { NotesSidebarContext } from "./context/notes-sidebar-context";

interface NotesLayoutProps {
  children: React.ReactNode;
  note: React.ReactNode;
}

export default function NotesLayout({
  children,
  note,
}: NotesLayoutProps) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const createNote = useMutation(api.notes.create);

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileMenuOpen((prev) => !prev);
    } else {
      setIsCollapsed((prev) => !prev);
    }
  };

  const handleCreateNote = async () => {
    try {
      const noteId = await createNote({ title: "Untitled Note" });
      router.push(`/dashboard/notes/${noteId}`);
      if (isMobile) {
        setMobileMenuOpen(false);
      }
      toast.success("Note created");
    } catch (error) {
      toast.error("Failed to create note");
      console.error(error);
    }
  };

  return (
    <NotesSidebarContext.Provider value={{ isCollapsed, toggleSidebar, isMobile, mobileMenuOpen, setMobileMenuOpen }}>
      <div className="flex h-full">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <div
            className={cn(
              "border-r bg-background transition-all duration-300 ease-in-out flex flex-col",
              isCollapsed ? "w-0 overflow-hidden" : "w-[520px]"
            )}
          >
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h1 className="font-semibold text-2xl">Notes</h1>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCreateNote}
                  aria-label="Create new note"
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleSidebar}
                  aria-label="Collapse sidebar"
                >
                  <PanelLeftClose className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {/* Sidebar Content */}
            <div className="flex-1 overflow-hidden">
              <NotesTable />
            </div>
          </div>
        )}

        {/* Mobile Sheet Sidebar */}
        {isMobile && (
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetContent side="left" className="w-[90vw] sm:max-w-md p-0">
              <SheetHeader className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <SheetTitle className="text-2xl font-semibold text-left">Notes</SheetTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCreateNote}
                    aria-label="Create new note"
                    className="mr-8"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </SheetHeader>
              <div className="h-[calc(100vh-80px)] overflow-hidden">
                <NotesTable />
              </div>
            </SheetContent>
          </Sheet>
        )}

        {/* Main Content */}
        <div className="flex-1 h-full overflow-y-auto relative">
          {/* Desktop Expand Button (shown when collapsed) */}
          {!isMobile && isCollapsed && (
            <div className="absolute top-4 left-4 z-10">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSidebar}
                aria-label="Expand sidebar"
              >
                <PanelLeft className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          {children}
          {note}
        </div>
      </div>
    </NotesSidebarContext.Provider>
  );
}
