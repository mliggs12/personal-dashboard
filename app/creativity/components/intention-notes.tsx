import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useState, useEffect } from "react";

export default function IntentionNotes({
  intention,
}: {
  intention: Doc<"intentions">;
}) {
  const [notes, setNotes] = useState(intention.notes);
  const updateNotes = useMutation(api.intentions.update);

  useEffect(() => {
    const saveInterval = setInterval(() => {
      if (notes !== intention.notes) {
        updateNotes({ id: intention._id, notes: notes! });
      }
    }, 2500);

    return () => clearInterval(saveInterval);
  }, [notes, intention.notes, intention._id, updateNotes]);

  return (
    <Textarea
      value={notes}
      onChange={(e) => setNotes(e.target.value)}
      className="min-h-[160px] text-xl"
    />
  );
}
