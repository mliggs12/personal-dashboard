"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { Send } from "lucide-react";
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

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await send({
        content: values.content,
        authorId,
        chatId,
      });
      form.reset();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="sticky bottom-0 p-2 bg-card flex items-center gap-2 w-full"
    >
      <div className="flex items-center gap-2 lg:gap-4 w-full">
        <Input
          {...form.register("content")}
          autoComplete="off"
          placeholder="Enter message..."
          className="bg-input font-light py-2 px-4 w-full rounded-full focus:outline-none"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              form.handleSubmit(onSubmit)();
            }
          }}
        />
      </div>
      <Button
        disabled={!form.formState.isValid}
        type="submit"
        size="icon"
        className="rounded-full p-2 bg-primary cursor-pointer hover:bg-primary/60 transition"
      >
        <Send
          size={18}
          className="text-primary-foreground"
        />
      </Button>
    </form>
  );
};
