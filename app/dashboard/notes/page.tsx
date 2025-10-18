"use client";

import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

import { useNotesSidebar } from "./layout";

export default function NotesPage() {
  const isMobile = useIsMobile();
  const { setMobileMenuOpen } = useNotesSidebar();

  return (
    <div className="flex flex-col h-full">
      {/* Mobile Header */}
      {isMobile && (
        <div className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open notes menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h2 className="font-semibold text-lg">Notes</h2>
        </div>
      )}

      {/* Empty State */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-semibold text-muted-foreground">
            Select a note to view
          </h1>
          <p className="text-muted-foreground">
            Choose a note from the {isMobile ? "menu" : "sidebar"} to get started
          </p>
        </div>
      </div>
    </div>
  );
}
