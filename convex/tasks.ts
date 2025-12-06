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

    return await ctx.db.insert("tasks", {
      name,
      status: status || "todo",
      priority: priority || "normal",
      notes: notes || "",
      due,
      recurringTaskId,
      intentionId,
      parentTaskId,
      userId: user!._id,
    });
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

    await ctx.db.patch(taskId, {
      name: name !== undefined ? name : task.name,
      status: status !== undefined ? status : task.status,
      priority: priority !== undefined ? priority : task.priority,
      notes: notes !== undefined ? notes : task.notes,
      due: due !== undefined ? (due === "" ? undefined : due) : task.due,
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

export const todayTasks = query({
  args: { date: v.string() },
  async handler(ctx, { date }) {
    const user = await getCurrentUserOrThrow(ctx);

    // Normalize the input date to YYYY-MM-DD format (handles legacy YYYY/MM/DD format)
    const normalizedDate = normalizeDateString(date) ?? date;

    // Get all tasks with due dates (we'll filter in memory to handle legacy YYYY/MM/DD format)
    const allTasksWithDue = await ctx.db
      .query("tasks")
      .withIndex("by_user_due", (q) => q.eq("userId", user._id))
      .filter((q) =>
        q.and(
          q.neq(q.field("due"), undefined),
          q.eq(q.field("completed"), undefined),
          q.or(
            q.eq(q.field("status"), "todo"),
            q.eq(q.field("status"), "in_progress")
          )
        )
      )
      .collect();

    // Normalize and filter tasks in memory to handle both YYYY-MM-DD and YYYY/MM/DD formats
    const allTasks = allTasksWithDue.filter((task) => {
      if (!task.due) return false;
      
      const normalizedTaskDue = normalizeDateString(task.due);
      if (!normalizedTaskDue) return false;
      
      // Compare normalized dates
      return normalizedTaskDue <= normalizedDate;
    });

    // Sort by due date ascending (earliest first) using normalized dates
    return allTasks.sort((a, b) => {
      if (!a.due && !b.due) return 0;
      if (!a.due) return 1;
      if (!b.due) return -1;
      
      const normalizedA = normalizeDateString(a.due) ?? a.due;
      const normalizedB = normalizeDateString(b.due) ?? b.due;
      
      return normalizedA.localeCompare(normalizedB);
    });
  },
});

export const backlogTasks = query({
  args: {},
  async handler(ctx) {
    const user = await getCurrentUserOrThrow(ctx);

    // Get backlog tasks without due dates (not completed, not archived)
    const backlogTasks = await ctx.db
      .query("tasks")
      .withIndex("by_user_status", (q) =>
        q
          .eq("userId", user._id)
          .eq("status", "backlog")
      )
      .filter((q) => 
        q.and(
          q.eq(q.field("due"), undefined),
          q.eq(q.field("completed"), undefined)
        )
      )
      .collect();

    // Get todo tasks without due dates (not completed, not archived)
    const todoTasks = await ctx.db
      .query("tasks")
      .withIndex("by_user_status", (q) =>
        q
          .eq("userId", user._id)
          .eq("status", "todo")
      )
      .filter((q) => 
        q.and(
          q.eq(q.field("due"), undefined),
          q.eq(q.field("completed"), undefined)
        )
      )
      .collect();

    return [...backlogTasks, ...todoTasks];
  },
});

export const deadlineTasks = query({
  args: { date: v.string() },
  async handler(ctx, { date }) {
    const user = await getCurrentUserOrThrow(ctx);

    // Normalize the input date to YYYY-MM-DD format (handles legacy YYYY/MM/DD format)
    const normalizedDate = normalizeDateString(date) ?? date;

    // Get all tasks with due dates (we'll filter in memory to handle legacy YYYY/MM/DD format)
    const allTasksWithDue = await ctx.db
      .query("tasks")
      .withIndex("by_user_due", (q) => q.eq("userId", user._id))
      .filter((q) =>
        q.and(
          q.neq(q.field("status"), "archived"),
          q.neq(q.field("due"), undefined),
          q.eq(q.field("completed"), undefined)
        ))
      .collect();

    // Normalize and filter tasks in memory to handle both YYYY-MM-DD and YYYY/MM/DD formats
    return allTasksWithDue.filter((task) => {
      if (!task.due) return false;
      
      const normalizedTaskDue = normalizeDateString(task.due);
      if (!normalizedTaskDue) return false;
      
      // Compare normalized dates (due > today)
      return normalizedTaskDue > normalizedDate;
    });
  },
});

// ============================================================================
// RECURRING TASKS
// ============================================================================

export const removeRecurringFromTask = mutation({
  args: { taskId: v.id("tasks") },
  async handler(ctx, { taskId }) {
    const task = await ctx.db.get(taskId);
    if (task === null) throw new Error("Could not find task");

    if (!task.recurringTaskId) {
      throw new Error("Task is not associated with a recurring task");
    }

    const recurringTaskId = task.recurringTaskId;

    // Remove the recurringTaskId association from this task
    await ctx.db.patch(taskId, {
      recurringTaskId: undefined,
      updated: Date.now(),
    });

    // Check if there are any other task instances still using this recurring task
    const remainingInstances = await ctx.db
      .query("tasks")
      .withIndex("by_recurringTaskId", (q) => q.eq("recurringTaskId", recurringTaskId))
      .collect();

    // If no other instances exist, delete the base recurring task
    if (remainingInstances.length === 0) {
      await ctx.db.delete(recurringTaskId);
      console.log(
        `Removed recurring association from task "${task.name}" (${taskId}) and deleted unused recurring task (${recurringTaskId})`
      );
    } else {
      console.log(
        `Removed recurring association from task "${task.name}" (${taskId}). Recurring task (${recurringTaskId}) kept active with ${remainingInstances.length} remaining instances.`
      );
    }

    return task;
  },
});

// Convert a regular task to a recurring task by creating a new recurring task
export const convertTaskToRecurring = mutation({
  args: {
    taskId: v.id("tasks"),
    schedule: v.object({
      interval: v.object({
        amount: v.number(),
        unit: v.union(v.literal("day"), v.literal("week"), v.literal("month")),
      }),
      time: v.optional(v.string()),
      daysOfWeek: v.optional(v.array(v.number())),
      dayOfMonth: v.optional(v.number()),
    }),
    recurrenceType: v.union(v.literal("schedule"), v.literal("completion")),
  },
  async handler(ctx, { taskId, schedule, recurrenceType }) {
    const task = await ctx.db.get(taskId);
    if (task === null) throw new Error("Could not find task");

    // Get user to access timezone
    const user = await ctx.db.get(task.userId!);
    if (!user) throw new Error("Could not find user");
    
    const timezone = user.timezone ?? "America/Denver";

    // Normalize due date to YYYY-MM-DD format (handle legacy YYYY/MM/DD format)
    const normalizedDueDate = normalizeDateString(task.due);
    
    // Calculate nextRunDate based on schedule
    // Use task's due date if available, otherwise use today in user's timezone
    const baseDate = normalizedDueDate
      ? dayjs.tz(normalizedDueDate, timezone).startOf("day")
      : dayjs.tz(timezone).startOf("day");
    
    const nextRunDate = calculateNextRunDate(schedule, baseDate);

    // Create a new recurring task based on the current task
    const recurringTaskId = await ctx.db.insert("recurringTasks", {
      name: task.name,
      schedule,
      recurrenceType,
      nextRunDate,
      isActive: true,
      updated: Date.now(),
      userId: task.userId!,
    });

    // Update the task to reference the new recurring task
    await ctx.db.patch(taskId, {
      recurringTaskId,
      updated: Date.now(),
    });

    console.log(
      `Converted task "${task.name}" (${taskId}) to recurring task (${recurringTaskId})`
    );

    return { taskId, recurringTaskId };
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