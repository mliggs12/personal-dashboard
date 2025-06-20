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
import { Id } from "@/convex/_generated/dataModel";

const formSchema = z.object({
  name: z.string().min(1, { message: "Activity name is required" }),
  length: z.number().min(1, { message: "Length is required" }),
});

interface AddActivityFormProps {
  scheduleId: Id<"schedules">;
  className?: string;
}

export function AddActivityForm({ scheduleId, className }: AddActivityFormProps) {
  const { toast } = useToast();

  const create = useMutation(api.activities.create);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      length: 25
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    const { name, length } = data;

    create({ name, length, scheduleId });

    toast({
      title: `Activity ${name} created successfully`,
      duration: 1500,
    });
    form.reset();

  }

  return (
    <Form {...form}>
      <form
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
          name="length"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Length</FormLabel>
              <FormControl>
                <Input
                  id="length"
                  type="number"
                  autoComplete="off"
                  {...field}
                  onChange={e => field.onChange(e.target.valueAsNumber)}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit">Save</Button>
      </form>
    </Form>
  );
}
