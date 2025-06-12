import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

import { mutation, query } from "./_generated/server";
import { getCurrentUserOrThrow, userByExternalId } from "./users";

dayjs.extend(isToday);
dayjs.extend(timezone);
dayjs.extend(utc);
const TIMEZONE = "America/Denver";

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
    return await ctx.db.patch(taskId, {
      status: "done",
      completed: Date.now(),
    });
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

// Get tasks due today or overdue
export const getTasks = query({
  args: { paginationOpts: paginationOptsValidator },
  async handler(ctx, { paginationOpts }) {
    const user = await getCurrentUserOrThrow(ctx);

    return await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) =>
          q.or(
            q.eq(q.field("status"), "backlog"),
            q.eq(q.field("status"), "todo"),
            q.eq(q.field("status"), "in_progress"),
          ),
      )
      .paginate(paginationOpts);
  },
});

export const backlogTasks = query({
  args: { paginationOpts: paginationOptsValidator },
  async handler(ctx, { paginationOpts }) {
    const user = await getCurrentUserOrThrow(ctx);

    return await ctx.db
      .query("tasks")
      .withIndex("by_user_status", (q) =>
        q
          .eq("userId", user._id)
          .eq("status", "backlog")
      )
      .paginate(paginationOpts);
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

    await ctx.db.patch(taskId, {
      name: name || task.name,
      status: status || task.status,
      priority: priority || task.priority,
      notes: notes || task.notes,
      due: due || task.due,
      completed: completed || task.completed,
      recurringTaskId: recurringTaskId || task.recurringTaskId,
      intentionId: intentionId || task.intentionId,
      parentTaskId: parentTaskId || task.parentTaskId,
      userId: userId || task.userId,
      updated: Date.now(),
    });
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
      v.literal("daysAfter"),
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
