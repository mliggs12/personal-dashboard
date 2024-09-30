import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useState, useEffect } from "react";

export default function BeliefDescription({
  belief,
}: {
  belief: Doc<"beliefs">;
}) {
  const [description, setDescription] = useState(belief.description);
  const updateDescription = useMutation(api.beliefs.updateDescription);

  useEffect(() => {
    const saveInterval = setInterval(() => {
      if (description !== belief.description) {
        updateDescription({ beliefId: belief._id, description: description! });
      }
    }, 2500);

    return () => clearInterval(saveInterval);
  }, [description, belief.description, belief._id, updateDescription]);

  return (
    <Textarea
      value={description}
      onChange={(e) => setDescription(e.target.value)}
      className="min-h-[625px] text-xl"
    />
  );
}
