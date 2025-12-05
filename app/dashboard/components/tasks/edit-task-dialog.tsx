import { useCallback, useEffect, useRef, useState } from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { useMutation, useQuery } from "convex/react";
import dayjs from "dayjs";
import { CalendarIcon, CheckCircleIcon, Trash2 } from "lucide-react";

import {
  frequencies,
  priorities,
  statuses,
} from "@/app/dashboard/tasks/data/data";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

import TiptapEditor from "../tiptap-editor";

export default function EditTaskDialog({ 
  data,
  onDeleteComplete,
}: { 
  data: Doc<"tasks">;
  onDeleteComplete?: () => void;
}) {
  const { name, notes, status, priority, due, recurringTaskId, _id } =
    data;
  const recurringTask = useQuery(api.recurringTasks.get, {
    recurringTaskId: recurringTaskId as Id<"recurringTasks">,
  });
  const remove = useMutation(api.tasks.remove);
  const updateTask = useMutation(api.tasks.update);
  const updateRecurringTask = useMutation(api.recurringTasks.update);
  const removeRecurringFromTask = useMutation(api.tasks.removeRecurringFromTask);
  const convertTaskToRecurring = useMutation(api.tasks.convertTaskToRecurring);

  const { toast } = useToast();

  const [taskDue, setTaskDue] = useState<string | undefined>(due);
  const [taskStatus, setTaskStatus] = useState(
    statuses.find((statusInfo) => statusInfo.value === status),
  );
  const [taskPriority, setTaskPriority] = useState(
    priorities.find((priorityInfo) => priorityInfo.value === priority),
  );
  const [recurFrequency, setRecurFrequency] = useState<
    (typeof frequencies)[number] | undefined
  >(undefined);
  const [recurType, setRecurType] = useState<
    "onSchedule" | "whenDone" | undefined
  >(undefined);
  const [calendarDate, setCalendarDate] = useState<Date | undefined>(
    taskDue ? dayjs(due, "YYYY-MM-DD").toDate() : undefined,
  );
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  // eslint-disable-next-line
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (recurringTask) {
      // Derive frequency from schedule.interval
      if (recurringTask.schedule?.interval) {
        const unit = recurringTask.schedule.interval.unit;
        const amount = recurringTask.schedule.interval.amount;
        let frequencyValue: string;
        if (unit === "day" && amount === 1) {
          frequencyValue = "daily";
        } else if (unit === "week" && amount === 1) {
          frequencyValue = "weekly";
        } else if (unit === "month" && amount === 1) {
          frequencyValue = "monthly";
        } else {
          frequencyValue = "none"; // Custom intervals not supported in UI yet
        }
        
        // eslint-disable-next-line
        setRecurFrequency(
          frequencies.find(
            (frequencyInfo) => frequencyInfo.value === frequencyValue,
          ),
        );
      }
       
      setRecurType(recurringTask.recurrenceType === "schedule" ? "onSchedule" : "whenDone");
    }
  }, [recurringTask]);



  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleChange = useCallback(
    (notes: string) => {
      setIsSaving(true);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        updateTask({ taskId: _id, notes }).then(() => setIsSaving(false));
      }, 2000);
    },
    [_id, updateTask, setIsSaving],
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleDeleteTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await remove({ taskId: _id });
      toast({
        title: "Task deleted",
        description: "The task has been successfully deleted.",
        duration: 3000,
      });
      // Close dialog after successful deletion
      onDeleteComplete?.();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to delete task: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleDueChange = (selectedDate: Date | undefined) => {
    setCalendarDate(selectedDate);
    setIsCalendarOpen(false);
    
    if (selectedDate === undefined) {
      // Use empty string to indicate clearing the date
      updateTask({
        taskId: _id,
        due: "",
      });
      setTaskDue(undefined);
      toast({
        title: "Due date cleared",
        duration: 3000,
      });
    } else if (selectedDate) {
      const formattedDate = dayjs(selectedDate).format("YYYY-MM-DD");
      // Normalize both dates for comparison (due is already YYYY-MM-DD from backend)
      const normalizedDue = due ? dayjs(due, "YYYY-MM-DD").format("YYYY-MM-DD") : undefined;
      
      if (formattedDate !== normalizedDue) {
        updateTask({
          taskId: _id,
          due: formattedDate,
        });
        setTaskDue(formattedDate);
        toast({
          title: "Due date updated",
          duration: 3000,
        });
      }
    }
  };

  const handleStatusChange = (status: string) => {
    updateTask({
      taskId: _id,
      status: status as
        | "backlog"
        | "todo"
        | "in_progress"
        | "done"
        | "archived",
    });
    setTaskStatus(statuses.find((statusInfo) => statusInfo.value === status));
  };

  const handlePriorityChange = (priority: string) => {
    updateTask({
      taskId: _id,
      priority: priority as "low" | "normal" | "high",
    });
    setTaskPriority(
      priorities.find((priorityInfo) => priorityInfo.value === priority),
    );
  };

  const handleFrequencyChange = async (frequency: string) => {
    try {
      // Case 1: User selected "none" - remove recurring
      if (frequency === "none" && recurringTaskId) {
        await removeRecurringFromTask({ taskId: _id });
        setRecurFrequency(undefined);
        toast({
          title: "Recurring removed",
          description: "This task is no longer part of a recurring series.",
          duration: 3000,
        });
      }
      // Case 2: User selected frequency but task is not recurring yet - convert to recurring
      else if (frequency !== "none" && !recurringTaskId) {
        await convertTaskToRecurring({
          taskId: _id,
          frequency: frequency as "daily" | "3-day" | "weekly" | "monthly",
          type: recurType || "whenDone", // Default to whenDone if not set
        });
        setRecurFrequency(
          frequencies.find((frequencyInfo) => frequencyInfo.value === frequency),
        );
        toast({
          title: "Recurring task created",
          description: "This task is now a recurring task.",
          duration: 3000,
        });
      }
      // Case 3: User changed frequency on existing recurring task - update recurring task
      else if (frequency !== "none" && recurringTaskId) {
        await updateRecurringTask({
          recurringTaskId: recurringTaskId as Id<"recurringTasks">,
          frequency: frequency as "daily" | "3-day" | "weekly" | "monthly",
        });
        setRecurFrequency(
          frequencies.find((frequencyInfo) => frequencyInfo.value === frequency),
        );
        toast({
          title: "Frequency updated",
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleTypeChange = async (type: "onSchedule" | "whenDone") => {
    if (!recurringTaskId) {
      toast({
        title: "Error",
        description: "This task is not a recurring task.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    try {
      await updateRecurringTask({
        recurringTaskId: recurringTaskId as Id<"recurringTasks">,
        recurrenceType: type === "onSchedule" ? "schedule" : "completion",
      });
      setRecurType(type);
      toast({
        title: "Recurring type updated",
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to update recurring type: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  if (notes === undefined)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin">Loading...</div>
      </div>
    );

  return (
    <DialogContent className="flex flex-col md:flex-row w-full md:max-w-4xl h-full md:h-auto p-4">
      <div className="flex flex-col gap-2 w-full md:w-4/6">
        <DialogTitle className="text-xl text-left">{name}</DialogTitle>
        <TiptapEditor initialContent={notes} onChange={handleChange} />
      </div>
      <div className="flex flex-col gap-1 w-full md:w-1/2 border-b-2 md:border-none space-y-2 pb-4">
        <div>
          <Label className="flex items-start text-lg">Due date</Label>
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className={cn(
                  "mr-auto pl-0 h-8 data-[state=open]:bg-accent text-base font-normal",
                  taskDue === undefined && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="w-4 h-4 capitalize" />
                {calendarDate ? (
                  dayjs(calendarDate).format("MMMM DD, YYYY")
                ) : (
                  <span>Pick a due date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0 z-[100] pointer-events-auto"
              align="start"
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <Calendar
                mode="single"
                selected={calendarDate}
                onSelect={handleDueChange}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div>
          <Label className="flex items-start text-lg">Status</Label>
          <Select
            onValueChange={handleStatusChange}
            defaultValue={taskStatus?.value}
          >
            <SelectPrimitive.Trigger className="w-fit h-8 pl-0 gap-2 border-none hover:bg-secondary focus:ring-0 focus:ring-offset-0">
              <SelectPrimitive.Value placeholder="Select a status" />
              <SelectPrimitive.Icon>
                <span></span>
              </SelectPrimitive.Icon>
            </SelectPrimitive.Trigger>
            <SelectContent>
              {statuses.map((item, index) => (
                <SelectItem
                  key={index}
                  value={item.value}
                >
                  <div className="flex items-center gap-2">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="flex items-start text-lg">Priority</Label>
          <Select
            onValueChange={handlePriorityChange}
            defaultValue={taskPriority?.value}
          >
            <SelectPrimitive.Trigger className="w-fit h-8 pl-0 gap-2 border-none hover:bg-secondary focus:ring-0 focus:ring-offset-0">
              <SelectPrimitive.Value placeholder="Select a priority" />
              <SelectPrimitive.Icon>
                <span></span>
              </SelectPrimitive.Icon>
            </SelectPrimitive.Trigger>
            <SelectContent>
              {priorities.map((item, index) => (
                <SelectItem
                  key={index}
                  value={item.value}
                >
                  <div className="flex items-center gap-2">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid">
          <Label className="flex items-start text-lg">Recurring</Label>
          <div className="flex justify-between">
            <Select
              onValueChange={handleFrequencyChange}
              defaultValue={recurFrequency?.value || "none"}
            >
              <SelectPrimitive.Trigger className="w-fit h-8 gap-2 border-none hover:bg-secondary focus:ring-0 focus:ring-offset-0">
                <SelectPrimitive.Value placeholder="Select a frequency" />
                <SelectPrimitive.Icon>
                  <span></span>
                </SelectPrimitive.Icon>
              </SelectPrimitive.Trigger>
              <SelectContent>
                {frequencies.map((item, index) => (
                  <SelectItem
                    key={index}
                    value={item.value}
                  >
                    <div className="flex items-center gap-2">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              onValueChange={handleTypeChange}
              value={recurType}
            >
              <SelectPrimitive.Trigger className="w-fit h-8 pl-0 gap-2 border-none hover:bg-secondary focus:ring-0 focus:ring-offset-0">
                <SelectPrimitive.Value placeholder="Select a type" />
                <SelectPrimitive.Icon>
                  <span></span>
                </SelectPrimitive.Icon>
              </SelectPrimitive.Trigger>
              <SelectContent>
                <SelectItem value="onSchedule">
                  <div className="flex items-center gap-2 text-nowrap">
                    <CalendarIcon className="text-primary w-4 h-4" />
                    <span>On schedule</span>
                  </div>
                </SelectItem>
                <SelectItem value="whenDone">
                  <div className="flex items-center gap-2 text-nowrap">
                    <CheckCircleIcon className="text-primary w-4 h-4" />
                    <span>When done</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <DialogFooter className="flex items-end">
        <form onSubmit={(e) => handleDeleteTask(e)}>
          <Button
            size="icon"
            variant="ghost"
            type="submit"
          >
            <Trash2 className="w-5 h-5 text-destructive" />
          </Button>
        </form>
      </DialogFooter>
    </DialogContent>
  );
}
