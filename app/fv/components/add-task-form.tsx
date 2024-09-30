"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addNewTask } from "../_actions";

export function AddTaskForm({ onTaskAdded }: { onTaskAdded: () => void }) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const taskName = formData.get("taskName") as string;
    await addNewTask(taskName);
    onTaskAdded();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label
            htmlFor="taskName"
            className="text-right"
          >
            Name
          </Label>
          <Input
            id="taskName"
            name="taskName"
            type="text"
            className="col-span-3"
            defaultValue={"New Task"}
          />
        </div>
      </div>
      <Button type="submit">Add task</Button>
    </form>
  );
}
