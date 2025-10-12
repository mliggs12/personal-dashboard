"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "convex/react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/convex/_generated/api";

const FormSchema = z.object({
  templates: z.string({}),
});

export function TemplateSelect() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  const templateSchedules = useQuery(api.schedules.getTemplates);

  if (templateSchedules === undefined) {
    return <p>Loading...</p>;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function onSubmit(data: z.infer<typeof FormSchema>) { }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex gap-2 w-1/3"
      >
        <FormField
          control={form.control}
          name="templates"
          render={({ field }) => (
            <FormItem>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {templateSchedules.map((template) => (
                    <SelectItem
                      value={template._id ?? ""}
                      key={template._id}
                      className=""
                    >
                      {template._id}
                    </SelectItem>
                  ))}
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
