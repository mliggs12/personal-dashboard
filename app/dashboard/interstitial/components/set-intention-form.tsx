"use client";

import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

const formSchema = z.object({
  what: z
    .string({
      required_error: "What statement is required",
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
  onIntentionSet: (what: string, why: string, time: number) => void;
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      what: "",
      why: "",
      time: 1500,
    },
  });

  async function setIntention(formData: FormData) {
    const values = Object.fromEntries(formData.entries());
    onIntentionSet(
      values.what as string,
      values.why as string,
      Number(values.time),
    );
  }

  return (
    <Form {...form}>
      <form
        action={setIntention}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="what"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="">What?</FormLabel>
              <FormControl>
                <Input
                  autoComplete="off"
                  className=""
                  placeholder="What do you want to do?"
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
