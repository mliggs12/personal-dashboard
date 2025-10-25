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

import { priorities } from "../../tasks/data/data";

interface TaskPrioritySelectProps {
  task: Doc<"tasks">;
  onSuccess?: () => void;
}

export function TaskPrioritySelect({ task, onSuccess }: TaskPrioritySelectProps) {
  const updateTask = useMutation(api.tasks.update);
  const { toast } = useToast();

  const currentPriority = priorities.find((p) => p.value === task.priority);

  const handlePriorityChange = async (priority: string) => {
    try {
      await updateTask({
        taskId: task._id,
        priority: priority as "low" | "normal" | "high",
      });

      toast({
        title: "Priority updated",
        duration: 2000,
      });

      onSuccess?.();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update priority.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      // Priority update complete
    }
  };

  return (
    <Select
      value={task.priority || "normal"}
      onValueChange={handlePriorityChange}
    >
      <SelectPrimitive.Trigger className="flex items-center gap-2 border-none hover:bg-secondary focus:ring-0 focus:ring-offset-0 rounded px-2 py-1 whitespace-nowrap">
        {currentPriority?.icon}
        <span className="text-sm">{currentPriority?.label}</span>
      </SelectPrimitive.Trigger>
      <SelectContent>
        {priorities.map((item, index) => (
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

