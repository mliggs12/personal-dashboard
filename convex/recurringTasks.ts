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
    priority: v.optional(
      v.union(v.literal("low"), v.literal("normal"), v.literal("high")),
    ),
    due: v.optional(v.string()),
    frequency: v.optional(
      v.union(
        v.literal("daily"),
        v.literal("3-day"),
        v.literal("weekly"),
        v.literal("monthly"),
      ),
    ),
    type: v.optional(v.union(v.literal("onSchedule"), v.literal("whenDone"))),
  },
  async handler(
    ctx,
    { recurringTaskId, name, status, priority, due, frequency, type },
  ) {
    const recurringTask = await ctx.db.get(recurringTaskId);
    if (recurringTask === null)
      throw new Error("Could not find recurring task");

    await ctx.db.patch(recurringTaskId, {
      name: name || recurringTask.name,
      status: status || recurringTask.status,
      priority: priority || recurringTask.priority,
      due: due || recurringTask.due,
      frequency: frequency || recurringTask.frequency,
      type: type || recurringTask.type,
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
