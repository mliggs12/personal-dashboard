"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { useMutation } from "convex/react";

import {
  Select,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useToast } from "@/hooks/use-toast";

import { statuses } from "../../tasks/data/data";

interface TaskStatusSelectProps {
  task: Doc<"tasks">;
  onSuccess?: () => void;
}

export function TaskStatusSelect({ task, onSuccess }: TaskStatusSelectProps) {
  const updateTask = useMutation(api.tasks.update);
  const { toast } = useToast();

  const currentStatus = statuses.find((s) => s.value === task.status);

  const handleStatusChange = async (status: string) => {
    try {
      await updateTask({
        taskId: task._id,
        status: status as
          | "backlog"
          | "todo"
          | "in_progress"
          | "done"
          | "archived",
      });

      toast({
        title: "Status updated",
        duration: 2000,
      });

      onSuccess?.();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      // Status update complete
    }
  };

  return (
    <Select
      value={task.status || "todo"}
      onValueChange={handleStatusChange}
    >
      <SelectPrimitive.Trigger className="flex items-center gap-2 border-none hover:bg-secondary focus:ring-0 focus:ring-offset-0 rounded px-2 py-1 whitespace-nowrap">
        {currentStatus?.icon}
        <span className="text-sm">{currentStatus?.label}</span>
      </SelectPrimitive.Trigger>
      <SelectContent>
        {statuses.map((item, index) => (
          <SelectItem key={index} value={item.value}>
            <div className="flex items-center gap-2">
              {item.icon}
              <span>{item.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

