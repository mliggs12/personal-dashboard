"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import CreateEmotionInput from "./create-emotion-input";
import { Id } from "@/convex/_generated/dataModel";
import { updateEmotion } from "@/convex/intentions";

const FormSchema = z.object({
  emotionValue: z.string({
    required_error: "Please select an emotion.",
  }),
});

export function EmotionSelectForm({
  intentionId,
}: {
  intentionId: Id<"intentions">;
}) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  const emotions = useQuery(api.emotions.list);
  const updateEmotion = useMutation(api.intentions.updateEmotion);

  if (emotions === undefined) {
    return <p>Loading...</p>;
  }

  if (emotions && emotions.length === 0) {
    return <CreateEmotionInput />;
  }

  function onSubmit(data: z.infer<typeof FormSchema>) {
    const emotion = emotions?.find((e) => e.value === data.emotionValue);

    updateEmotion({
      id: intentionId,
      emotionId: emotion?._id as Id<"emotions">,
    });

    toast({
      title: "You submitted the following emotion:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">
            {JSON.stringify(data.emotionValue, null, 2)}
          </code>
        </pre>
      ),
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex gap-2 w-2/3"
      >
        <FormField
          control={form.control}
          name="emotionValue"
          render={({ field }) => (
            <FormItem>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl className="text-3xl pl-0">
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {emotions.map((emotion) => (
                    <SelectItem
                      key={emotion._id}
                      value={emotion.value}
                      className="text-xl"
                    >
                      {emotion.label}
                    </SelectItem>
                  ))}
                  <CreateEmotionInput />
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
