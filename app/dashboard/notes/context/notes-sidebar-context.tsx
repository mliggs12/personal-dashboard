"use client";

import { createContext, useContext } from "react";

interface NotesSidebarContextType {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  isMobile: boolean;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const NotesSidebarContext = createContext<NotesSidebarContextType | null>(null);

export function useNotesSidebar() {
  const context = useContext(NotesSidebarContext);
  if (!context) {
    throw new Error("useNotesSidebar must be used within NotesLayout");
  }
  return context;
}

