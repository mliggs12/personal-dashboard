"use client";

import { Input } from "@/app/components/ui/input";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useState } from "react";

export default function AddStatementInput({
  intention,
  type,
}: {
  intention: Doc<"intentions">;
  type: "what" | "why" | "negative";
}) {
  const [statement, setStatement] = useState("");
  const addStatement = useMutation(api.statements.create);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && statement !== "") {
      addStatement({ intentionId: intention._id, text: statement, type });
      setStatement("");
    } else if (e.key === "Escape") {
      setStatement("");
    }
  };

  return (
    <Input
      type="text"
      placeholder="Add a statement"
      value={statement}
      onChange={(e) => setStatement(e.target.value)}
      onKeyDown={handleKeyDown}
      autoComplete="off"
      className="mt-4 ml-0 pl-2 text-xl"
    />
  );
}
