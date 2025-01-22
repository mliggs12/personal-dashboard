"use client";

import { useMutation } from "convex/react";
import { useEffect, useState } from "react";

import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";

export default function NoteContent({ note }: { note: Doc<"notes"> }) {
  const [content, setContent] = useState(note.content);
  const updateNote = useMutation(api.notes.update);

  useEffect(() => {
    const saveInterval = setInterval(() => {
      if (content !== note.content) {
        updateNote({ noteId: note._id as Id<"notes">, content: content! });
      }
    }, 1000);

    return () => clearInterval(saveInterval);
  }, [content, note.content, note._id, updateNote]);

  return (
    <Textarea
      onChange={(e) => setContent(e.target.value)}
      placeholder="Note"
      value={content}
      className="flex flex-col flex-1 h-full p-0 border-none focus-visible:ring-0 focus-visible:ring-offset-0"
    />
  );
}
