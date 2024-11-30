import { Input } from "@/components/ui/input";
import { TableCell } from "@/components/ui/table";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useEffect, useRef, useState } from "react";

export default function ActivityLengthCell({
  activity,
}: {
  activity: Doc<"activities">;
}) {
  const [length, setlength] = useState(activity.length);
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const updateLength = useMutation(api.activities.updateLength);

  const handleLengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLength = parseInt(e.target.value);
    setlength(newLength);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "Escape") {
      setIsEditing(false);
      if (length !== activity.length) {
        updateLength({ activityId: activity._id, length });
      }
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (length !== activity.length) {
      updateLength({ activityId: activity._id, length });
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
      <TableCell>
        <Input
          ref={inputRef}
          value={length}
          onChange={handleLengthChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="bg-slate-600 w-[52px] text-left leading-normal p-0 m-0 ml-2 h-[1.5em] border-none focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </TableCell>
    );
  }

  return (
    <TableCell
      onClick={handleClick}
      className="text-left leading-normal p-0 m-0 ml-2 h-[1.5em] cursor-pointer"
    >
      {length}
    </TableCell>
  );
}
