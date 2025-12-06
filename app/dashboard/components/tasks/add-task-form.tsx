import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import dayjs from "dayjs";
import { CalendarIcon, RotateCcw, Text, X } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
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
import { RecurDialog } from "./recurring/recur-dialog";
import { formatDaysOfWeek, getDayNameFromDate, getDayOfMonthFromDate, formatDayOfMonth, getMonthNameFromDate } from "./recurring/recurrence-utils";

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
      .enum(["none", "daily", "weekly", "monthly", "yearly", "weekday", "custom"])
      .optional(),
    recurrenceType: z.enum(["schedule", "completion"]).optional(),
    customInterval: z
      .object({
        amount: z.number().min(1),
        unit: z.enum(["day", "week", "month", "year"]),
        daysOfWeek: z.array(z.number()).optional(),
      })
      .optional(),
  })
  .refine(
    (data) => {
      // Only require due date for completion-type recurring tasks
      if (data.frequency && data.frequency !== "none" && data.recurrenceType === "completion" && !data.due) {
        return false;
      }
      return true;
    },
    {
      message: "Due date is required for completion-based recurring tasks",
      path: ["due"],
    },
  );

interface AddTaskFormProps extends React.ComponentProps<"form"> {
  onSuccess?: () => void;
}

export function AddTaskForm({ className, onSuccess }: AddTaskFormProps) {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isRecurDialogOpen, setIsRecurDialogOpen] = useState(false);
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

  // Watch frequency and customInterval to update display reactively
  const frequency = useWatch({ control: form.control, name: "frequency" });
  const customInterval = useWatch({ control: form.control, name: "customInterval" });
  const recurrenceType = useWatch({ control: form.control, name: "recurrenceType" });
  const dueDate = useWatch({ control: form.control, name: "due" });

  const handleClearRecur = (e: React.MouseEvent) => {
    e.stopPropagation();
    form.setValue("frequency", undefined);
    form.setValue("recurrenceType", undefined);
    form.setValue("customInterval", undefined);
  };

  const getRecurButtonText = () => {
    // Helper to get reference date (due date or today) - only used when custom is NOT set
    const getReferenceDate = () => {
      return dueDate || new Date();
    };
    
    const isCompletion = recurrenceType === "completion";
    const afterCompletion = isCompletion ? " after completion" : "";
    
    if (frequency === "custom" && customInterval) {
      const { amount, unit, daysOfWeek } = customInterval;
      
      // Special handling for weekly with days - show the actual selected days
      if (unit === "week" && daysOfWeek && daysOfWeek.length > 0) {
        if (isCompletion) {
          if (amount === 1) {
            return `1 week after completion`;
          } else {
            return `${amount} weeks after completion`;
          }
        }
        const selectedDayNames = formatDaysOfWeek(daysOfWeek);
        if (amount === 1) {
          return `Weekly on ${selectedDayNames}`;
        } else {
          return `Every ${amount} weeks on ${selectedDayNames}`;
        }
      }
      
      // For monthly/yearly custom intervals, use today (no specific day selected)
      const today = new Date();
      if (unit === "month" && amount === 1) {
        if (isCompletion) {
          return `1 month after completion`;
        }
        const dayOfMonth = getDayOfMonthFromDate(today);
        return `Monthly (${formatDayOfMonth(dayOfMonth)})`;
      }
      
      if (unit === "year" && amount === 1) {
        if (isCompletion) {
          return `1 year after completion`;
        }
        const month = getMonthNameFromDate(today);
        const day = getDayOfMonthFromDate(today);
        return `Yearly (on ${month} ${day})`;
      }
      
      // For other units or weekly without specific days
      const unitLabel = unit === "day" ? "day" : unit === "week" ? "week" : unit === "month" ? "month" : "year";
      const pluralUnit = amount !== 1 ? `${unitLabel}s` : unitLabel;
      return `${amount} ${pluralUnit}${afterCompletion}`;
    }

    // When custom is NOT set, use due date (or today) for labels
    switch (frequency) {
      case "daily":
        return isCompletion ? "Daily after completion" : "Daily";
      case "weekly":
        if (isCompletion) {
          return "1 week after completion";
        }
        const refDateWeekly = getReferenceDate();
        return `Weekly on ${getDayNameFromDate(refDateWeekly)}`;
      case "monthly":
        if (isCompletion) {
          return "1 month after completion";
        }
        const refDateMonthly = getReferenceDate();
        const dayOfMonth = getDayOfMonthFromDate(refDateMonthly);
        return `Monthly (${formatDayOfMonth(dayOfMonth)})`;
      case "yearly":
        if (isCompletion) {
          return "1 year after completion";
        }
        const refDateYearly = getReferenceDate();
        const month = getMonthNameFromDate(refDateYearly);
        const day = getDayOfMonthFromDate(refDateYearly);
        return `Yearly (on ${month} ${day})`;
      case "weekday":
        return isCompletion ? "Every Weekday after completion" : "Every Weekday";
      default:
        // Use due date or today for preview when no frequency is set
        const refDateDefault = getReferenceDate();
        return `Weekly on ${getDayNameFromDate(refDateDefault)}`;
    }
  };

  async function onSubmit(data: z.infer<typeof formSchema>) {
    const { name, status, priority, notes, due, frequency, recurrenceType, customInterval } = data;

    const dueDate = due ? dayjs(due).format("YYYY-MM-DD") : undefined;

    // Handle recurring tasks
    if (frequency && frequency !== "none" && recurrenceType) {
      let interval: { amount: number; unit: "day" | "week" | "month" };
      let daysOfWeek: number[] | undefined;

      if (frequency === "custom" && customInterval) {
        // Map "year" to "month" * 12 for backend compatibility
        if (customInterval.unit === "year") {
          interval = {
            amount: customInterval.amount * 12,
            unit: "month",
          };
        } else {
          interval = {
            amount: customInterval.amount,
            unit: customInterval.unit as "day" | "week" | "month",
          };
        }
        daysOfWeek = customInterval.daysOfWeek;
      } else if (frequency === "weekday") {
        // Every weekday = Mon-Fri (1-5)
        interval = { amount: 1, unit: "week" };
        daysOfWeek = [1, 2, 3, 4, 5];
      } else if (frequency === "yearly") {
        // Yearly = 12 months
        interval = { amount: 12, unit: "month" };
      } else {
        const unit = (frequency === "daily" ? "day" : frequency === "weekly" ? "week" : "month") as "day" | "week" | "month";
        interval = { amount: 1, unit };
        // If weekly and we have customInterval with days, use those
        if (frequency === "weekly" && customInterval?.unit === "week" && customInterval?.daysOfWeek) {
          daysOfWeek = customInterval.daysOfWeek;
        }
      }

      const recurringTaskId = await createRecurringTask(
        name,
        {
          interval,
          daysOfWeek,
        },
        recurrenceType,
      );

      // For scheduled tasks: only create task instance if due date is provided
      // For completion tasks: due date is required (enforced by validation)
      if (recurrenceType === "schedule" && dueDate) {
        // User provided a due date, create the task instance
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
      } else if (recurrenceType === "completion" && dueDate) {
        // Completion tasks always need a due date (enforced by validation)
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
      }
      // If scheduled task with no due date, just create the recurring task
      // The task generation system will create instances based on schedule
    } else {
      // Non-recurring task
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
          <div className="flex gap-1 md:gap-8 items-center">
            <Button
              size="lg"
              variant="outline"
              type="button"
              className={cn(
                "h-10 w-full flex items-center relative px-4 pr-8",
                frequency ? "justify-between" : "justify-start gap-2"
              )}
              onClick={() => {
                setIsRecurDialogOpen(true);
              }}
            >
              <div className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4" />
                <span>Recur</span>
              </div>
              {frequency && (
                <>
                  <span className="text-muted-foreground">{getRecurButtonText()}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 absolute right-1 hover:bg-transparent"
                    onClick={handleClearRecur}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              )}
            </Button>
            <RecurDialog
              open={isRecurDialogOpen}
              onOpenChange={setIsRecurDialogOpen}
              onSave={(data) => {
                if (data.frequency === "none") {
                  form.setValue("frequency", undefined);
                  form.setValue("recurrenceType", undefined);
                  form.setValue("customInterval", undefined);
                } else {
                  form.setValue("frequency", data.frequency);
                  form.setValue("recurrenceType", data.recurrenceType);
                  form.setValue("customInterval", data.customInterval);
                  // Set due date to today if not already set when any recurrence option is selected
                  if (!form.getValues("due")) {
                    form.setValue("due", new Date());
                  }
                }
              }}
              initialData={{
                frequency: form.getValues("frequency"),
                recurrenceType: form.getValues("recurrenceType"),
                customInterval: form.getValues("customInterval"),
              }}
              currentDueDate={dueDate}
              onSetDueDate={(date) => {
                form.setValue("due", date);
              }}
            />
            <div className="flex flex-1 justify-end">
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