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
  date?: string,
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
    date,
    recurringTaskId: recurringTaskId as Id<"recurringTasks">,
    intentionId: intentionId as Id<"intentions">,
    parentTaskId: parentTaskId as Id<"tasks">,
    userId: userId,
  });
}

export async function createRecurringTask(
  name: string,
  schedule: {
    interval: {
      amount: number;
      unit: "day" | "week" | "month";
    };
    time?: string;
    daysOfWeek?: number[];
    dayOfMonth?: number;
  },
  recurrenceType: "schedule" | "completion",
  date?: string, // Start date for the recurring schedule
  tagIds?: string[], // Tags to apply to generated task instances
) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error(
      "Unauthenticated call to server action `createRecurringTask`",
    );
  }

  const recurringTaskId = await fetchMutation(api.recurringTasks.create, {
    name,
    schedule,
    recurrenceType,
    date, // Pass it through
    tagIds: tagIds as Id<"tags">[],
    userId,
  });

  return recurringTaskId;
}

export async function deleteTask(
  taskId: string,
  deleteScope?: "this" | "thisAndFollowing" | "all"
) {
  await fetchMutation(api.tasks.remove, { 
    taskId: taskId as Id<"tasks">,
    deleteScope,
  });
}

export async function completeTask( 
  taskId: string,
) {
  // Backend completeTask mutation already handles recurring task creation
  return await fetchMutation(api.tasks.completeTask, { taskId: taskId as Id<"tasks"> });
}
