import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import dayjs from "dayjs";
import { CalendarIcon, Text } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { priorities, statuses } from "@/app/dashboard/tasks/data/data";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

import { createRecurringTask } from "../../tasks/actions";

const formSchema = z
  .object({
    name: z.string().min(1, { message: "Name is required" }),
    status: z.enum(
      statuses.map((status) => status.value) as [string, ...string[]],
    ),
    priority: z.enum(
      priorities.map((priority) => priority.value) as [string, ...string[]],
    ),
    notes: z.string().optional(),
    due: z.date().optional(),
    frequency: z
      .enum(["daily", "3-day", "weekly", "monthly"])
      .optional(),
    type: z.enum(["onSchedule", "whenDone"]).optional(),
  })
  .refine(
    (data) => {
      if (data.frequency && !data.due) {
        return false;
      }
      return true;
    },
    {
      message: "Due date is required when recurring is set",
      path: ["due"],
    },
  );

interface AddTaskFormProps extends React.ComponentProps<"form"> {
  onSuccess?: () => void;
}

export function AddTaskForm({ className, onSuccess }: AddTaskFormProps) {
  const [showRecurring, setShowRecurring] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const createTask = useMutation(api.tasks.create);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      status: "todo",
      priority: "normal",
      notes: "",
      due: undefined,
    },
  });

  const handleSetRecurring = () => {
    if (!showRecurring) {
      form.setValue("frequency", "daily");
      form.setValue("type", "whenDone");
      if (!form.getValues("due")) {
        form.setValue("due", new Date());
      }
    } else {
      form.setValue("frequency", undefined);
      form.setValue("type", undefined);
    }
    setShowRecurring(!showRecurring);
  };

  async function onSubmit(data: z.infer<typeof formSchema>) {
    const { name, status, priority, notes, due, frequency, type } = data;

    const dueDate = dayjs(due).format("YYYY-MM-DD");

    if (frequency && due && type) {
      const recurringTaskId = await createRecurringTask(
        name,
        priority,
        dueDate,
        frequency,
        type,
      );

      await createTask({
        name,
        status: status as
          | "done"
          | "backlog"
          | "todo"
          | "in_progress"
          | "archived",
        priority: priority as "low" | "normal" | "high",
        notes,
        due: dueDate,
        recurringTaskId,
      });
    } else {
      await createTask({
        name,
        status: status as
          | "done"
          | "backlog"
          | "todo"
          | "in_progress"
          | "archived",
        priority: priority as "low" | "normal" | "high",
        notes,
        due: due ? dueDate : undefined,
      });
    }

    toast({
      title: "Task added",
      duration: 3000,
    });
    form.reset();
    onSuccess?.();
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
                  placeholder="New task"
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
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <FormField
              control={form.control}
              name="due"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "flex gap-2 w-[135px] text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value ? (
                            dayjs(field.value).format("ddd, MMM D")
                          ) : (
                            <span>Due date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0 z-[100] pointer-events-auto"
                      align="start"
                      onOpenAutoFocus={(e) => e.preventDefault()}
                    >
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          field.onChange(date);
                          setIsDatePickerOpen(false);
                        }}
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
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <Select
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger className="gap-2">
                        <SelectValue placeholder="Select a priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {priorities.map((item, idx) => (
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
          <div className="flex gap-2 items-center">
            <Button
              size="lg"
              variant="outline"
              type="button"
              className="h-10"
              onClick={handleSetRecurring}
            >
              {showRecurring ? "Cancel" : "Set Recurring"}
            </Button>
            {showRecurring && (
              <>
                <FormField
                  control={form.control}
                  name="frequency"
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="gap-2">
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="3-day">3-Day</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="gap-2">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="whenDone">When done</SelectItem>
                          <SelectItem value="onSchedule">
                            On schedule
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </>
            )}
            <div className="flex w-full justify-end">
              <Button
                disabled={!form.getValues("name")}
                size="sm"
                type="submit"
                variant="ghost"
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
