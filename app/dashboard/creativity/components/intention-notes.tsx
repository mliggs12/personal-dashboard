import { useMutation } from "convex/react";
import { useEffect, useState } from "react";

import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";

export default function IntentionNotes({
  intention,
}: {
  intention: Doc<"intentions">;
}) {
  const [notes, setNotes] = useState(intention.notes);
  const updateIntention = useMutation(api.intentions.update);

  useEffect(() => {
    const saveInterval = setInterval(() => {
      if (notes !== intention.notes) {
        updateIntention({ id: intention._id, notes: notes! });
      }
    }, 2500);

    return () => clearInterval(saveInterval);
  }, [notes, intention.notes, intention._id, updateIntention]);

  return (
    <Textarea
      value={notes}
      onChange={(e) => setNotes(e.target.value)}
      className="min-h-[160px] text-xl"
    />
  );
}
