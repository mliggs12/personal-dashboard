"use client";

import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useState, useEffect } from "react";

export default function NoteText({ note }: { note: Doc<"notes"> }) {
  const [text, setText] = useState(note.text);
  const updateNotes = useMutation(api.notes.update);

  useEffect(() => {
    const saveInterval = setInterval(() => {
      if (text !== note.text) {
        updateNotes({ id: note._id as Id<"notes">, text: text! });
      }
    }, 1000);

    return () => clearInterval(saveInterval);
  }, [text, note.text, note._id, updateNotes]);

  return (
    <Textarea
      value={text}
      onChange={(e) => setText(e.target.value)}
      className="flex flex-1 p-0 text-xl h-full border-none focus-visible:ring-0 focus-visible:ring-offset-0"
    />
  );
}