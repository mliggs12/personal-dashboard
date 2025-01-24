"use client";

import { useMutation } from "convex/react";
import { useEffect, useState } from "react";

import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";

export default function NoteText({ note }: { note: Doc<"notes"> }) {
  const [text, setContent] = useState(note.text);
  const updateNote = useMutation(api.notes.update);

  useEffect(() => {
    const saveInterval = setInterval(() => {
      if (text !== note.text) {
        updateNote({ noteId: note._id as Id<"notes">, text: text! });
      }
    }, 1000);

    return () => clearInterval(saveInterval);
  }, [text, note.text, note._id, updateNote]);

  return (
    <Textarea
      onChange={(e) => setContent(e.target.value)}
      placeholder="Note"
      value={text}
      className="flex flex-col flex-1 h-full p-0 border-none focus-visible:ring-0 focus-visible:ring-offset-0"
    />
  );
}
