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
  DialogDescription,
  DialogFooter,
  DialogHeader,
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

export default function EditTaskDialog({ data }: { data: Doc<"tasks"> }) {
  const { name, updated, notes, status, priority, due, recurringTaskId, _id } =
    data;
  const recurringTask = useQuery(api.recurringTasks.get, {
    recurringTaskId: recurringTaskId as Id<"recurringTasks">,
  });
  const remove = useMutation(api.tasks.remove);
  const updateTask = useMutation(api.tasks.update);
  const updateRecurringTask = useMutation(api.recurringTasks.update);

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
    taskDue ? dayjs(due).toDate() : undefined,
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (recurringTask) {
      setRecurFrequency(
        frequencies.find(
          (frequencyInfo) => frequencyInfo.value === recurringTask.frequency,
        ),
      );
      setRecurType(recurringTask.type);
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
    [_id, updateTask],
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleDeleteTask = (e: any) => {
    e.preventDefault();
    const deletedId = remove({ taskId: _id });
    if (deletedId !== undefined) {
      toast({
        title: "🗑️ Successfully deleted",
        duration: 3000,
      });
    }
  };

  const handleDueChange = () => {
    if (calendarDate === undefined && due !== undefined) {
      updateTask({
        taskId: _id,
        due: calendarDate,
      });
      setTaskDue(calendarDate);
      toast({
        title: "Due date updated",
        duration: 3000,
      });
    } else if (
      calendarDate &&
      dayjs(calendarDate).format("YYYY/MM/DD") !== due
    ) {
      updateTask({
        taskId: _id,
        due: dayjs(calendarDate).format("YYYY/MM/DD"),
      });
      setTaskDue(dayjs(calendarDate).format("YYYY/MM/DD"));
      toast({
        title: "Due date updated",
        duration: 3000,
      });
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

  const handleFrequencyChange = (frequency: string) => {
    updateRecurringTask({
      recurringTaskId: recurringTaskId as Id<"recurringTasks">,
      frequency: frequency as "daily" | "3-day" | "weekly" | "monthly",
    });
    setRecurFrequency(
      frequencies.find((frequencyInfo) => frequencyInfo.value === frequency),
    );
  };

  const handleTypeChange = (type: "onSchedule" | "whenDone") => {
    updateRecurringTask({
      recurringTaskId: recurringTaskId as Id<"recurringTasks">,
      type: type as "onSchedule" | "whenDone",
    });
    setRecurType(type);
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
          <Popover>
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
              className="w-auto p-0"
              align="start"
              onFocusOutside={() => handleDueChange()}
            >
              <Calendar
                mode="single"
                selected={calendarDate}
                onSelect={setCalendarDate}
                initialFocus
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
        <div className={cn("hidden", recurringTaskId && "grid")}>
          <Label className="flex items-start text-lg">Recurring</Label>
          <div className="flex justify-between">
            <Select
              onValueChange={handleFrequencyChange}
              defaultValue={recurFrequency?.value}
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
