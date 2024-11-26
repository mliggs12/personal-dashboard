"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import AddTaskButton from "./components/add-task-button";

export default function TasksPage() {
  const tasks = useQuery(api.tasks.list) || [];

  if (tasks === undefined) {
    <div>Loading...</div>;
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col gap-4 h-full items-center justify-center">
        <p>Add a new task to start</p>
        <AddTaskButton />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 h-full items-center justify-center">
      <AddTaskButton />
      <div className="overflow-auto">
        {tasks.map((task) => (
          <div key={task._id}>{task.name}</div>
        ))}
      </div>
    </div>
  );
}
