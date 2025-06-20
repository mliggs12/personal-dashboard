import { useMutation } from "convex/react";
import { useEffect, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import { TableCell } from "@/components/ui/table";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";

export default function ActivityLengthCell({
  activity,
}: {
  activity: Doc<"activities">;
}) {
  const [length, setlength] = useState(activity.length);
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const updateLength = useMutation(api.activities.update);

  const handleLengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLength = parseInt(e.target.value);
    setlength(newLength);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "Escape") {
      setIsEditing(false);
      if (length !== activity.length) {
        updateLength({ id: activity._id, length });
      }
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (length !== activity.length) {
      updateLength({ id: activity._id, length });
    }
  };

  const handleClick = () => {
    setIsEditing(true);
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  if (isEditing) {
    return (
      <TableCell className="w-14">
        <Input
          ref={inputRef}
          value={length}
          onChange={handleLengthChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="bg-transparent h-5 px-0 border-none focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </TableCell>
    );
  }

  return (
    <TableCell
      onClick={handleClick}
      className="w-14 hover:cursor-pointer"
    >
      {length}
    </TableCell>
  );
}
