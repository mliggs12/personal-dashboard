"use client";

import { Button } from "@/app/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { AddTaskForm } from "./add-task-form";

export default function AddTaskButton() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleTaskAdded = () => {
    setOpen(false);
    toast({
      title: "Task added",
      description: "The task has been added successfully.",
      duration: 5000,
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger asChild>
        <Button
          size="default"
          className="h-10 gap-1"
        >
          <PlusCircle className="h-3.5 w-3.5" />
          Add Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
        </DialogHeader>
        <DialogClose asChild>
          <AddTaskForm onTaskAdded={handleTaskAdded} />
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
