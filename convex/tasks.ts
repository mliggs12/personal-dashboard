import { getLocalDateString } from "../lib/utils";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// List tasks in order
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
    status: v.union(
      v.literal("backlog"),
      v.literal("todo"),
      v.literal("in_progress"),
      v.literal("done"),
      v.literal("cancelled"),
      v.literal("archived"),
    ),
    priority: v.union(v.literal("low"), v.literal("normal"), v.literal("high")),
    deadline: v.optional(v.string()), // YYYY-MM-DD
    notes: v.optional(v.string()),
  },
  async handler(ctx, { name, status, priority, deadline, notes }) {
    return await ctx.db.insert("tasks", {
      name,
      status,
      priority,
      deadline,
      notes,
    });
  },
});

export const remove = mutation({
  args: { taskId: v.id("tasks") },
  async handler(ctx, { taskId }) {
    return await ctx.db.delete(taskId);
  },
});

export const removeMany = mutation({
  args: { taskIds: v.array(v.id("tasks")) },
  async handler(ctx, { taskIds }) {
    for (const taskId of taskIds) {
      await ctx.db.delete(taskId);
    }
  },
});

export const completeTask = mutation({
  args: { taskId: v.id("tasks") },
  async handler(ctx, { taskId }) {
    try {
      const completedTaskId = await ctx.db.patch(taskId, {
        status: "done",
      });

      return completedTaskId;
    } catch (err) {
      console.log("Error occurred during completeTask mutation", err);

      return null;
    }
  },
});

// Get tasks due today or overdue
export const todayTasks = query({
  async handler(ctx) {
    const today = getLocalDateString(Date.now());
    return (
      (await ctx.db
        .query("tasks")
        .filter((q) =>
          q.and(
            q.eq(q.field("status"), "todo" || "in_progress"),
            q.lte(q.field("deadline"), today),
          ),
        )
        .collect()) || []
    );
  },
});

// Get incomplete tasks with a deadline
export const deadlineTasks = query({
  async handler(ctx) {
    return (
      (await ctx.db
        .query("tasks")
        .filter((q) =>
          q.and(
            q.eq(q.field("status"), "todo" || "in_progress"),
            q.neq(q.field("deadline"), undefined),
          ),
        )
        .collect()) || []
    );
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
