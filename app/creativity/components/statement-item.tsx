import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Doc } from "@/convex/_generated/dataModel";

export default function StatementItem({
  statement,
}: {
  statement: Doc<"statements">;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedStatement, setEditedStatement] = useState(statement.text);
  const updateStatement = useMutation(api.statements.update);

  const handleStatementClick = () => {
    setIsEditing(true);
  };

  const handleStatementChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedStatement(e.target.value);
  };

  const handleStatementKeyDown = async (
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Enter") {
      if (editedStatement !== statement.text) {
        await updateStatement({
          id: statement._id,
          text: editedStatement,
        });
      }
      setIsEditing(false);
    } else if (e.key === "Escape") {
      setIsEditing(false);
    }
  };

  const handleBlur = () => {
    if (editedStatement !== statement.text) {
      updateStatement({
        id: statement._id,
        text: editedStatement,
      });
    }
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <Input
        value={editedStatement}
        onChange={handleStatementChange}
        onKeyDown={handleStatementKeyDown}
        onBlur={handleBlur}
        autoFocus
        className="text-xl pl-2 border-none focus:h-7"
      />
    );
  }

  return (
    <li
      className="text-xl cursor-pointer ml-2"
      onClick={handleStatementClick}
    >
      {statement.text}
    </li>
  );
}
