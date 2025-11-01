import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  name: z.string().min(1, { message: "Template name is required" }),
  description: z.string().optional(),
});

interface EditTemplateFormProps {
  template: {
    id: string;
    name: string;
    description?: string;
  };
  className?: string;
}

export function EditTemplateForm({ template, className }: EditTemplateFormProps) {
  const { toast } = useToast();

  // const updateTemplate = useMutation(api.schedules.updateTemplate);
  const updateSchedule = useMutation(api.schedules.updateSchedule);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: template.name,
      description: template.description ?? "",
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    const { name, description } = data;

    updateSchedule({ scheduleId: template.id as Id<"schedules">, name, length: 16.5, start: 0, date: undefined, isTemplate: true });

    toast({
      title: "Template updated",
      description: `Template '${name}' has been updated.`,
      duration: 3000,
    });
  }

  return (
    <Form {...form}>
      <form
        id="edit-template-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("space-y-6", className)}
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  id="name"
                  type="text"
                  autoComplete="off"
                  autoFocus
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input
                  id="description"
                  type="text"
                  autoComplete="off"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}

