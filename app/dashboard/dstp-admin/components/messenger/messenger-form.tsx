"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { Loader2, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

const formSchema = z.object({
  content: z.string().min(1, "Message cannot be empty"),
});

type FormValues = z.infer<typeof formSchema>;

interface FormProps {
  authorId: Id<"users">;
  chatId: Id<"chats">;
}

export const MessengerForm = ({ authorId, chatId }: FormProps) => {
  const send = useMutation(api.messages.send);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      await send({
        content: values.content.trim(),
        authorId,
        chatId,
      });
      form.reset();
    } catch (error) {
      console.error("Failed to send message:", error);
      setError("Failed to send message. Please try again.");
      // Keep the message in the form so user can retry
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="sticky bottom-0 p-2 md:p-3 bg-card flex flex-col gap-2 w-full shrink-0 border-t"
      aria-label="Send message"
    >
      {error && (
        <div className="text-xs text-destructive px-2" role="alert">
          {error}
        </div>
      )}
      <div className="flex items-center gap-2 w-full">
        <Input
          {...form.register("content")}
          autoComplete="off"
          placeholder="Enter message..."
          disabled={isSubmitting}
          className="bg-input font-light py-2 md:py-2.5 px-3 md:px-4 w-full rounded-full focus:outline-none text-sm md:text-base"
          aria-label="Message input"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (!isSubmitting && form.formState.isValid) {
                form.handleSubmit(onSubmit)();
              }
            }
          }}
        />
        <Button
          disabled={!form.formState.isValid || isSubmitting}
          type="submit"
          size="icon"
          className="rounded-full p-2 md:p-2.5 bg-primary cursor-pointer hover:bg-primary/60 transition shrink-0 min-w-[44px] min-h-[44px] md:min-w-[40px] md:min-h-[40px]"
          aria-label="Send message"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin text-primary-foreground" />
          ) : (
            <Send size={18} className="text-primary-foreground" />
          )}
        </Button>
      </div>
    </form>
  );
};
