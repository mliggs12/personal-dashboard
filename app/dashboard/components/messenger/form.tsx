"use client";

import { Send } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useApiMutation } from "@/hooks/use-api-mutation";

interface FormProps {
  authorId: Id<"users">;
  chatId: Id<"chats">;
}

export const Form = ({ authorId, chatId }: FormProps) => {
  const [content, setContent] = useState<string>("");
  const { mutate, pending } = useApiMutation(api.messages.send);

  const handleSubmit = () => {
    if (content === "") return;
    mutate({
      content,
      authorId,
      chatId,
    })
      .then(() => {
        setContent("");
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <div className="fixed bottom-0 p-4 bg-card border-2 flex items-center gap-2 lg:gap-4 w-full">
      <div className="flex items-center gap-2 lg:gap-4 w-full">
        <div className="relative w-full">
          <Input
            placeholder={"Enter message..."}
            className="bg-input font-light py-2 px-4 w-full rounded-full focus:outline-none"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
        </div>
      </div>
      <Button
        disabled={pending}
        onClick={handleSubmit}
        size="icon"
        type="submit"
        className="rounded-full p-2 bg-primary cursor-pointer hover:bg-primary/60 transition"
      >
        <Send
          size={18}
          className="text-primary-foreground"
        />
      </Button>
    </div>
  );
};
