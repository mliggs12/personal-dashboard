import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { Text } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  name: z.string().min(1, { message: "Project Name is required" }),
  notes: z.string().optional(),
});

export function AddProjectForm({ className }: React.ComponentProps<"form">) {
  const { toast } = useToast();

  const create = useMutation(api.projects.create);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      notes: "",
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    const { name, notes } = data;

    await create({ name, notes });

    toast({
      title: `Project ${name} created successfully`,
      duration: 3000,
    });
    form.reset();
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("p-2 px-3 pt-4", className)}
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  id="name"
                  type="text"
                  placeholder="Project Name"
                  autoComplete="off"
                  autoFocus
                  required
                  className="pl-0 border-none text-lg focus-visible:ring-0 focus-visible:ring-offset-0"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="flex items-start gap-2">
                  <Text className="ml-auto h-4 w-4 opacity-50" />
                  <Textarea
                    placeholder="Notes"
                    className="min-h-[1em] p-0 text-base resize-none border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    {...field}
                  />
                </div>
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex flex-1 w-full justify-end">
          <Button
            disabled={!form.getValues("name")}
            size="sm"
            type="submit"
            variant="ghost"
          >
            Save
          </Button>
        </div>
      </form>
    </Form>
  );
}
