import { priorities, statuses } from "@/app/tasks/data/data";
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
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useMutation } from "convex/react";
import dayjs from "dayjs";
import { CalendarIcon, Trash2 } from "lucide-react";
import { useState } from "react";
import TaskNotes from "./task-notes";

export default function AddTaskDialog({ data }: { data: Doc<"tasks"> }) {
  const { name, updated, notes, status, priority, due, _id } = data;

  const remove = useMutation(api.tasks.remove);
  const updateDue = useMutation(api.tasks.updateDue);
  const updateStatus = useMutation(api.tasks.updateStatus);
  const updatePriority = useMutation(api.tasks.updatePriority);

  const { toast } = useToast();

  const [taskDue, setTaskDue] = useState<String | undefined>(due);
  const [taskStatus, setTaskStatus] = useState(
    statuses.find((statusInfo) => statusInfo.value === status),
  );
  const [taskPriority, setTaskPriority] = useState(
    priorities.find((priorityInfo) => priorityInfo.value === priority),
  );

  const [calendarDate, setCalendarDate] = useState<Date | undefined>(
    taskDue ? dayjs(due).toDate() : undefined,
  );

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
      updateDue({
        taskId: _id,
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
      updateDue({
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
    updateStatus({
      taskId: _id,
      status: status as
        | "backlog"
        | "todo"
        | "in_progress"
        | "done"
        | "cancelled"
        | "archived",
    });
    setTaskStatus(statuses.find((statusInfo) => statusInfo.value === status));
  };

  const handlePriorityChange = (priority: string) => {
    updatePriority({
      taskId: _id,
      priority: priority as "low" | "normal" | "high",
    });
    setTaskPriority(
      priorities.find((priorityInfo) => priorityInfo.value === priority),
    );
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
          <Label className="flex ml-3 items-start text-base">Due date</Label>
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
        <div className="grid gap-2 p-2 py-4 border-b-2 text-left">
          <Label className="flex ml-3 items-start text-base">Status</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="mr-auto h-8 data-[state=open]:bg-accent"
              >
                {taskStatus?.icon}
                <span>{taskStatus?.label}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {statuses.map((status, index) => (
                <DropdownMenuItem
                  key={index}
                  onSelect={() => handleStatusChange(status.value)}
                  className="gap-2"
                >
                  {status.icon}
                  <span>{status.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="grid gap-2 p-2 py-4 border-b-2 text-left">
          <Label className="flex ml-3 items-start text-base">Priority</Label>
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
