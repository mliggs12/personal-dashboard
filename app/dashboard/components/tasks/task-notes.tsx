import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useState, useEffect } from "react";

export default function TaskNotes({ task }: { task: Doc<"tasks"> }) {
  const [notes, setNotes] = useState(task.notes);
  const updateNotes = useMutation(api.tasks.updateNotes);

  useEffect(() => {
    const saveInterval = setInterval(() => {
      if (notes !== task.notes) {
        updateNotes({ taskId: task._id, notes: notes! });
      }
    }, 1500);

    return () => clearInterval(saveInterval);
  }, [notes, task.notes, task._id, updateNotes]);

  return (
    <Textarea
      value={notes}
      onChange={(e) => setNotes(e.target.value)}
      className="min-h-[300px] text-base text-foreground"
    />
  );
}
