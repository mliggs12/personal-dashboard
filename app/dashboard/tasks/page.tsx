"use client";

import { useQuery } from "convex/react";
import dayjs from "dayjs";

import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

import AddTaskDrawerDialog from "../components/tasks/add-task-drawer-dialog";
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
  // const completedTodayTasks = useQuery(api.tasks.completedTodayTasks) ?? [];
  // const totalTasks = useQuery(api.tasks.totalCompletedTodayTasks) ?? 0;

  if (
    incompleteTasks === undefined
    // || completedTodayTasks === undefined
  ) {
    <p>Loading...</p>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 relative">
        <div className="absolute inset-0 overflow-auto px-2">
          <h1 className="text-base font-semibold md:text-2xl">Inbox</h1>
          <TaskList tasks={orderedIncompleteTasks} />
          <div className="fixed bottom-6 right-6 z-10">
            <AddTaskDrawerDialog />
          </div>
        </div>
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
    </div>
  );
}
