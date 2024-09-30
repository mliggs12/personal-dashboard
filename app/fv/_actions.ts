"use server";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { fetchMutation } from "convex/nextjs";

export async function addNewTask(taskName: string) {
  await fetchMutation(api.tasks.create, { taskName });
}

export async function deleteTask(taskId: string) {
  await fetchMutation(api.tasks.remove, { taskId: taskId as Id<"tasks"> });
}
