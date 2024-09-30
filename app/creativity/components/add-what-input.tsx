"use client";

import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";

export default function AddWhatInput({
  intention,
}: {
  intention: Doc<"intentions">;
}) {
  const [statement, setStatement] = useState("");
  const addWhatStatement = useMutation(api.intentions.addWhatStatement);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (statement === "") {
        return;
      }
      addWhatStatement({ intentionId: intention._id, statement });
      setStatement("");
    }
  };

  return (
    <Input
      type="text"
      placeholder="What statement"
      value={statement}
      onChange={(e) => setStatement(e.target.value)}
      onKeyDown={handleKeyDown}
      autoComplete="off"
      className="mt-4 ml-0 pl-2 text-xl"
    />
  );
}
