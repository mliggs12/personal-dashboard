import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { getCurrentUserOrThrow } from "./users";

export const get = query({
  args: { recurringTaskId: v.optional(v.id("recurringTasks")) },
  async handler(ctx, { recurringTaskId }) {
    if (recurringTaskId) {
      return await ctx.db.get(recurringTaskId);
    }
    return;
  },
});

export const update = mutation({
  args: {
    recurringTaskId: v.id("recurringTasks"),
    name: v.optional(v.string()),
    status: v.optional(
      v.union(v.literal("active"), v.literal("paused"), v.literal("archived")),
    ),
    frequency: v.optional(
      v.union(
        v.literal("daily"),
        v.literal("3-day"),
        v.literal("weekly"),
        v.literal("monthly"),
      ),
    ),
    type: v.optional(v.union(v.literal("onSchedule"), v.literal("whenDone"))),
    nextRunDate: v.optional(v.string()),
    notes: v.optional(v.string()),
    priority: v.optional(
      v.union(v.literal("low"), v.literal("normal"), v.literal("high")),
    ),
  },
  async handler(
    ctx,
    { recurringTaskId, name, status, frequency, type, nextRunDate, priority, notes },
  ) {
    const recurringTask = await ctx.db.get(recurringTaskId);
    if (!recurringTask) {
      throw new Error("Recurring task not found");
    }

    await ctx.db.patch(recurringTaskId, {
      name: name || recurringTask.name,
      status: status || recurringTask.status,
      frequency: frequency || recurringTask.frequency,
      type: type || recurringTask.type,
      nextRunDate: nextRunDate || recurringTask.nextRunDate,
      notes: notes || recurringTask.notes,
      priority: priority || recurringTask.priority,
      updated: Date.now(),
    });
  },
});

export const recurringTasksWithStats = query({
  async handler(ctx) {
    const user = await getCurrentUserOrThrow(ctx);

    const recurringTasks = await ctx.db
      .query("recurringTasks")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    const recurringTasksWithStats = await Promise.all(
      recurringTasks.map(async (recurringTask) => {
        const instances = await ctx.db
          .query("tasks")
          .withIndex("by_recurringTaskId", (q) =>
            q.eq("recurringTaskId", recurringTask._id),
          )
          .order("desc")
          .collect();

        const count = instances.length ?? 0;
        const lastRecurrence = instances.length > 0 ? instances[0]._creationTime : undefined;

        return {
          ...recurringTask,
          stats: {
            count,
            lastRecurrence,
          },
        };
      }),
    );

    return recurringTasksWithStats;
  },
});

export const removePriorityFromAll = mutation({
  async handler(ctx) {
    // Get all recurringTasks
    const allRecurringTasks = await ctx.db.query("recurringTasks").collect();

    // Filter to only those that have priority set
    const tasksWithPriority = allRecurringTasks.filter(
      (task) => task.priority !== undefined,
    );

    // Remove priority from each task
    let updatedCount = 0;
    for (const task of tasksWithPriority) {
      await ctx.db.patch(task._id, {
        priority: undefined,
        updated: Date.now(),
      });
      updatedCount++;
    }

    return {
      totalTasks: allRecurringTasks.length,
      tasksWithPriority: tasksWithPriority.length,
      updatedCount,
    };
  },
});