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
  args: { taskName: v.string() },
  async handler(ctx, { taskName }) {
    return await ctx.db.insert("tasks", {
      name: taskName,
      status: "backlog",
      isPreselected: false,
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
        isPreselected: false,
      });

      return completedTaskId;
    } catch (err) {
      console.log("Error occurred during completeTask mutation", err);

      return null;
    }
  },
});

export const preselectTask = mutation({
  args: { taskId: v.id("tasks") },
  async handler(ctx, { taskId }) {
    try {
      const preselectedTaskId = await ctx.db.patch(taskId, {
        isPreselected: true,
      });

      return preselectedTaskId;
    } catch (err) {
      console.log("Error occurred during preselectTask mutation", err);

      return null;
    }
  },
});

export const unPreselectTask = mutation({
  args: { taskId: v.id("tasks") },
  async handler(ctx, { taskId }) {
    try {
      const unPreselectedTaskId = await ctx.db.patch(taskId, {
        isPreselected: false,
      });

      return unPreselectedTaskId;
    } catch (err) {
      console.log("Error occurred during unPreselectTask mutation", err);

      return null;
    }
  },
});

export const unPreselectAll = mutation({
  handler: async (ctx) => {
    const preselectedTasks = await ctx.db
      .query("tasks")
      .filter((q) => q.eq(q.field("isPreselected"), true))
      .collect();

    for (const task of preselectedTasks) {
      await ctx.db.patch(task._id, {
        isPreselected: false,
      });
    }
  },
});

export const incompleteTasks = query({
  handler: async (ctx) => {
    return await ctx.db.query("tasks").collect();
  },
});

export const preselectedTasks = query({
  handler: async (ctx) => {
    const items = await ctx.db
      .query("tasks")
      .filter((q) => q.eq(q.field("isPreselected"), true))
      .collect();

    return items.reverse();
  },
});
