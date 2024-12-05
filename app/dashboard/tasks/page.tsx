"use client";

import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { AddTaskWrapper } from "../components/tasks/add-task-button";
import CompletedTasks from "../components/tasks/completed-tasks";
import RecurringTasksTable from "../components/tasks/recurring-tasks-table";
import TaskList from "../components/tasks/task-list";

export default function TasksPage() {
  const tasks = useQuery(api.tasks.list) ?? [];
  const incompleteTasks = useQuery(api.tasks.incompleteTasks) ?? [];
  const completedTodayTasks = useQuery(api.tasks.completedTodayTasks) ?? [];
  const recurringTasks = useQuery(api.tasks.recurringTasks) ?? [];
  const totalTasks = useQuery(api.tasks.totalCompletedTodayTasks) ?? 0;

  if (
    tasks === undefined ||
    incompleteTasks === undefined ||
    completedTodayTasks === undefined
  ) {
    <p>Loading...</p>;
  }

  return (
    <div className="container">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Inbox</h1>
      </div>
      <div
        className={cn(
          "flex flex-col gap-1 py-4",
          incompleteTasks.length === 0 ? "py-0" : null,
        )}
      >
        <TaskList tasks={incompleteTasks} />
      </div>
      <AddTaskWrapper />
      <div
        className={cn(
          "flex flex-col gap-1 py-4",
          totalTasks === 0 ? "py-0" : null,
        )}
      >
        <TaskList tasks={completedTodayTasks} />
      </div>
      <CompletedTasks totalTasks={totalTasks} />
      <div className="flex flex-col gap-1 py-4">
        <h2>Recurring tasks</h2>
        <RecurringTasksTable recurringTasks={recurringTasks} />
      </div>
    </div>
  );
}
