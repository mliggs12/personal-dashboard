"use client";

import { Preloaded } from "convex/react";

import { api } from "@/convex/_generated/api";
import { usePreloadedQueryWithAuth } from "@/hooks/use-preloaded-query";

import NotesTable from "./components/notes-table";

export default function NotesPage({
  preloadedNotes,
}: {
  preloadedNotes: Preloaded<typeof api.notes.list>;
}) {
  const notes = usePreloadedQueryWithAuth(preloadedNotes);
  // Search implementation

  return (
    <div className="flex flex-col h-full md:px-4">
      <h1 className="hidden md:block font-semibold text-2xl">Notes</h1>
      <NotesTable notes={notes} />
    </div>
  );
}
