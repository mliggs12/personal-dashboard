import { v } from "convex/values";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { NextDueDate } from "../lib/tasks.utils";
import { internal } from "./_generated/api";
import { internalMutation, mutation, query } from "./_generated/server";

dayjs.extend(timezone);
dayjs.extend(utc);
const TIMEZONE = "America/Denver";

// TODO: Abstract away user function

export const list = query(async (ctx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthenticated call to mutation");
  }
  const user = await ctx.db
    .query("users")
    .withIndex("by_token", (q) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier),
    )
    .unique();
  if (!user) {
    throw new Error("Unauthenticated call to mutation");
  }
  return await ctx.db
    .query("tasks")
    .filter((q) =>
      q.and(
        q.eq(q.field("userId"), user._id),
        q.neq(q.field("recurringTaskId"), undefined),
      ),
    )
    .collect();
});

export const get = query({
  args: { taskId: v.id("tasks") },
  async handler(ctx, { taskId }) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated call to mutation");
    }
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
    if (!user) {
      throw new Error("Unauthenticated call to mutation");
    }

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
        v.literal("cancelled"),
        v.literal("archived"),
      ),
    ),
    priority: v.optional(
      v.union(v.literal("low"), v.literal("normal"), v.literal("high")),
    ),
    notes: v.optional(v.string()),
    due: v.optional(v.string()), // YYYY-MM-DD
    frequency: v.optional(
      v.union(v.literal("daily"), v.literal("3-day"), v.literal("weekly")), // omitted for single tasks or instances of recurring tasks
    ),
    intentionId: v.optional(v.id("intentions")),
  },
  async handler(
    ctx,
    { name, status, priority, notes, due, frequency, intentionId },
  ) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated call to mutation");
    }
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
    if (!user) {
      throw new Error("Unauthenticated call to mutation");
    }

    priority = priority || "normal";
    notes = notes || "";
    const recurCount = frequency ? 0 : undefined;

    const taskId = await ctx.db.insert("tasks", {
      name,
      status: status && frequency ? "in_progress" : status,
      priority,
      notes,
      due,
      updated: Date.now(),
      frequency,
      recurCount,
      intentionId,
      userId: user._id,
    });

    if (frequency) {
      await ctx.runMutation(internal.tasks.createRecurringInstance, {
        name,
        priority,
        notes,
        due: due!,
        frequency,
        recurCount: recurCount!,
        recurringTaskId: taskId,
        intentionId,
        userId: user._id,
      });
    }
  },
});

export const createRecurringInstance = internalMutation({
  args: {
    name: v.string(),
    priority: v.optional(
      v.union(v.literal("low"), v.literal("normal"), v.literal("high")),
    ),
    notes: v.optional(v.string()),
    due: v.string(),
    frequency: v.union(
      v.literal("daily"),
      v.literal("3-day"),
      v.literal("weekly"), // omitted for single tasks or instances of recurring tasks
    ),
    recurCount: v.number(),
    recurringTaskId: v.id("tasks"),
    intentionId: v.optional(v.id("intentions")),
    userId: v.id("users"),
  },
  async handler(
    ctx,
    {
      name,
      priority,
      notes,
      due,
      frequency,
      recurCount,
      recurringTaskId,
      intentionId,
      userId,
    },
  ) {
    await ctx.db.insert("tasks", {
      name,
      status: "todo",
      priority,
      notes,
      due: recurCount === 0 ? due : NextDueDate(frequency),
      updated: Date.now(),
      recurringTaskId,
      intentionId,
      userId,
    });
    await ctx.runMutation(internal.tasks.updateRecurCount, { recurringTaskId });
  },
});

export const updateRecurCount = internalMutation({
  args: {
    recurringTaskId: v.id("tasks"),
  },
  async handler(ctx, { recurringTaskId }) {
    const recurringTask = await ctx.db.get(recurringTaskId);
    if (!recurringTask) {
      throw Error("Recurring task not found");
    }

    return await ctx.db.patch(recurringTaskId, {
      recurCount: (recurringTask.recurCount! += 1),
      updated: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { taskId: v.id("tasks") },
  async handler(ctx, { taskId }) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated call to mutation");
    }
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
    if (!user) {
      throw new Error("Unauthenticated call to mutation");
    }

    return await ctx.db.delete(taskId);
  },
});

export const completeTask = mutation({
  args: { taskId: v.id("tasks") },
  async handler(ctx, { taskId }) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated call to mutation");
    }
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
    if (!user) {
      throw new Error("Unauthenticated call to mutation");
    }

    const now = Date.now();
    const task = await ctx.db.get(taskId);
    if (!task) throw Error("Task not found");
    if (task.recurringTaskId !== undefined) {
      const recurringTask = await ctx.db.get(task.recurringTaskId);
      if (!recurringTask) throw Error("Recurring task not found");
      const {
        name,
        priority,
        notes,
        due,
        frequency,
        recurCount,
        intentionId,
        userId,
      } = recurringTask;
      await ctx.runMutation(internal.tasks.createRecurringInstance, {
        name,
        priority,
        notes,
        due: due!,
        frequency: frequency!,
        recurCount: recurCount!,
        recurringTaskId: recurringTask._id,
        intentionId,
        userId: userId!,
      });
    }
    return await ctx.db.patch(taskId, {
      status: "done",
      completed: now,
      updated: now,
    });
  },
});

export const unCompleteTask = mutation({
  args: { taskId: v.id("tasks") },
  async handler(ctx, { taskId }) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated call to mutation");
    }
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
    if (!user) {
      throw new Error("Unauthenticated call to mutation");
    }

    return await ctx.db.patch(taskId, {
      status: "todo",
      completed: undefined,
      updated: Date.now(),
    });
  },
});

export const getByIntention = query({
  args: { intentionId: v.id("intentions") },
  async handler(ctx, { intentionId }) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated call to mutation");
    }
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated call to mutation");
    }
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
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
          q.eq(q.field("frequency"), undefined),
        ),
      )
      .collect();
  },
});

export const backlogTasks = query({
  async handler(ctx) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated call to mutation");
    }
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
    if (!user) {
      throw new Error("Unauthenticated call to mutation");
    }

    return await ctx.db
      .query("tasks")
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "backlog"),
          q.eq(q.field("userId"), user._id),
        ),
      )
      .collect();
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
      v.literal("cancelled"),
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated call to mutation");
    }
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
    if (!user) {
      throw new Error("Unauthenticated call to mutation");
    }

    return await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.neq(q.field("frequency"), undefined))
      .collect();
  },
});
