"use client";

import { useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";

import RecurringTasksTable from "../../components/tasks/recurring-tasks-table";

export default function RecurringPage() {
  const recurringTasks = useQuery(api.tasks.recurringTasks) ?? [];

  return (
    <div className="flex flex-col gap-4 h-full">
      <h1 className="text-lg font-semibold md:text-2xl">Recurring Tasks</h1>
      <RecurringTasksTable recurringTasks={recurringTasks} />
    </div>
  );
}
