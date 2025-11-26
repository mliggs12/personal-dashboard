"use client"

import { useState } from "react";
import { useMutation } from "convex/react";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

import { completeTask } from "../../tasks/actions";

import AddSubtaskForm from "./add-subtask-form";
import Task from "./task";

interface TaskWithSubtasks extends Doc<"tasks"> {
  subtasks: TaskWithSubtasks[];
}

interface HierarchicalTaskItemProps {
  task: TaskWithSubtasks;
  level: number;
  onTaskChange: (task: Doc<"tasks">) => void;
}

function HierarchicalTaskItem({ task, level, onTaskChange }: HierarchicalTaskItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showAddSubtask, setShowAddSubtask] = useState(false);

  const hasSubtasks = task.subtasks && task.subtasks.length > 0;
  const completedSubtasks = task.subtasks?.filter(subtask => subtask.completed !== undefined).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;

  const indentLevel = level * 24; // 24px per level

  return (
    <div className="w-full">
      {/* Main Task */}
      <div 
        className={cn(
          "flex items-center w-full",
          level > 0 && "border-l-2 border-muted"
        )}
        style={{ paddingLeft: `${indentLevel}px` }}
      >
        <div className="flex items-center gap-2 w-full">
          {/* Expand/Collapse Button */}
          {hasSubtasks && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-secondary"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          )}
          
          {/* Task Component */}
          <div className="flex-1">
            <Task
              data={task}
              isCompleted={task.completed !== undefined}
              handleOnChange={() => onTaskChange(task)}
            />
          </div>

          {/* Add Subtask Button */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 hover:bg-secondary"
            onClick={() => setShowAddSubtask(!showAddSubtask)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Progress Indicator for Parent Tasks */}
      {hasSubtasks && (
        <div 
          className="text-xs text-muted-foreground mb-2"
          style={{ paddingLeft: `${indentLevel + 32}px` }}
        >
          {completedSubtasks}/{totalSubtasks} subtasks completed
        </div>
      )}

      {/* Add Subtask Form */}
      {showAddSubtask && (
        <div 
          className="mb-4 border-l-2 border-muted"
          style={{ paddingLeft: `${indentLevel + 24}px` }}
        >
          <AddSubtaskForm 
            parentTaskId={task._id}
            onCancel={() => setShowAddSubtask(false)}
            onSuccess={() => setShowAddSubtask(false)}
          />
        </div>
      )}

      {/* Subtasks */}
      {hasSubtasks && isExpanded && (
        <div className="space-y-0">
          {task.subtasks.map((subtask) => (
            <HierarchicalTaskItem
              key={subtask._id}
              task={subtask}
              level={level + 1}
              onTaskChange={onTaskChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface HierarchicalTaskListProps {
  tasks: TaskWithSubtasks[];
}

export default function HierarchicalTaskList({ tasks }: HierarchicalTaskListProps) {
  const { toast } = useToast();
  const unCompleteTask = useMutation(api.tasks.unCompleteTask);

  const handleOnChangeTask = (task: Doc<"tasks">) => {
    if (task.completed !== undefined) {
      unCompleteTask({ taskId: task._id });
    } else {
      completeTask(task._id);
      toast({
        title: "Task completed",
        description: "Appreciate yourself for completing the task!",
        duration: 1500,
      });
    }
  };

  return (
    <div className="space-y-0 w-full">
      {tasks.map((task) => (
        <div key={task._id} className="group">
          <HierarchicalTaskItem
            task={task}
            level={0}
            onTaskChange={handleOnChangeTask}
          />
        </div>
      ))}
    </div>
  );
}
