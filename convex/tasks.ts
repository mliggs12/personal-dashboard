import { v } from "convex/values";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { mutation, query } from "./_generated/server";
import {
  getCurrentUser,
  getCurrentUserOrThrow,
  userByExternalId,
} from "./userHelpers";

dayjs.extend(timezone);
dayjs.extend(utc);
const TIMEZONE = "America/Denver";

// TODO: Abstract away user function

export const list = query(async (ctx) => {
  const user = await getCurrentUser(ctx);
  if (!user) {
    throw new Error("Unauthenticated call to mutation");
  }
  return await ctx.db
    .query("tasks")
    .withIndex("by_user", (q) => q.eq("userId", user._id))
    .collect();
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
      due: due,
      updated: Date.now(),
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
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Unauthenticated call to mutation");
    }

    return await ctx.db.delete(taskId);
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
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Unauthenticated call to mutation");
    }

    return await ctx.db.patch(taskId, {
      status: "todo",
      completed: undefined,
    });
  },
});

export const getByIntention = query({
  args: { intentionId: v.id("intentions") },
  async handler(ctx, { intentionId }) {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Unauthenticated call to mutation");
    }

    return await ctx.db
      .query("tasks")
      .filter((q) => q.eq(q.field("intentionId"), intentionId))
      .collect();
  },
});

// Get tasks due today or overdue
export const doTodayTasks = query({
  async handler(ctx) {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Unauthenticated call to mutation");
    }

    const todayStart = dayjs().tz(TIMEZONE).startOf("day").format("YYYY/MM/DD");

    return await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) =>
        q.and(
          q.lte(q.field("due"), todayStart), // TODO: Figure out if timezone is needed and/or which dayjs
          q.or(
            q.eq(q.field("status"), "todo"),
            q.eq(q.field("status"), "in_progress"),
          ),
        ),
      )
      .collect();
  },
});

export const backlogTasks = query({
  async handler(ctx) {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Unauthenticated call to mutation");
    }

    return await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("status"), "backlog"))
      .collect();
  },
});

export const completedTasks = query({
  async handler(ctx) {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Unauthenticated call to query");
    }

    return await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.neq(q.field("completed"), undefined))
      .collect();
  },
});

export const incompleteTasks = query({
  async handler(ctx) {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Unauthenticated call to query");
    }

    return await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("completed"), undefined))
      .collect();
  },
});

export const totalTasks = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Unauthenticated call to query");
    }
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.neq(q.field("completed"), undefined))
      .collect();
    return tasks.length || 0;
  },
});

export const updateNotes = mutation({
  args: { taskId: v.id("tasks"), notes: v.optional(v.string()) },
  async handler(ctx, { taskId, notes }) {
    return await ctx.db.patch(taskId, {
      notes: notes || "",
      updated: Date.now(),
    });
  },
});

export const updateDue = mutation({
  args: {
    taskId: v.id("tasks"),
    due: v.optional(v.string()),
  },
  async handler(ctx, { taskId, due }) {
    return await ctx.db.patch(taskId, {
      due,
      updated: Date.now(),
    });
  },
});

export const updateStatus = mutation({
  args: {
    taskId: v.id("tasks"),
    status: v.union(
      v.literal("backlog"),
      v.literal("todo"),
      v.literal("in_progress"),
      v.literal("done"),
      v.literal("archived"),
    ),
  },
  async handler(ctx, { taskId, status }) {
    return await ctx.db.patch(taskId, {
      status,
      updated: Date.now(),
    });
  },
});

export const updatePriority = mutation({
  args: {
    taskId: v.id("tasks"),
    priority: v.union(v.literal("low"), v.literal("normal"), v.literal("high")),
  },
  async handler(ctx, { taskId, priority }) {
    return await ctx.db.patch(taskId, {
      priority,
      updated: Date.now(),
    });
  },
});

export const recurringTasks = query({
  args: {},
  async handler(ctx) {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Unauthenticated call to query");
    }

    return await ctx.db
      .query("recurringTasks")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
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
