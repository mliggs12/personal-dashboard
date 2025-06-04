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
      placeholder="Enter a specific negative statement"
      value={statement}
      onChange={(e) => setStatement(e.target.value)}
      onKeyDown={handleKeyDown}
      autoComplete="off"
      className="w-1/2 h-8 p-0 pl-1 text-xl border-0 border-b-2 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none"
    />
  );
}
