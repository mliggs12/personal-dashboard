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
    notes: v.optional(v.string()),
  },
  async handler(ctx, { name, status, priority, notes }) {
    return await ctx.db.insert("tasks", {
      name,
      status,
      priority,
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

export const incompleteTasks = query({
  handler: async (ctx) => {
    return await ctx.db.query("tasks").collect();
  },
});
