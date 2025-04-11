import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";


const formSchema = z
  .object({
    startStatement: z.string().min(1, { message: "Please tell me what's bothering you?" }),
    endStatement: z.string().min(1, { message: "Please tell me what you would rather want or feel?" }),
  })

export function AddFbForm({ className }: React.ComponentProps<"form">) {
  const createFb = useMutation(api.focusBlocks.create)
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      startStatement: "",
      endStatement: "",
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    const { startStatement, endStatement } = data;

    await createFb({ startStatement, endStatement })

    toast({
      title: "FB created",
      duration: 1500,
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
          name="startStatement"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  id="startStatement"
                  type="text"
                  placeholder="What is bothering me?"
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
          name="endStatement"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  id="endStatement"
                  type="text"
                  placeholder="How do I want to feel instead?"
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


        <div className="flex w-full justify-end">
          <Button
            disabled={!form.getValues("startStatement") || !form.getValues("endStatement")}
            size="sm"
            type="submit"
            variant="secondary"
          >
            Save
          </Button>
        </div>
      </form>
    </Form>
  );
}
