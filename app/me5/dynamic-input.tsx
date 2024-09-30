// components/DynamicInput.tsx
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import Link from "next/link";

export default function DynamicInput() {
  const [inputValue, setInputValue] = useState("");
  const [answers, setAnswers] = useState<string[]>([]);
  const createBelief = useMutation(api.beliefs.create);

  const handleEnterKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      const value = inputValue.trim();
      createBelief({ title: value, status: "active" });
      setAnswers((prev) => [...prev, value]);
      setInputValue("");
    }
  };

  return (
    <div className="flex justify-between px-4 w-full">
      <div className="w-1/2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleEnterKey}
          className="w-full p-4 text-2xl rounded-lg shadow-lg focus:outline-none focus:ring-2"
          placeholder="Type your thoughts and press Enter"
        />
      </div>
      <div className="flex flex-col text-lg text-left">
        {answers.map((answer, index) => (
          <div
            key={index}
            className="p-2 rounded"
          >
            {answer}
          </div>
        ))}
      </div>
      <Link href="/me5/list">
        <Button>Next Page</Button>
      </Link>
    </div>
  );
}
