"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import AddTaskButton from "./components/add-task-button";

export default function TasksPage() {
  const tasks = useQuery(api.tasks.list) || [];
  const recurringTasks = useQuery(api.tasks.recurringTasks) || [];

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
    <div className="flex flex-col gap-2 h-full">
      <div className="flex justify-end">
        <AddTaskButton />
      </div>
      <div className="flex flex-col gap-16">
        <div className="overflow-auto">
          {tasks.map((task) => (
            <div key={task._id}>
              <div>{task.name}</div>
              <div>{task.due}</div>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          <h2>Recurring tasks</h2>
          <div className="grid grid-cols-2 overflow-auto">
            {recurringTasks.map((task) => (
              <div
                key={task._id}
                className="flex gap-16"
              >
                <div>{task.name}</div>
                <div>{task.frequency}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
