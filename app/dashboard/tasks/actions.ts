"use server";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { nextDueDate } from "@/lib/tasks.utils";
import { auth } from "@clerk/nextjs/server";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import dayjs from "dayjs";

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
  priority: string,
  due: string,
  frequency: string,
  type: string,
) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error(
      "Unauthenticated call to server action `createRecurringTask`",
    );
  }

  const recurringTaskId = await fetchMutation(api.tasks.createRecurringTask, {
    name,
    priority: priority as "low" | "normal" | "high",
    due,
    frequency: frequency as
      | "daily"
      | "3-day"
      | "weekly"
      | "monthly"
      | "daysAfter",
    type: type as "onSchedule" | "whenDone",
    userId: userId,
  });

  return recurringTaskId;
}

export async function deleteTask(taskId: string) {
  await fetchMutation(api.tasks.remove, { taskId: taskId as Id<"tasks"> });
}

export async function completeTask(
  taskId: Id<"tasks">,
  todayDate: dayjs.Dayjs,
) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error(
      "Unauthenticated call to server action `createRecurringTask`",
    );
  }

  const task = await fetchQuery(api.tasks.get, { taskId });
  if (task === null) return null;

  if (task.recurringTaskId !== undefined) {
    const recurringTask = await fetchQuery(api.recurringTasks.get, {
      taskId: task.recurringTaskId,
    });

    await fetchMutation(api.tasks.create, {
      name: task.name,
      status: "todo",
      priority: "normal",
      notes: task.notes,
      due:
        recurringTask?.type === "whenDone"
          ? await nextDueDate(recurringTask!.frequency, todayDate)
          : await nextDueDate(
              recurringTask!.frequency,
              dayjs(task?.due, "YYYY/MM/DD"),
            ),
      recurringTaskId: task.recurringTaskId,
      userId,
    });
  }
  return await fetchMutation(api.tasks.completeTask, { taskId });
}
