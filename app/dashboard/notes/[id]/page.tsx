"use client";

import { useMutation, useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

import TiptapEditor from "../../components/tiptap-editor";
import MoreActionsButton from "../components/more-actions-button";
import NoteTitle from "../components/note-title";

export default function NotePage() {
  const { id } = useParams<{ id: Id<"notes"> }>();
  const note = useQuery(api.notes.get, { noteId: id });

  const updateNote = useMutation(api.notes.update);

  const [isSaving, setIsSaving] = useState(false);

  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleChange = useCallback(
    (text: string) => {
      setIsSaving(true);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        updateNote({ noteId: id, text }).then(() => setIsSaving(false));
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
        <NoteTitle
          id={note._id}
          initialContent={note.title}
        />
        <MoreActionsButton id={note._id} />
      </div>
      <TiptapEditor
        initialContent={note.text}
        onChange={handleChange}
      />
    </div>
  );
}
