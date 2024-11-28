"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/app/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@/app/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import CreateEmotionInput from "./create-emotion-input";

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
  const updateIntention = useMutation(api.intentions.update);

  if (emotions === undefined) {
    return <p>Loading...</p>;
  }

  if (emotions && emotions.length === 0) {
    return <CreateEmotionInput />;
  }

  function onSubmit(data: z.infer<typeof FormSchema>) {
    const emotion = emotions?.find((e) => e.value === data.emotionValue);

    updateIntention({
      id: intentionId,
      emotionId: emotion?._id as Id<"emotions">,
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
