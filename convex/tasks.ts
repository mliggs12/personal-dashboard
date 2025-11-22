import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

import { Doc, Id } from "./_generated/dataModel";
import { internalMutation, mutation, MutationCtx, query } from "./_generated/server";
import { getCurrentUserOrThrow, userByExternalId } from "./users";

dayjs.extend(isToday);
dayjs.extend(timezone);
dayjs.extend(utc);
const TIMEZONE = "America/Denver";

/**
 * Normalizes a date string to YYYY-MM-DD format.
 * Handles both legacy YYYY/MM/DD format and current YYYY-MM-DD format.
 * 
 * @param date - Date string in YYYY-MM-DD or YYYY/MM/DD format
 * @returns Normalized date string in YYYY-MM-DD format, or undefined if date is undefined/invalid
 */
function normalizeDateString(date: string | undefined): string | undefined {
  if (!date) return undefined;
  const parsed = dayjs(date, ["YYYY-MM-DD", "YYYY/MM/DD"]);
  return parsed.isValid() ? parsed.format("YYYY-MM-DD") : date;
}

export const list = query({
  args: { paginationOpts: paginationOptsValidator },
  async handler(ctx, { paginationOpts }) {
    const user = await getCurrentUserOrThrow(ctx);

    return await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .paginate(paginationOpts);
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

// Create a task for a specific project
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
      if (recurringTask?.type === "whenDone" && recurringTask.status === "active") {
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

export const getByIntention = query({
  args: { intentionId: v.id("intentions") },
  async handler(ctx, { intentionId }) {
    const user = await getCurrentUserOrThrow(ctx);

    return await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("intentionId"), intentionId))
      .collect();
  },
});

export const getByProject = query({
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

export const completedTasks = query({
  async handler(ctx) {
    const user = await getCurrentUserOrThrow(ctx);

    return await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.neq(q.field("completed"), undefined))
      .collect();
  },
});

export const completedTodayTasks = query({
  async handler(ctx) {
    const user = await getCurrentUserOrThrow(ctx);

    // Attempt to set local timezone
    const localTimezone = dayjs.tz.guess();
    const todayStart = dayjs().tz(localTimezone).startOf("day");

    return await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.gte(q.field("completed"), todayStart.valueOf()))
      .collect();
  },
});

export const totalCompletedTodayTasks = query({
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx);

    const todayStart = dayjs().tz(TIMEZONE).startOf("day");
    const todayEnd = dayjs().tz(TIMEZONE).endOf("day");

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) =>
        q.and(
          q.gte(q.field("completed"), todayStart.valueOf()),
          q.lte(q.field("completed"), todayEnd.valueOf()),
        ),
      )
      .collect();
    return tasks.length || 0;
  },
});

export const incompleteTasks = query({
  async handler(ctx) {
    const user = await getCurrentUserOrThrow(ctx);

    return await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("completed"), undefined))
      .collect();
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
      name: name || task.name,
      status: status || task.status,
      priority: priority || task.priority,
      notes: notes !== undefined ? notes : task.notes,
      due: due !== undefined ? (due === "" ? undefined : due) : task.due,
      completed: completed !== undefined ? completed : (isNowDone && wasNotDone ? now : task.completed),
      recurringTaskId: recurringTaskId || task.recurringTaskId,
      intentionId: intentionId || task.intentionId,
      parentTaskId: parentTaskId || task.parentTaskId,
      userId: userId || task.userId,
      updated: now,
    });

    // Handle "whenDone" recurring tasks - create next instance immediately
    if (wasNotDone && isNowDone && task.recurringTaskId) {
      const recurringTask = await ctx.db.get(task.recurringTaskId);
      if (recurringTask?.type === "whenDone" && recurringTask.status === "active") {
        await createNextWhenDoneTask(ctx, task, recurringTask);
      }
    }
  },
});

export const createRecurringTask = mutation({
  args: {
    name: v.string(),
    priority: v.union(v.literal("low"), v.literal("normal"), v.literal("high")),
    due: v.string(),
    frequency: v.union(
      v.literal("daily"),
      v.literal("3-day"),
      v.literal("weekly"),
      v.literal("monthly"),
    ),
    type: v.union(v.literal("onSchedule"), v.literal("whenDone")),
    userId: v.optional(v.string()),
  },
  async handler(ctx, { name, priority, due, frequency, type, userId }) {
    let user;
    if (userId) {
      user = await userByExternalId(ctx, userId);
    } else {
      user = await getCurrentUserOrThrow(ctx);
    }
    const taskId = await ctx.db.insert("recurringTasks", {
      name,
      status: "active",
      priority,
      due,
      updated: Date.now(),
      frequency,
      type,
      userId: user!._id,
    });

    return taskId;
  },
});

// Remove recurring association from a task and handle base recurring task cleanup
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
    frequency: v.union(
      v.literal("daily"),
      v.literal("3-day"),
      v.literal("weekly"),
      v.literal("monthly"),
    ),
    type: v.union(v.literal("onSchedule"), v.literal("whenDone")),
  },
  async handler(ctx, { taskId, frequency, type }) {
    const task = await ctx.db.get(taskId);
    if (task === null) throw new Error("Could not find task");

    // Normalize due date to YYYY-MM-DD format (handle legacy YYYY/MM/DD format)
    const normalizedDue = normalizeDateString(task.due) ?? dayjs().format("YYYY-MM-DD");

    // Create a new recurring task based on the current task
    const recurringTaskId = await ctx.db.insert("recurringTasks", {
      name: task.name,
      status: "active",
      priority: task.priority || "normal",
      due: normalizedDue,
      updated: Date.now(),
      frequency,
      type,
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

export const getSubtasks = query({
  args: { parentTaskId: v.id("tasks") },
  async handler(ctx, { parentTaskId }) {
    const user = await getCurrentUserOrThrow(ctx);

    return await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("parentTaskId"), parentTaskId))
      .collect();
  },
});

export const getTasksWithSubtasks = query({
  async handler(ctx) {
    const user = await getCurrentUserOrThrow(ctx);

    const allTasks = await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("completed"), undefined))
      .collect();

    // Collect all unique recurring task IDs
    const recurringTaskIds = new Set(
      allTasks
        .map((task) => task.recurringTaskId)
        .filter((id): id is NonNullable<typeof id> => id !== undefined)
    );

    // Fetch all recurring tasks in batch
    const recurringTasks = await Promise.all(
      Array.from(recurringTaskIds).map((id) => ctx.db.get(id))
    );

    // Create lookup map: recurringTaskId -> _creationTime
    const recurringTaskCreationTimeMap = new Map();
    for (const recurringTask of recurringTasks) {
      if (recurringTask) {
        recurringTaskCreationTimeMap.set(recurringTask._id, recurringTask._creationTime);
      }
    }

    // Helper function to enrich a task with parent creation time
    const enrichTask = (task: Doc<"tasks">): Doc<"tasks"> => {
      const enriched = { ...task };
      if (task.recurringTaskId && recurringTaskCreationTimeMap.has(task.recurringTaskId)) {
        enriched._creationTime = recurringTaskCreationTimeMap.get(task.recurringTaskId);
      }
      return enriched;
    };

    // Group tasks by parent-child relationships
    const taskMap = new Map();
    const rootTasks = [];

    // First pass: create task map and identify root tasks
    for (const task of allTasks) {
      const enriched = enrichTask(task);
      taskMap.set(task._id, { ...enriched, subtasks: [] });
      if (!task.parentTaskId) {
        rootTasks.push(task._id);
      }
    }

    // Second pass: build hierarchy
    for (const task of allTasks) {
      if (task.parentTaskId && taskMap.has(task.parentTaskId)) {
        taskMap.get(task.parentTaskId).subtasks.push(taskMap.get(task._id));
      }
    }

    // Return only root tasks with their subtasks nested, all enriched
    return rootTasks.map(id => enrichTask(taskMap.get(id))).filter(Boolean);
  },
});

// ============================================================================
// RECURRING TASKS HELPERS
// ============================================================================

/**
 * Calculates the next due date based on frequency from a base date.
 */
function calculateNextDueDate(
  frequency: "daily" | "3-day" | "weekly" | "monthly",
  baseDate: dayjs.Dayjs
): string {
  switch (frequency) {
    case "daily":
      return baseDate.add(1, "day").format("YYYY-MM-DD");
    case "3-day":
      return baseDate.add(3, "day").format("YYYY-MM-DD");
    case "weekly":
      return baseDate.add(1, "week").format("YYYY-MM-DD");
    case "monthly":
      return baseDate.add(1, "month").format("YYYY-MM-DD");
    default:
      return baseDate.add(1, "day").format("YYYY-MM-DD");
  }
}

/**
 * Determines if an "onSchedule" recurring task should generate a task today.
 * recurringTask.due represents the NEXT due date that should be generated.
 */
function shouldGenerateTaskToday(
  recurringTask: {
    frequency: "daily" | "3-day" | "weekly" | "monthly";
    due: string;
  },
  today: dayjs.Dayjs
): boolean {
  const nextDue = dayjs(recurringTask.due).tz(TIMEZONE).startOf("day");
  const todayStart = today.startOf("day");
  
  // Don't generate if today is before the next due date
  if (todayStart.isBefore(nextDue)) {
    return false;
  }
  
  // For weekly/monthly, also require matching day/date pattern
  switch (recurringTask.frequency) {
    case "daily":
    case "3-day":
      return true;
    case "weekly":
      return todayStart.day() === nextDue.day();
    case "monthly":
      return todayStart.date() === nextDue.date();
    default:
      return false;
  }
}

/**
 * Creates the next task instance for a "whenDone" recurring task.
 * Called immediately when a task is completed.
 */
async function createNextWhenDoneTask(
  ctx: MutationCtx,
  completedTask: Doc<"tasks">,
  recurringTask: Doc<"recurringTasks">
): Promise<void> {
  const today = dayjs().tz(TIMEZONE);
  const nextDueDate = calculateNextDueDate(recurringTask.frequency, today);
  
  await ctx.db.insert("tasks", {
    name: recurringTask.name,
    status: "todo",
    priority: recurringTask.priority,
    notes: completedTask.notes || "",
    due: nextDueDate,
    recurringTaskId: recurringTask._id,
    userId: recurringTask.userId,
  });
  
  await ctx.db.patch(recurringTask._id, {
    due: nextDueDate,
    updated: Date.now(),
  });
  
  console.log(
    `Created next "whenDone" task instance "${recurringTask.name}" with due date ${nextDueDate}`
  );
}

/**
 * Internal mutation: Generates recurring task instances for "onSchedule" type tasks.
 * Runs via cron job hourly, but only executes at 6am local time.
 */
export const generateRecurringTaskInstances = internalMutation({
  args: {},
  async handler(ctx) {
    const localNow = dayjs().tz(TIMEZONE);
    
    // Only run at 6am local time
    if (localNow.hour() !== 6) {
      return { generatedCount: 0, skipped: true };
    }
    
    const todayLocal = localNow.startOf("day");
    const recurringTasks = await ctx.db
      .query("recurringTasks")
      .filter((q) => 
        q.and(
          q.eq(q.field("status"), "active"),
          q.eq(q.field("type"), "onSchedule")
        )
      )
      .collect();

    let generatedCount = 0;

    for (const recurringTask of recurringTasks) {
      if (!shouldGenerateTaskToday(recurringTask, todayLocal)) {
        continue;
      }
      
      // Determine the due date for the new task
      // For weekly/monthly: use today if it matches the pattern, otherwise use recurringTask.due
      // For daily/3-day: use recurringTask.due
      const nextDueBase = dayjs(recurringTask.due).tz(TIMEZONE).startOf("day");
      const taskDueDate = 
        (recurringTask.frequency === "weekly" || recurringTask.frequency === "monthly") &&
        (todayLocal.isSame(nextDueBase) || todayLocal.isAfter(nextDueBase))
          ? todayLocal.format("YYYY-MM-DD")
          : nextDueBase.format("YYYY-MM-DD");
      
      // Check if task already exists with this due date
      const existingTask = await ctx.db
        .query("tasks")
        .withIndex("by_recurringTaskId", (q) =>
          q.eq("recurringTaskId", recurringTask._id)
        )
        .filter((q) => q.eq(q.field("due"), taskDueDate))
        .first();
      
      if (existingTask) {
        continue;
      }
      
      // Find most recent task instance to copy notes from
      const mostRecentTask = await ctx.db
        .query("tasks")
        .withIndex("by_recurringTaskId", (q) =>
          q.eq("recurringTaskId", recurringTask._id)
        )
        .order("desc")
        .first();
      
      // Create the new task instance
      await ctx.db.insert("tasks", {
        name: recurringTask.name,
        status: "todo",
        priority: recurringTask.priority,
        notes: mostRecentTask?.notes || "",
        due: taskDueDate,
        recurringTaskId: recurringTask._id,
        userId: recurringTask.userId,
      });
      
      // Update recurring task's next due date
      const nextDueDate = calculateNextDueDate(
        recurringTask.frequency,
        dayjs(taskDueDate).tz(TIMEZONE)
      );
      await ctx.db.patch(recurringTask._id, {
        due: nextDueDate,
        updated: Date.now(),
      });
      
      generatedCount++;
    }

    console.log(
      `Generated ${generatedCount} recurring task instances at ${localNow.format("YYYY-MM-DD HH:mm:ss z")}`
    );
    return { generatedCount, skipped: false };
  },
});

// Cleanup function to remove orphaned recurring tasks that have no associated task instances
// This is useful for cleaning up recurring tasks that existed before the deletion cleanup logic was implemented
export const cleanupOrphanedRecurringTasks = mutation({
  args: {},
  async handler(ctx) {
    // Get all recurring tasks
    const allRecurringTasks = await ctx.db
      .query("recurringTasks")
      .collect();

    const orphanedTasks: Array<{ id: Id<"recurringTasks">; name: string }> = [];
    let deletedCount = 0;

    // Check each recurring task for orphaned status
    for (const recurringTask of allRecurringTasks) {
      // Check if there are any task instances still using this recurring task
      const taskInstances = await ctx.db
        .query("tasks")
        .withIndex("by_recurringTaskId", (q) =>
          q.eq("recurringTaskId", recurringTask._id)
        )
        .collect();

      // If no instances exist, this recurring task is orphaned
      if (taskInstances.length === 0) {
        orphanedTasks.push({
          id: recurringTask._id,
          name: recurringTask.name,
        });
        await ctx.db.delete(recurringTask._id);
        deletedCount++;
        console.log(
          `Deleted orphaned recurring task "${recurringTask.name}" (${recurringTask._id}) - no associated task instances found`
        );
      }
    }

    console.log(
      `Cleanup complete: Found ${allRecurringTasks.length} recurring tasks, deleted ${deletedCount} orphaned task(s)`
    );

    return {
      totalRecurringTasks: allRecurringTasks.length,
      orphanedCount: deletedCount,
      orphanedTasks,
    };
  },
});

