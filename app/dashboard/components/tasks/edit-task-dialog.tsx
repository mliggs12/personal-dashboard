import { useCallback, useEffect, useRef, useState } from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { useMutation } from "convex/react";
import dayjs from "dayjs";
import { CalendarIcon, Repeat, Trash2 } from "lucide-react";

import {
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
import { Doc } from "@/convex/_generated/dataModel";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

import TiptapEditor from "../tiptap-editor";
import { useRecurrenceText } from "./hooks/use-recurrence-text";

export default function EditTaskDialog({ 
  data,
  onDeleteComplete,
}: { 
  data: Doc<"tasks">;
  onDeleteComplete?: () => void;
}) {
  const { name, notes, status, priority, due, _id, recurringTaskId } =
    data;
  const remove = useMutation(api.tasks.remove);
  const updateTask = useMutation(api.tasks.update);

  const { toast } = useToast();

  const [taskDue, setTaskDue] = useState<string | undefined>(due);
  const [taskStatus, setTaskStatus] = useState(
    statuses.find((statusInfo) => statusInfo.value === status),
  );
  const [taskPriority, setTaskPriority] = useState(
    priorities.find((priorityInfo) => priorityInfo.value === priority),
  );
  const [calendarDate, setCalendarDate] = useState<Date | undefined>(
    taskDue ? dayjs(due, "YYYY-MM-DD").toDate() : undefined,
  );
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  // eslint-disable-next-line
  const [isSaving, setIsSaving] = useState(false);

  const timeoutRef = useRef<NodeJS.Timeout>(undefined);

  // Get formatted recurrence text
  const recurrenceText = useRecurrenceText(recurringTaskId, taskDue);

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
          {recurrenceText && (
            <div className="flex items-center gap-2 mt-1">
              <Repeat className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {recurrenceText}
              </span>
            </div>
          )}
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
