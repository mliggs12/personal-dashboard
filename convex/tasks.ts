import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

import { getLocalDateString } from "../lib/utils";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

dayjs.extend(timezone);
dayjs.extend(utc);
const TIMEZONE = "America/Denver";

export const list = query(async (ctx) => {
  return await ctx.db.query("tasks").collect();
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
    due: v.optional(v.string()), // YYYY-MM-DD
    notes: v.optional(v.string()),
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
    intentionId: v.optional(v.id("intentions")),
  },
  async handler(ctx, { name, status, priority, due, notes, intentionId }) {
    return await ctx.db.insert("tasks", {
      name,
      due,
      updated: Date.now(),
      notes: notes || "",
      status: status || "backlog",
      priority: priority || "normal",
      intentionId: intentionId || undefined,
    });
  },
});

export const remove = mutation({
  args: { taskId: v.id("tasks") },
  async handler(ctx, { taskId }) {
    return await ctx.db.delete(taskId);
  },
});

export const completeTask = mutation({
  args: { taskId: v.id("tasks") },
  async handler(ctx, { taskId }) {
    const now = Date.now();
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
    return await ctx.db.patch(taskId, {
      status: "todo",
      completed: undefined,
      updated: Date.now(),
    });
  },
});

// Get tasks due today or overdue
export const todayTasks = query({
  async handler(ctx) {
    const today = getLocalDateString(Date.now());
    return await ctx.db
      .query("tasks")
      .filter((q) =>
        q.and(q.eq(q.field("status"), "todo"), q.lte(q.field("due"), today)),
      )
      .collect();
  },
});

export const openTasks = query({
  async handler(ctx) {
    return (
      (await ctx.db
        .query("tasks")
        .filter((q) => q.eq(q.field("status"), "backlog"))
        .collect()) || []
    );
  },
});

export const getByIntention = query({
  args: { intentionId: v.id("intentions") },
  async handler(ctx, { intentionId }) {
    return (
      (await ctx.db
        .query("tasks")
        .filter((q) => q.eq(q.field("intentionId"), intentionId))
        .collect()) || []
    );
  },
});

// Get tasks due today or overdue
export const doTodayTasks = query({
  async handler(ctx) {
    const today = dayjs().tz(TIMEZONE).format("YYYY/MM/DD");

    return await ctx.db
      .query("tasks")
      .filter((q) =>
        q.or(
          q.and(q.neq(q.field("due"), undefined), q.lte(q.field("due"), today)),
          q.or(
            q.eq(q.field("status"), "todo"),
            q.eq(q.field("status"), "in_progress"),
          ),
        ),
      )
      .collect();
  },
});

// Get all incomplete tasks with a due date that is today or overdue
export const deadlineTasks = query({
  async handler(ctx) {
    const today = dayjs().tz(TIMEZONE).format("YYYY/MM/DD");
    return await ctx.db
      .query("tasks")
      .filter((q) =>
        q.and(
          q.eq(q.field("completed"), undefined),
          q.neq(q.field("due"), undefined),
          q.lte(q.field("due"), today),
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
