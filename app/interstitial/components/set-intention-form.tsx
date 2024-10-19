"use client";

import { z } from "zod";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";

const formSchema = z.object({
  title: z
    .string({
      required_error: "Intention title is required",
    })
    .min(1),
  why: z
    .string({
      required_error: "Why statement is required",
    })
    .min(1),
  time: z.number().min(1, "Time must be at least 1 second"),
});

export default function SetIntentionForm({
  onIntentionSet,
}: {
  onIntentionSet: (
    intentionId: Id<"intentions">,
    title: string,
    why: string,
    time: number,
  ) => void;
}) {
  const router = useRouter();

  const createIntention = useMutation(api.intentions.create);
  const addWhyStatement = useMutation(api.statements.create);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      why: "",
      time: 60, // Default to 1 minute
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const intentionId = await createIntention({
      title: values.title,
    });
    await addWhyStatement({
      intentionId,
      text: values.why,
      type: "why",
    });
    onIntentionSet(intentionId, values.title, values.why, values.time);
    router.push(`/interstitial`);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="">Title</FormLabel>
              <FormControl>
                <Input
                  autoComplete="off"
                  className=""
                  placeholder="Intention title"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="why"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="">Why?</FormLabel>
              <FormControl>
                <Input
                  autoComplete="off"
                  className=""
                  placeholder="Why do you want to do this?"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="time"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="">Time (seconds)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  autoComplete="off"
                  className=""
                  placeholder="Enter time in seconds"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className=""
        >
          Save
        </Button>
      </form>
    </Form>
  );
}
