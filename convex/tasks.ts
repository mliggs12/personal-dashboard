import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { normalizeDateString } from "./lib/date.utils";
import dayjs from "./lib/dayjs.config";
import { calculateNextRunDate, createNextWhenDoneTask } from "./recurringTasksHelpers";
import { getCurrentUserOrThrow, userByExternalId } from "./users";

export const list = query({
  args: {},
  async handler(ctx) {
    const user = await getCurrentUserOrThrow(ctx);

    return await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
  },
});

export const get = query({
  args: { taskId: v.id("tasks") },
  async handler(ctx, { taskId }) {
    return await ctx.db.get(taskId);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    status: v.optional(
      v.union(
        v.literal("backlog"),
        v.literal("todo"),
        v.literal("in_progress"),
        v.literal("done"),
        v.literal("archived"),
      ),
    ),
    priority: v.optional(
      v.union(v.literal("low"), v.literal("normal"), v.literal("high")),
    ),
    notes: v.optional(v.string()),
    due: v.optional(v.string()),
    date: v.optional(v.string()),
    recurringTaskId: v.optional(v.id("recurringTasks")),
    intentionId: v.optional(v.id("intentions")),
    parentTaskId: v.optional(v.id("tasks")),
    userId: v.optional(v.string()),
  },
  async handler(
    ctx,
    {
      name,
      status,
      priority,
      notes,
      due,
      date,
      recurringTaskId,
      intentionId,
      parentTaskId,
      userId,
    },
  ) {
    let user;
    if (userId) {
      user = await userByExternalId(ctx, userId);
    } else {
      user = await getCurrentUserOrThrow(ctx);
    }

    const taskId = await ctx.db.insert("tasks", {
      name,
      status: status || "todo",
      priority: priority || "normal",
      notes: notes || "",
      due,
      date,
      recurringTaskId,
      intentionId,
      parentTaskId,
      userId: user!._id,
    });

    return taskId;
  },
});


export const remove = mutation({
  args: { taskId: v.id("tasks") },
  async handler(ctx, { taskId }) {
    const task = await ctx.db.get(taskId);
    if (task === null) throw new Error("Could not find task");

    const recurringTaskId = task.recurringTaskId;

    // Delete the task
    await ctx.db.delete(taskId);

    // If this was a recurring task instance, check if we need to clean up the parent recurring task
    if (recurringTaskId) {
      // Check if there are any other task instances still using this recurring task
      const remainingInstances = await ctx.db
        .query("tasks")
        .withIndex("by_recurringTaskId", (q) => q.eq("recurringTaskId", recurringTaskId))
        .collect();

      // If no other instances exist, delete the base recurring task
      if (remainingInstances.length === 0) {
        await ctx.db.delete(recurringTaskId);
        console.log(
          `Deleted task "${task.name}" (${taskId}) and cleaned up unused recurring task (${recurringTaskId})`
        );
      } else {
        console.log(
          `Deleted task "${task.name}" (${taskId}). Recurring task (${recurringTaskId}) kept active with ${remainingInstances.length} remaining instances.`
        );
      }
    }
  },
});

export const completeTask = mutation({
  args: { taskId: v.id("tasks") },
  async handler(ctx, { taskId }) {
    const task = await ctx.db.get(taskId);
    
    await ctx.db.patch(taskId, {
      status: "done",
      completed: Date.now(),
    });
    
    // Handle "whenDone" recurring tasks - create next instance immediately
    if (task?.recurringTaskId) {
      const recurringTask = await ctx.db.get(task.recurringTaskId);
      if (recurringTask?.recurrenceType === "completion" && recurringTask.isActive) {
        await createNextWhenDoneTask(ctx, task, recurringTask);
      }
    }
    
    return task;
  },
});

export const unCompleteTask = mutation({
  args: { taskId: v.id("tasks") },
  async handler(ctx, { taskId }) {
    return await ctx.db.patch(taskId, {
      status: "todo",
      completed: undefined,
    });
  },
});

export const update = mutation({
  args: {
    taskId: v.id("tasks"),
    name: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("backlog"),
        v.literal("todo"),
        v.literal("in_progress"),
        v.literal("done"),
        v.literal("archived"),
      ),
    ),
    priority: v.optional(
      v.union(v.literal("low"), v.literal("normal"), v.literal("high")),
    ),
    notes: v.optional(v.string()),
    due: v.optional(v.string()),
    date: v.optional(v.string()),
    completed: v.optional(v.number()),
    recurringTaskId: v.optional(v.id("recurringTasks")),
    intentionId: v.optional(v.id("intentions")),
    parentTaskId: v.optional(v.id("tasks")),
    userId: v.optional(v.id("users")),
  },
  async handler(
    ctx,
    {
      taskId,
      name,
      status,
      priority,
      notes,
      due,
      date,
      completed,
      recurringTaskId,
      intentionId,
      parentTaskId,
      userId,
    },
  ) {
    const task = await ctx.db.get(taskId);
    if (task === null) throw new Error("Could not find task");

    const now = Date.now();
    const wasNotDone = task.status !== "done";
    const isNowDone = status === "done";

    // Determine the final status
    let finalStatus = status !== undefined ? status : task.status;
    
    // Determine the final due date value
    let finalDue = due !== undefined ? (due === "" ? undefined : due) : task.due;
    
    // Determine the final date value
    let finalDate = date !== undefined ? (date === "" ? undefined : date) : task.date;
    
    // Backlog tasks cannot have dates or due dates
    // If task is being set to backlog, remove both due date and date
    if (status === "backlog") {
      finalDue = undefined;
      finalDate = undefined;
    }
    
    // If task is currently backlog and a due date or date is being set,
    // automatically change status to todo (unless status is explicitly being set)
    // This allows users to set dates on backlog tasks, which promotes them to todo
    if (task.status === "backlog") {
      const isSettingDue = due !== undefined && due !== "";
      const isSettingDate = date !== undefined && date !== "";
      
      if ((isSettingDue || isSettingDate) && status === undefined) {
        // Only change to todo if status wasn't explicitly set and date/due is being set
        finalStatus = "todo";
      }
    }
    
    await ctx.db.patch(taskId, {
      name: name !== undefined ? name : task.name,
      status: finalStatus,
      priority: priority !== undefined ? priority : task.priority,
      notes: notes !== undefined ? notes : task.notes,
      due: finalDue,
      date: finalDate,
      completed: completed !== undefined ? completed : (isNowDone && wasNotDone ? now : task.completed),
      recurringTaskId: recurringTaskId !== undefined ? recurringTaskId : task.recurringTaskId,
      intentionId: intentionId !== undefined ? intentionId : task.intentionId,
      parentTaskId: parentTaskId !== undefined ? parentTaskId : task.parentTaskId,
      userId: userId !== undefined ? userId : task.userId,
      updated: now,
    });

    // Handle "whenDone" recurring tasks - create next instance immediately
    // Only trigger if transitioning from not-done to done (prevents duplicate calls)
    if (wasNotDone && isNowDone && task.recurringTaskId) {
      const recurringTask = await ctx.db.get(task.recurringTaskId);
      if (recurringTask?.recurrenceType === "completion" && recurringTask.isActive) {
        await createNextWhenDoneTask(ctx, task, recurringTask);
      }
    }
  },
});

export const search = query({
  args: { query: v.string() },
  async handler(ctx, { query }) {
    const user = await getCurrentUserOrThrow(ctx);

    return await ctx.db
      .query("tasks")
      .withSearchIndex("search_name", (q) =>
        q.search("name", query).eq("userId", user._id),
      )
      .collect();
  },
});

// ============================================================================
// TASKS CARD
// ============================================================================

/**
 * Fetches all active tasks for the current user.
 * Active tasks are those that are:
 * - Not completed (completed === undefined)
 * - Not archived (status !== "archived")
 * 
 * Filtering by view (Today/Backlog/Deadline) happens client-side.
 */
export const allActiveTasks = query({
  args: {},
  async handler(ctx) {
    const user = await getCurrentUserOrThrow(ctx);

    // Fetch all active tasks (not completed, not archived)
    return await ctx.db
      .query("tasks")
      .withIndex("by_user_completed", (q) => q.eq("userId", user._id).eq("completed", undefined))
      .collect();
  },
});

// ============================================================================
// PROJECTS
// ============================================================================

export const createForProject = mutation({
  args: {
    name: v.string(),
    projectId: v.id("projects"),
    status: v.optional(
      v.union(
        v.literal("backlog"),
        v.literal("todo"),
        v.literal("in_progress"),
        v.literal("done"),
        v.literal("archived"),
      ),
    ),
    priority: v.optional(
      v.union(v.literal("low"), v.literal("normal"), v.literal("high")),
    ),
    notes: v.optional(v.string()),
    due: v.optional(v.string()),
    parentTaskId: v.optional(v.id("tasks")),
    userId: v.optional(v.id("users")),
  },
  async handler(
    ctx,
    { name, status, priority, notes, due, projectId, parentTaskId, userId },
  ) {
    if (!userId) {
      const user = await getCurrentUserOrThrow(ctx);
      userId = user._id;
    }

    return await ctx.db.insert("tasks", {
      name,
      projectId,
      status: status || "todo",
      priority: priority || "normal",
      notes: notes || "",
      due,
      parentTaskId,
      updated: Date.now(),
      userId: userId,
    });
  },
});

export const listByProject = query({
  args: { projectId: v.id("projects") },
  async handler(ctx, { projectId }) {
    const user = await getCurrentUserOrThrow(ctx);

    return await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("projectId"), projectId))
      .collect();
  },
});