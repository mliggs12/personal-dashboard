"use client"

import { useState } from "react";
import { useMutation } from "convex/react";
import { Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useToast } from "@/hooks/use-toast";

interface AddSubtaskFormProps {
  parentTaskId: Id<"tasks">;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function AddSubtaskForm({ parentTaskId, onCancel, onSuccess }: AddSubtaskFormProps) {
  const [taskName, setTaskName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const createTask = useMutation(api.tasks.create);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!taskName.trim()) return;

    setIsSubmitting(true);
    
    try {
      await createTask({
        name: taskName.trim(),
        status: "todo",
        priority: "normal",
        parentTaskId,
      });

      toast({
        title: "Subtask added",
        duration: 2000,
      });

      setTaskName("");
      onSuccess();
    } catch (error) {
      toast({
        title: "Error creating subtask",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onCancel();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 p-2 bg-secondary/30 rounded-md">
      <Input
        value={taskName}
        onChange={(e) => setTaskName(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Add a subtask..."
        className="flex-1 border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
        autoFocus
        disabled={isSubmitting}
      />
      <div className="flex gap-1">
        <Button
          type="submit"
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-700"
          disabled={!taskName.trim() || isSubmitting}
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-700"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
