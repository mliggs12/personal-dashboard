import { Textarea } from "@/app/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useEffect, useState } from "react";

export default function BeliefDescription(props: { belief: Doc<"beliefs"> }) {
  const [description, setDescription] = useState(props.belief.description!);
  const updateDescription = useMutation(api.beliefs.updateDescription);

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const newDescription = e.target.value;
    setDescription(newDescription);
  };

  useEffect(() => {
    const saveInterval = setInterval(() => {
      if (description !== props.belief.description) {
        updateDescription({ beliefId: props.belief._id, description });
      }
    }, 2500);

    return () => clearInterval(saveInterval);
  }, [
    description,
    props.belief._id,
    props.belief.description,
    updateDescription,
  ]);

  return (
    <Textarea
      value={description}
      onChange={handleDescriptionChange}
      className="min-h-[400px] text-xl"
    />
  );
}
