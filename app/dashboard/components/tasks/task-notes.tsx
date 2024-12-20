import { useMutation } from "convex/react";
import { useEffect, useState } from "react";

import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";

export default function TaskNotes({ task }: { task: Doc<"tasks"> }) {
  const [notes, setNotes] = useState(task.notes);
  const updateTask = useMutation(api.tasks.update);

  useEffect(() => {
    const saveInterval = setInterval(() => {
      if (notes !== task.notes) {
        updateTask({ taskId: task._id, notes: notes! });
      }
    }, 1500);

    return () => clearInterval(saveInterval);
  }, [notes, task.notes, task._id, updateTask]);

  return (
    <Textarea
      value={notes}
      onChange={(e) => setNotes(e.target.value)}
      className="min-h-[300px] text-base text-foreground"
    />
  );
}
