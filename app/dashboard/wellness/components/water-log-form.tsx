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
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface WaterLogFormProps extends React.ComponentProps<"form"> {
  className?: string;
  onEntryCreated: () => void;
}

const formSchema = z.object({
  amount: z.coerce.number().min(1, {
    message: "Amount must be at least 1 oz.",
  }),
  type: z.string().optional(),
});

export default function WaterLogForm({
  className,
  onEntryCreated,
}: WaterLogFormProps) {
  const { toast } = useToast();

  const createEntry = useMutation(api.waterLogEntries.create);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 16,
      type: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { amount, type } = values;

    await createEntry({ amount, type });
    onEntryCreated();
    toast({
      title: "Water logged",
      duration: 1500,
    });
    form.reset();
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("flex flex-col gap-4 pt-4 px-4", className)}
      >
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount consumed</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
