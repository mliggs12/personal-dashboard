"use client";

import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import dayjs from "dayjs";
import { AddTaskWrapper } from "../components/tasks/add-task-button";
import RecurringTasksTable from "../components/tasks/recurring-tasks-table";
import TaskList from "../components/tasks/task-list";

function orderTasks(tasks: Doc<"tasks">[]) {
  // Order tasks first by deadline, then by created timestamp
  const orderedTasks = tasks.sort((a, b) => {
    if (!a.due && !b.due) {
      return (
        dayjs(b._creationTime).valueOf() - dayjs(a._creationTime).valueOf()
      );
    }
    if (!a.due) return 1;
    if (!b.due) return -1;

    const dateComparison = dayjs(a.due).valueOf() - dayjs(b.due).valueOf();

    return dateComparison === 0
      ? dayjs(b._creationTime).valueOf() - dayjs(a._creationTime).valueOf()
      : dateComparison;
  });

  return orderedTasks;
}

export default function TasksPage() {
  const incompleteTasks = useQuery(api.tasks.incompleteTasks) ?? [];
  const orderedIncompleteTasks = orderTasks(incompleteTasks) ?? [];
  const recurringTasks = useQuery(api.tasks.recurringTasks) ?? [];
  // const completedTodayTasks = useQuery(api.tasks.completedTodayTasks) ?? [];
  // const totalTasks = useQuery(api.tasks.totalCompletedTodayTasks) ?? 0;

  if (
    incompleteTasks === undefined ||
    recurringTasks === undefined
    // || completedTodayTasks === undefined
  ) {
    <p>Loading...</p>;
  }

  return (
    <div className="container h-full w-svh md:w-full p-1 md:p-0">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Inbox</h1>
      </div>
      <div
        className={cn(
          "flex flex-col gap-1 py-4 h-1/2",
          incompleteTasks.length === 0 ? "py-0" : null,
        )}
      >
        <TaskList tasks={orderedIncompleteTasks} />
        <AddTaskWrapper />
      </div>
      {/* <div
        className={cn(
          "flex flex-col gap-1 py-4",
          totalTasks === 0 ? "py-0" : null,
        )}
      >
        <TaskList tasks={completedTodayTasks} />
      </div>
      <CompletedTasks totalTasks={totalTasks} /> */}
      <div className="flex flex-col gap-1 py-4 h-1/2">
        <h2>Recurring tasks</h2>
        <RecurringTasksTable recurringTasks={recurringTasks} />
      </div>
    </div>
  );
}
