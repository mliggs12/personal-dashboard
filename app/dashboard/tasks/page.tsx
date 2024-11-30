"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import TaskList from "../components/tasks/task-list";
import AddTaskButton from "./components/add-task-button";
import RecurringTasksTable from "./components/recurring-tasks-table";

export default function TasksPage() {
  const tasks = useQuery(api.tasks.incompleteTasks) || [];
  const recurringTasks = useQuery(api.tasks.recurringTasks) || [];

  if (tasks === undefined || recurringTasks === undefined) {
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
    <div className="flex flex-col h-screen">
      <div className="flex justify-end">
        <AddTaskButton />
      </div>
      <div className="flex flex-col flex-1 h-full gap-2">
        <div>
          <h2>All tasks</h2>
          <TaskList tasks={tasks} />
        </div>
        <div>
          <h2>Recurring tasks</h2>
          <RecurringTasksTable recurringTasks={recurringTasks} />
        </div>
      </div>
    </div>
  );
}
