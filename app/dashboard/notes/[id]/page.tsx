"use client";

import { useQuery, useMutation } from "convex/react";
import { useParams } from "next/navigation";
import { useState, useRef, useCallback, useEffect } from "react";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

import TiptapEditor from "../../components/tiptap-editor";

export default function NotePage() {
  const { id } = useParams<{ id: Id<"notes"> }>();
  const note = useQuery(api.notes.get, { noteId: id });
  const updateNote = useMutation(api.notes.update);
  const [isSaving, setIsSaving] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleChange = useCallback(
    (content: string) => {
      setIsSaving(true);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        updateNote({ noteId: id, text: content }).then(() =>
          setIsSaving(false),
        );
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
    <div className="flex flex-col p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{note.title}</h1>
        <div className="hidden md:block mr-4">
          {isSaving && (
            <span className="text-sm text-muted-foreground">Saving...</span>
          )}
        </div>
      </div>
      <div>
        <TiptapEditor
          initialContent={note.text}
          onChange={handleChange}
        />
      </div>
    </div>
  );
}
