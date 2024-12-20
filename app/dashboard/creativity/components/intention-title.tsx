import { useMutation } from "convex/react";
import { useState } from "react";

import { CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";

export default function IntentionTitle({
  intention,
}: {
  intention: Doc<"intentions">;
}) {
  const [title, setTitle] = useState(intention.title);
  const [isEditing, setIsEditing] = useState(false);
  const updateIntention = useMutation(api.intentions.update);

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (title !== intention.title) {
      if (e.key === "Enter") {
        await updateIntention({ id: intention._id, title });
        setIsEditing(false);
      } else if (e.key === "Escape") {
        setTitle(intention.title);
        setIsEditing(false);
      }
    }
  };

  const handleBlur = () => {
    if (title !== intention.title) {
      updateIntention({ id: intention._id, title });
    }
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <Input
        autoFocus
        value={title}
        onBlur={handleBlur}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        className="text-4xl font-semibold leading-none tracking-tight pl-0 border-none focus-visible:ring-0 focus-visible:ring-offset-0"
      />
    );
  }

  return (
    <CardTitle
      className="text-4xl cursor-pointer"
      onClick={() => setIsEditing(true)}
    >
      {title}
    </CardTitle>
  );
}
