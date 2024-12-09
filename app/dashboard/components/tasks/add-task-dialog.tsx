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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import dayjs from "dayjs";
import { CalendarIcon, CheckCircleIcon, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import TaskNotes from "./task-notes";

export default function AddTaskDialog({ data }: { data: Doc<"tasks"> }) {
  const { name, updated, notes, status, priority, due, recurringTaskId, _id } =
    data;
  const recurringTask = useQuery(api.recurringTasks.get, {
    recurringTaskId: recurringTaskId as Id<"recurringTasks">,
  });
  const remove = useMutation(api.tasks.remove);
  const updateTask = useMutation(api.tasks.update);
  const updateRecurringTask = useMutation(api.recurringTasks.update);

  const { toast } = useToast();

  // State
  const [taskDue, setTaskDue] = useState<String | undefined>(due);
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

  return (
    <DialogContent className="max-w-4xl h-4/6 flex flex-col md:flex-row lg:justify-between text-right">
      <DialogHeader className="w-full">
        <DialogTitle className="text-xl">{name}</DialogTitle>
        <DialogDescription className="flex flex-col gap-4">
          <div className="flex gap-2">
            <p>Updated: {dayjs(updated).format("ddd MMM D [at] h:mm A")}</p>
          </div>
          <TaskNotes task={data} />
        </DialogDescription>
      </DialogHeader>
      <div className="flex flex-col gap-2 w-1/2">
        <div className="grid gap-2 p-2 py-4 border-b-2">
          <Label className="flex ml-2 items-start text-base">Due date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className={cn(
                  "mr-auto h-8 data-[state=open]:bg-accent",
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
        <div className="flex flex-col gap-2 p-2 py-4 border-b-2 text-left">
          <Label className="flex ml-2 items-start text-base">Status</Label>
          <Select
            onValueChange={handleStatusChange}
            defaultValue={taskStatus?.value}
          >
            <SelectTrigger className="w-fit h-8 gap-2 border-none hover:bg-secondary focus:ring-0 focus:ring-offset-0">
              <SelectValue placeholder="Select a status" />
            </SelectTrigger>
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
        <div className="grid gap-2 p-2 py-4 border-b-2 text-left">
          <Label className="flex ml-2 items-start text-base">Priority</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="mr-auto h-8 data-[state=open]:bg-accent"
              >
                {taskPriority?.icon}
                <span>{taskPriority?.label}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {priorities.map((priority, index) => (
                <DropdownMenuItem
                  key={index}
                  onSelect={() => handlePriorityChange(priority.value)}
                  className="gap-2"
                >
                  {priority.icon}
                  <span>{priority.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div
          className={cn(
            "hidden gap-2 p-2 py-4 border-b-2 text-left",
            recurringTaskId && "grid",
          )}
        >
          <Label className="flex ml-2 items-start text-base">Recurring</Label>
          <div className="flex justify-between gap-2">
            <Select
              onValueChange={handleFrequencyChange}
              defaultValue={recurFrequency?.value}
            >
              <SelectTrigger className="w-fit h-8 gap-2 border-none hover:bg-secondary focus:ring-0 focus:ring-offset-0">
                <SelectValue placeholder="Select a recur frequency" />
              </SelectTrigger>
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
              <SelectTrigger className="w-fit h-8 gap-2 border-none hover:bg-secondary focus:ring-0 focus:ring-offset-0">
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
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
        <div className="flex gap-2 p-4 w-full justify-end">
          <form onSubmit={(e) => handleDeleteTask(e)}>
            <Button
              size="icon"
              variant="ghost"
              type="submit"
            >
              <Trash2 className="w-5 h-5 text-destructive" />
            </Button>
          </form>
        </div>
      </div>
    </DialogContent>
  );
}
