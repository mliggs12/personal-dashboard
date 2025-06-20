import { useMutation } from "convex/react";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";

export default function ActivityName({
  activity,
}: {
  activity: Doc<"activities">;
}) {
  const [name, setName] = useState(activity.name);
  const [isEditing, setIsEditing] = useState(false);

  const update = useMutation(api.activities.update);

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (name !== activity.name) {
      if (e.key === "Enter") {
        await update({ id: activity._id, name });
        setIsEditing(false);
      } else if (e.key === "Escape") {
        setName(activity.name);
        setIsEditing(false);
      }
    }
  };

  const handleBlur = () => {
    if (name !== activity.name) {
      update({ id: activity._id, name });
    }
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <Input
        autoFocus
        value={name}
        onBlur={handleBlur}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={handleKeyDown}
        className="h-5 px-0 border-none bg-transparent ring-offset-background focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
      />
    );
  }

  return (
    <div className="text-nowrap hover:cursor-pointer" onClick={() => setIsEditing(true)}>{activity.name}</div>
  )
}
