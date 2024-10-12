"use client";

import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";

export default function AddStatementInput({
  intention,
  type,
}: {
  intention: Doc<"intentions">;
  type: "what" | "why";
}) {
  const [statement, setStatement] = useState("");
  const addStatement = useMutation(api.statements.create);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (statement === "") {
        return;
      }
      addStatement({ intentionId: intention._id, text: statement, type });
      setStatement("");
    }
  };

  return (
    <Input
      type="text"
      placeholder={`${type.charAt(0).toUpperCase() + type.slice(1)} statement`}
      value={statement}
      onChange={(e) => setStatement(e.target.value)}
      onKeyDown={handleKeyDown}
      autoComplete="off"
      className="mt-4 ml-0 pl-2 text-xl"
    />
  );
}
