"use client";

import { useState } from "react";
import { useMutation } from "convex/react";

import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";

export default function StatementInput({ type }: { type: string }) {
  const [statement, setStatement] = useState("");

  const create = useMutation(api.statements.create);

  const handleEnterKey = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    const value = statement.trim();
    if (e.key === "Enter" && value) {
      await create({ text: value, type });
      setStatement("")
    }
  };

  return (
    <Input
      onChange={(e) => setStatement(e.target.value)}
      onKeyDown={handleEnterKey}
      placeholder="Type your thoughts and press Enter"
      type="text"
      value={statement}
      className="w-full h-8 p-0 text-xl border-0 border-b-2 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none"
    />
  );
}
