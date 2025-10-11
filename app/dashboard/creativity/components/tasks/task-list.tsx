import React from "react";
import { useMutation } from "convex/react";

import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useToast } from "@/hooks/use-toast";

import Task from "./task";

export default function TaskList({ items }: { items: Array<Doc<"tasks">> }) {
  const { toast } = useToast();

  const completeTask = useMutation(api.tasks.completeTask);
  const unCompleteTask = useMutation(api.tasks.unCompleteTask);

  const handleOnChangeTodo = (task: Doc<"tasks">) => {
    if (task.status === "done") {
      unCompleteTask({ taskId: task._id });
    } else {
      completeTask({ taskId: task._id });
      toast({
        title: "✅ Task completed",
        description: "You're a rockstar",
        duration: 3000,
      });
    }
  };
  return items.map((task: Doc<"tasks">, idx: number) => (
    <Task
      key={task._id}
      data={task}
      isCompleted={task.status === "done"}
      handleOnChange={() => handleOnChangeTodo(task)}
    />
  ));
}
