import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
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

  const update = useMutation(api.schedules.update);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: template.name,
      description: template.description ?? "",
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    const { name, description } = data;

    // TODO: Implement template update mutation
    // update({ scheduleId: template.id, name, description });

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

