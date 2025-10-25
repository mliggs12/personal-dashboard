"use client";

import * as React from "react";
import { useMutation } from "convex/react";
import dayjs from "dayjs";
import { CalendarIcon, XIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface TaskDueDatePickerProps {
  task: Doc<"tasks">;
  onSuccess?: () => void;
}

export function TaskDueDatePicker({ task, onSuccess }: TaskDueDatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [calendarDate, setCalendarDate] = React.useState<Date | undefined>(
    task.due ? dayjs(task.due, "YYYY/MM/DD").toDate() : undefined
  );

  const updateTask = useMutation(api.tasks.update);
  const { toast } = useToast();

  const handleDueChange = async (selectedDate: Date | undefined) => {
    setCalendarDate(selectedDate);
    setIsOpen(false);

    try {
      if (selectedDate === undefined) {
        await updateTask({
          taskId: task._id,
          due: "",
        });
        toast({
          title: "Due date cleared",
          duration: 2000,
        });
      } else {
        const formattedDate = dayjs(selectedDate).format("YYYY/MM/DD");
        await updateTask({
          taskId: task._id,
          due: formattedDate,
        });
        toast({
          title: "Due date updated",
          duration: 2000,
        });
      }

      onSuccess?.();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update due date.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      // Due date update complete
    }
  };

  const handleClearDate = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleDueChange(undefined);
  };

  if (!task.due) {
    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-muted-foreground hover:text-foreground"
          >
            <CalendarIcon className="mr-2 h-3 w-3" />
            Set date
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={calendarDate}
            onSelect={handleDueChange}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    );
  }

  const dueDate = dayjs(task.due, "YYYY/MM/DD");
  const isOverdue = dueDate.isBefore(dayjs(), "day");
  const isToday = dueDate.isSame(dayjs(), "day");

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-7 px-2 gap-1 hover:bg-secondary group",
            "relative"
          )}
        >
          <Badge
            variant={isOverdue ? "destructive" : isToday ? "default" : "outline"}
            className="font-normal pointer-events-none"
          >
            {dueDate.format("MMM D")}
          </Badge>
          <XIcon
            className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleClearDate}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={calendarDate}
          onSelect={handleDueChange}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

