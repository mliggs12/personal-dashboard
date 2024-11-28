import { Input } from "@/app/components/ui/input";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useState } from "react";

export default function StatementItem({
  statement,
}: {
  statement: Doc<"statements">;
}) {
  const [text, setText] = useState(statement.text);
  const [isEditing, setIsEditing] = useState(false);
  const updateStatement = useMutation(api.statements.update);

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (text !== statement.text) {
        await updateStatement({
          id: statement._id,
          text,
        });
      }
      setIsEditing(false);
    } else if (e.key === "Escape") {
      setIsEditing(false);
    }
  };

  const handleBlur = () => {
    if (text !== statement.text) {
      updateStatement({
        id: statement._id,
        text,
      });
    }
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <Input
        autoFocus
        value={text}
        onBlur={handleBlur}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        className="text-xl pl-2 border-none focus:h-7 focus-visible:ring-0 focus-visible:ring-offset-0"
        autoComplete="off"
      />
    );
  }

  return (
    <li
      className="text-xl cursor-pointer ml-2"
      onClick={() => setIsEditing(true)}
    >
      {text}
    </li>
  );
}
