"use server";

import { auth } from "@clerk/nextjs/server";
import { fetchMutation } from "convex/nextjs";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export async function createTask(
  name: string,
  status?: string,
  priority?: string,
  notes?: string,
  due?: string,
  recurringTaskId?: string,
  intentionId?: string,
  parentTaskId?: string,
) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error(
      "Unauthenticated call to server action `createRecurringTask`",
    );
  }

  return await fetchMutation(api.tasks.create, {
    name,
    status: status as "done" | "backlog" | "todo" | "in_progress" | "archived",
    priority: priority as "low" | "normal" | "high",
    notes,
    due,
    recurringTaskId: recurringTaskId as Id<"recurringTasks">,
    intentionId: intentionId as Id<"intentions">,
    parentTaskId: parentTaskId as Id<"tasks">,
    userId: userId,
  });
}

export async function createRecurringTask(
  name: string,
  frequency: string,
  type: string,
  notes?: string,
) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error(
      "Unauthenticated call to server action `createRecurringTask`",
    );
  }

  const recurringTaskId = await fetchMutation(api.tasks.createRecurringTask, {
    name,
    frequency: frequency as
      | "daily"
      | "3-day"
      | "weekly"
      | "monthly",
    type: type as "onSchedule" | "whenDone",
    notes,
    userId: userId,
  });

  return recurringTaskId;
}

export async function deleteTask(taskId: string) {
  await fetchMutation(api.tasks.remove, { taskId: taskId as Id<"tasks"> });
}

export async function completeTask( 
  taskId: string,
) {
  // Backend completeTask mutation already handles recurring task creation
  return await fetchMutation(api.tasks.completeTask, { taskId: taskId as Id<"tasks"> });
}
