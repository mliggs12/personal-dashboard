"use client";

import { useMutation } from "convex/react";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";

export default function AddBeliefInput({
  intention,
}: {
  intention: Doc<"intentions">;
}) {
  const [statement, setStatement] = useState("");
  const createBelief = useMutation(api.beliefs.create);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && statement !== "") {
      createBelief({ title: statement, intentionId: intention._id });
      setStatement("");
    } else if (e.key === "Escape") {
      setStatement("");
    }
  };

  return (
    <Input
      type="text"
      placeholder="Add a limiting belief"
      value={statement}
      onChange={(e) => setStatement(e.target.value)}
      onKeyDown={handleKeyDown}
      autoComplete="off"
      className="mt-4 ml-0 pl-2 text-xl"
    />
  );
}
