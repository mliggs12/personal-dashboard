import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useState, useEffect } from "react";

export default function NoteText({ note }: { note: Doc<"notes"> }) {
  const [notes, setNotes] = useState(note.text);
  const updateNotes = useMutation(api.notes.updateNotes);

  useEffect(() => {
    const saveInterval = setInterval(() => {
      if (notes !== note.text) {
        updateNotes({ notes: notes! });
      }
    }, 2500);

    return () => clearInterval(saveInterval);
  }, [notes, note.text, note._id, updateNotes]);

  return (
    <Textarea
      value={notes}
      onChange={(e) => setNotes(e.target.value)}
      className="min-h-[625px] text-xl"
    />
  );
}
