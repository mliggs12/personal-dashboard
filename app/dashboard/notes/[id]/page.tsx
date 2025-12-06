"use client";

import { useCallback, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

import TiptapEditor from "../../components/tiptap-editor";
import MoreActionsButton from "../components/more-actions-button";
import NoteTitle from "../components/note-title";
import { useNotesSidebar } from "../context/notes-sidebar-context";

export default function NotePage() {
  const { id } = useParams<{ id: Id<"notes"> }>();
  const note = useQuery(api.notes.get, { noteId: id });
  const isMobile = useIsMobile();
  const { setMobileMenuOpen, isCollapsed } = useNotesSidebar();

  const updateNote = useMutation(api.notes.update);

  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const handleChange = useCallback(
    (text: string) => {

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        updateNote({ noteId: id, text })
      }, 2000);
    },
    [id, updateNote],
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (!note)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin">Loading...</div>
      </div>
    );

  return (
    <div className="flex flex-col h-full">
      {/* Mobile Header */}
      {isMobile && (
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 px-1 pb-2 md:py-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open notes menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h2 className="text-sm truncate">{note.title || "Untitled"}</h2>
          </div>
          <MoreActionsButton id={note._id} />
        </div>
      )}

      {/* Desktop Header */}
      {!isMobile && (
        <div className="flex items-center justify-end px-4 pt-4">
          <MoreActionsButton id={note._id} />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto py-2 md:py-4">
        <div className={cn(
          "transition-all duration-300",
          isMobile ? "px-4" : (isCollapsed ? "px-32" : "px-4")
        )}>
          <NoteTitle
            id={note._id}
            initialContent={note.title}
          />
          <TiptapEditor
            initialContent={note.text}
            onChange={handleChange}
          />
        </div>
      </div>
    </div>
  );
}
