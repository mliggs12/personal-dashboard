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
import { LoadingButton } from "@/components/loading-button";
import { Input } from "@/components/ui/input";
import { redirect, useRouter } from "next/navigation";

const formSchema = z.object({
  title: z.string().min(1).max(5000),
});

export default function CreateIntentionForm({
  onIntentionCreated,
}: {
  onIntentionCreated: () => void;
}) {
  const router = useRouter();
  const createIntention = useMutation(api.intentions.create);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const intentionId = await createIntention({ title: values.title });
    onIntentionCreated();
    router.push(`/creativity/intentions/${intentionId}`);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xl">Title</FormLabel>
              <FormControl>
                <Input
                  autoComplete="off"
                  className="text-lg"
                  placeholder="I want..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <LoadingButton
          isLoading={form.formState.isSubmitting}
          loadingText="Creating..."
        >
          Create
        </LoadingButton>
      </form>
    </Form>
  );
}
