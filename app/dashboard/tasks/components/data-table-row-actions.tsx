"use client";

import { useState } from "react";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Row } from "@tanstack/react-table";
import { useMutation, useQuery } from "convex/react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useToast } from "@/hooks/use-toast";

import EditTaskDialog from "../../components/tasks/edit-task-dialog";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const task = row.original as Doc<"tasks">;
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const createTask = useMutation(api.tasks.create);
  const completeTask = useMutation(api.tasks.completeTask);
  const unCompleteTask = useMutation(api.tasks.unCompleteTask);
  const removeTask = useMutation(api.tasks.remove);
  const subtasks = useQuery(api.tasks.getSubtasks, { parentTaskId: task._id });

  const handleDuplicate = async () => {
    try {
      // Create the main task
      const newTaskId = await createTask({
        name: `${task.name} (copy)`,
        status: task.status,
        priority: task.priority,
        notes: task.notes,
        due: task.due,
        intentionId: task.intentionId,
        parentTaskId: task.parentTaskId,
      });
      
      // Duplicate subtasks if they exist
      if (subtasks && subtasks.length > 0 && newTaskId) {
        // Recursively duplicate all subtasks
        const duplicateSubtasks = async (parentId: string, newParentId: string) => {
          // Get all direct subtasks of the current parent
          const directSubtasks = subtasks.filter(
            (st) => st.parentTaskId?.toString() === parentId
          );
          
          for (const subtask of directSubtasks) {
            const newSubtaskId = await createTask({
              name: `${subtask.name} (copy)`,
              status: subtask.status,
              priority: subtask.priority,
              notes: subtask.notes,
              due: subtask.due,
              intentionId: subtask.intentionId,
              parentTaskId: newParentId as Id<"tasks">,
            });
            
            // Recursively duplicate nested subtasks
            if (newSubtaskId) {
              await duplicateSubtasks(subtask._id, newSubtaskId);
            }
          }
        };
        
        await duplicateSubtasks(task._id, newTaskId);
      }
      
      toast({
        title: "Task duplicated",
        description: subtasks && subtasks.length > 0 
          ? `Task and ${subtasks.length} subtask(s) duplicated successfully.`
          : "The task has been successfully duplicated.",
        duration: 3000,
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to duplicate task.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      // Task duplication complete
    }
  };

  const handleToggleComplete = async () => {
    try {
      if (task.completed !== undefined) {
        await unCompleteTask({ taskId: task._id });
        toast({
          title: "Task marked as todo",
          duration: 2000,
        });
      } else {
        await completeTask({ taskId: task._id });
        toast({
          title: "Task completed",
          description: "Great work! 🎉",
          duration: 2000,
        });
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      // Task toggle complete
    }
  };

  const handleDelete = async () => {
    try {
      await removeTask({ taskId: task._id });
      toast({
        title: "Task deleted",
        description: "The task has been permanently deleted.",
        duration: 3000,
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete task.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      // Task deletion complete
    }
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsEditDialogOpen(open);
    // Ensure dropdown is closed when dialog opens/closes
    if (!open) {
      setIsDropdownOpen(false);
    }
  };

  return (
    <>
      <Dialog open={isEditDialogOpen} onOpenChange={handleDialogOpenChange}>
        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
            >
              <DotsHorizontalIcon className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px]">
            <DropdownMenuItem 
              onClick={() => {
                setIsDropdownOpen(false);
                setIsEditDialogOpen(true);
              }}
            >
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDuplicate}>
              Make a copy
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleToggleComplete}>
              {task.completed !== undefined ? "Mark as todo" : "Mark as done"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem className="text-destructive">
                  Delete
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the
                    task &quot;{task.name}&quot;.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
        <EditTaskDialog 
          data={task} 
          onDeleteComplete={() => setIsEditDialogOpen(false)}
        />
      </Dialog>

    </>
  );
}

