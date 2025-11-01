"use client";

import { useQuery } from "convex/react";
import dayjs from "dayjs";

import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";

export function DataTableCreatedCell({ task }: { task: Doc<"tasks"> }) {
  const recurringTask = useQuery(
    api.recurringTasks.get,
    task.recurringTaskId ? { recurringTaskId: task.recurringTaskId } : "skip"
  );

  // Use parent recurring task's creation time if available, otherwise use task's own creation time
  const creationTime = recurringTask?._creationTime ?? task._creationTime;

  return (
    <span className="text-sm">
      {dayjs(creationTime).format("MMM DD, LT")}
    </span>
  );
}

