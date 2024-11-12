"use client";

import { Dispatch, SetStateAction } from "react";
import { useMutation } from "convex/react";
import { format } from "date-fns";
import { CalendarIcon, Text } from "lucide-react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CardFooter } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";

import { api } from "@/convex/_generated/api";

import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import { statuses } from "@/app/tasks/data/data";
import {
  Select,
  SelectTrigger,
  SelectItem,
  SelectContent,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  due: z.date().optional(),
  notes: z.string().optional(),
  status: z.enum(
    statuses.map((status) => status.value) as [string, ...string[]],
  ),
});

export default function AddTaskInline({
  setShowAddTask,
}: {
  setShowAddTask: Dispatch<SetStateAction<boolean>>;
}) {
  const { toast } = useToast();
  const createTask = useMutation(api.tasks.create);

  const defaultValues = {
    name: "",
    due: undefined,
    notes: "",
    status: "todo",
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    const { name, due, notes, status } = data;

    await createTask({
      name,
      due: due ? dayjs(due).format("YYYY/MM/DD") : undefined,
      status: status as
        | "backlog"
        | "todo"
        | "in_progress"
        | "done"
        | "cancelled"
        | "archived",
      notes,
    });

    toast({
      title: "Task added",
      duration: 1500,
    });
    form.reset({ ...defaultValues });
    setShowAddTask(false);
  }

  return (
    <div className="w-full">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-2 border-2 p-2 my-2 rounded-xl px-3 pt-4"
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
                    placeholder="Task name"
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
          <div className="flex gap-2">
            <FormField
              control={form.control}
              name="due"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "flex gap-2 w-[240px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a due date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0"
                      align="start"
                    >
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="gap-2">
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {statuses.map((item, idx) => (
                        <SelectItem
                          key={idx}
                          value={item.value}
                        >
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <CardFooter className="flex flex-col lg:flex-row lg:justify-between gap-2 border-t-2 pt-3">
            <div className="w-full" />
            <div className="flex gap-3 self-end">
              <Button
                className="bg-secondary text-secondary-foreground px-6 hover:bg-secondary/90"
                variant={"outline"}
                onClick={() => setShowAddTask(false)}
              >
                Cancel
              </Button>
              <Button
                className="px-6"
                type="submit"
              >
                Add Task
              </Button>
            </div>
          </CardFooter>
        </form>
      </Form>
    </div>
  );
}
