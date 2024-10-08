"use server";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { fetchMutation } from "convex/nextjs";

export async function addNewTask(
  name?: string,
  status?: string,
  priority?: string,
  notes?: string,
) {
  await fetchMutation(api.tasks.create, {
    name: name ? name : "-",
    status: (status &&
    [
      "done",
      "backlog",
      "todo",
      "in_progress",
      "archived",
      "cancelled",
    ].includes(status)
      ? status
      : "backlog") as
      | "done"
      | "backlog"
      | "todo"
      | "in_progress"
      | "archived"
      | "cancelled",
    priority: (priority && ["low", "normal", "high"].includes(priority)
      ? priority
      : "normal") as "low" | "normal" | "high",
    notes: notes ?? "",
  });
}

export async function deleteTask(taskId: string) {
  await fetchMutation(api.tasks.remove, { taskId: taskId as Id<"tasks"> });
}
