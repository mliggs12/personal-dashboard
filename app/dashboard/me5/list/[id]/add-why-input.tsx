"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";

export default function AddWhyInput({
  onAddWhy,
}: {
  onAddWhy: (statement: string) => void;
}) {
  const [statement, setStatement] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (statement === "") {
        return;
      }
      onAddWhy(statement);
      setStatement("");
    }
  };

  return (
    <Input
      placeholder="Why? Why this statement as opposed to another?"
      value={statement}
      onChange={(e) => setStatement(e.target.value)}
      onKeyDown={handleKeyDown}
      autoComplete="off"
      className="mt-4 ml-0 pl-2 text-xl"
    />
  );
}
