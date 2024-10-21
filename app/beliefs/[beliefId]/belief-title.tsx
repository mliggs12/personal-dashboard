import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";

export default function BeliefTitle({ belief }: { belief: Doc<"beliefs"> }) {
  const [title, setTitle] = useState(belief.title);
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const updateTitle = useMutation(api.beliefs.updateTitle);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setIsEditing(false);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const sharedStyles =
    "text-2xl font-bold leading-normal p-0 m-0 ml-2 h-[1.5em]";

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        value={title}
        onChange={handleTitleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`${sharedStyles} dark:bg-slate-800 bg-slate-200 border-none focus-visible:ring-0 focus-visible:ring-offset-0`}
      />
    );
  }

  return (
    <h1
      className={`${sharedStyles} cursor-pointer`}
      onClick={() => setIsEditing(true)}
    >
      {belief.title}
    </h1>
  );
}
