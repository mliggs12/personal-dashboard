import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

import { internalMutation, mutation, query } from "./_generated/server";
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
    await ctx.db.delete(taskId);
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
    
    // If this is a recurring task with "whenDone" type, create the next instance immediately
    if (task?.recurringTaskId) {
      const recurringTask = await ctx.db.get(task.recurringTaskId);
      
      if (recurringTask?.type === "whenDone" && recurringTask.status === "active") {
        const daysToAdd = getFrequencyDays(recurringTask.frequency);
        const now = Date.now();
        const today = dayjs().tz(TIMEZONE);
        const nextDueDate = today.add(daysToAdd, "day").format("YYYY-MM-DD");
        
        // Create the next task immediately with a future due date
        const nextTaskId = await ctx.db.insert("tasks", {
          name: recurringTask.name,
          status: "todo",
          priority: recurringTask.priority,
          notes: "",
          due: nextDueDate,
          recurringTaskId: recurringTask._id,
          userId: recurringTask.userId,
        });
        
        // Update the recurring task's due date and timestamp
        await ctx.db.patch(recurringTask._id, {
          due: nextDueDate,
          updated: now,
        });
        
        console.log(
          `Created next recurring task instance "${recurringTask.name}" (${nextTaskId}) with due date ${nextDueDate}`
        );
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

    // If task was just marked as done and has a recurring task, create the next instance
    if (wasNotDone && isNowDone && task.recurringTaskId) {
      const recurringTask = await ctx.db.get(task.recurringTaskId);
      
      if (recurringTask?.type === "whenDone" && recurringTask.status === "active") {
        const daysToAdd = getFrequencyDays(recurringTask.frequency);
        const today = dayjs().tz(TIMEZONE);
        const nextDueDate = today.add(daysToAdd, "day").format("YYYY-MM-DD");
        
        // Create the next task immediately with a future due date
        const nextTaskId = await ctx.db.insert("tasks", {
          name: recurringTask.name,
          status: "todo",
          priority: recurringTask.priority,
          notes: "",
          due: nextDueDate,
          recurringTaskId: recurringTask._id,
          userId: recurringTask.userId,
        });
        
        // Update the recurring task's due date and timestamp
        await ctx.db.patch(recurringTask._id, {
          due: nextDueDate,
          updated: now,
        });
        
        console.log(
          `Created next recurring task instance "${recurringTask.name}" (${nextTaskId}) with due date ${nextDueDate}`
        );
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
    const enrichTask = (task: any) => {
      const enriched = { ...task };
      if (task.recurringTaskId && recurringTaskCreationTimeMap.has(task.recurringTaskId)) {
        enriched.parentCreationTime = recurringTaskCreationTimeMap.get(task.recurringTaskId);
      }
      return enriched;
    };

    // Helper function to recursively enrich subtasks
    const enrichTaskWithSubtasks = (task: any): any => {
      const enriched = enrichTask(task);
      if (task.subtasks && task.subtasks.length > 0) {
        enriched.subtasks = task.subtasks.map(enrichTaskWithSubtasks);
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
    return rootTasks.map(id => enrichTaskWithSubtasks(taskMap.get(id))).filter(Boolean);
  },
});

// Helper function: Returns number of days for each frequency type
function getFrequencyDays(frequency: "daily" | "3-day" | "weekly" | "monthly"): number {
  switch (frequency) {
    case "daily":
      return 1;
    case "3-day":
      return 3;
    case "weekly":
      return 7;
    case "monthly":
      return 30; // Approximate
    default:
      return 1;
  }
}

// Helper function: Calculates the next due date based on frequency
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

// Helper function: Determines if task should be generated based on frequency and last due date
function shouldGenerateTaskToday(
  recurringTask: {
    frequency: "daily" | "3-day" | "weekly" | "monthly";
    due: string;
  },
  today: dayjs.Dayjs
): boolean {
  const lastDue = dayjs(recurringTask.due).tz(TIMEZONE);
  
  switch (recurringTask.frequency) {
    case "daily":
      return true; // Generate every day
    case "3-day":
      // Generate if it's been 3 or more days since last due date
      return today.diff(lastDue, "day") >= 3;
    case "weekly":
      // Generate if it's the same day of week and at least 7 days have passed
      return today.day() === lastDue.day() && today.diff(lastDue, "day") >= 7;
    case "monthly":
      // Generate if it's the same date and at least a month has passed
      return today.date() === lastDue.date() && today.diff(lastDue, "day") >= 28;
    default:
      return false;
  }
}

// Internal mutation: Generates recurring task instances for "onSchedule" type tasks
// Runs via cron job hourly, but only executes at 6am local time
export const generateRecurringTaskInstances = internalMutation({
  args: {},
  async handler(ctx) {
    const now = Date.now();
    
    // Check if it's currently 6am in the local timezone
    const localNow = dayjs().tz(TIMEZONE);
    const currentHour = localNow.hour();
    
    // Only run between 6am and 7am local time
    if (currentHour !== 6) {
      console.log(
        `Skipping recurring task generation - current hour is ${currentHour}, not 6am (${TIMEZONE})`
      );
      return { generatedCount: 0, skipped: true };
    }
    
    // Get start of today in local timezone
    const todayLocal = localNow.startOf("day");
    const todayTimestamp = todayLocal.valueOf();

    // Get all active recurring tasks with type "onSchedule"
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
      // Check if a task instance already exists for today
      const existingTask = await ctx.db
        .query("tasks")
        .withIndex("by_recurringTaskId", (q) =>
          q.eq("recurringTaskId", recurringTask._id)
        )
        .filter((q) => q.gte(q.field("_creationTime"), todayTimestamp))
        .first();
      
      // If no task exists for today and it should be generated, create it
      if (!existingTask && shouldGenerateTaskToday(recurringTask, todayLocal)) {
        const nextDueDate = calculateNextDueDate(recurringTask.frequency, todayLocal);
        
        await ctx.db.insert("tasks", {
          name: recurringTask.name,
          status: "todo",
          priority: recurringTask.priority,
          notes: "",
          due: nextDueDate,
          recurringTaskId: recurringTask._id,
          userId: recurringTask.userId,
        });
        
        // Update the recurring task's due date for next calculation
        await ctx.db.patch(recurringTask._id, {
          due: nextDueDate,
          updated: now,
        });
        
        generatedCount++;
      }
    }

    console.log(
      `Generated ${generatedCount} recurring task instances at ${localNow.format("YYYY-MM-DD HH:mm:ss z")}`
    );
    return { generatedCount, skipped: false };
  },
});

