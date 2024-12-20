"use client";

import { useMutation } from "convex/react";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";

export default function CreateEmotionInput() {
  const [emotionName, setEmotionName] = useState("");
  const createEmotion = useMutation(api.emotions.create);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (emotionName === "") {
        return;
      }
      createEmotion({ label: emotionName });
      setEmotionName("");
    }
  };

  return (
    <Input
      placeholder="Add a new emotion"
      value={emotionName}
      onChange={(e) => setEmotionName(e.target.value)}
      onKeyDown={handleKeyDown}
      className="mt-4"
    />
  );
}
