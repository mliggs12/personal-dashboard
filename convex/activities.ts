import { v } from "convex/values";

import { Id } from "./_generated/dataModel";
import { mutation, query, QueryCtx, internalQuery } from "./_generated/server";
import { getCurrentUserOrThrow } from "./users";

export const byScheduleOrder = query({
  args: {
    scheduleId: v.id("schedules"),
  },
  async handler(ctx, { scheduleId }) {
    const orderedActivities = await ctx.db
      .query("activities")
      .withIndex("by_schedule_order", (q) =>
        q.eq("scheduleId", scheduleId)
      ).collect()

    return orderedActivities
  },
});

export const create = mutation({
  args: {
    scheduleId: v.id("schedules"),
  },
  async handler(ctx, { scheduleId }) {
    const { nextStart, nextOrder } = await getScheduleStats(ctx, scheduleId);

    await ctx.db.insert("activities", {
      name: "-",
      length: 25,
      order: nextOrder,
      start: nextStart,
      isForced: false,
      isRigid: false,
      scheduleId,
    }); 
  },
});

async function getScheduleStats(ctx: QueryCtx, scheduleId: Id<"schedules">) {

  const activities = await ctx.db
    .query("activities")
    .withIndex("by_schedule_order", (q) => q.eq("scheduleId", scheduleId)
  ).collect();

    let nextOrder = 0
    let nextStart = 0
    
    const count = activities.length;
    if (count > 0) {
      const lastActivity = activities[count - 1];
      nextStart = lastActivity.start + lastActivity.length;
      nextOrder = lastActivity.order + 1
    }

    return {
      nextStart,
      nextOrder
  };
}

export const update = mutation({
  args: {
    id: v.id("activities"),
    name: v.optional(v.string()),
    length: v.optional(v.number()),
    start: v.optional(v.number()),
    order: v.optional(v.number()),
    isForced: v.optional(v.boolean()),
    isRigid: v.optional(v.boolean()),
  },
  async handler(ctx, { id, name, length, start, order, isForced, isRigid }) {
    const existing = await ctx.db.get(id);
    if (!existing) {
      throw new Error("Activity not found");
    }

    if (length) {
      // Change subsequent activity's start
      
    }

    await ctx.db.patch(id, {
      name: name ?? existing.name,
      length: length ?? existing.length,
      start: start ?? existing.start,
      order: order ?? existing.order,
      isForced: isForced ?? existing.isForced,
      isRigid: isRigid ?? existing.isRigid,
    });
  },
});

async function handleLengthChange(ctx: QueryCtx, scheduleId: Id<"schedules">) {
  const activities = await ctx.db
    .query("activities")
    .withIndex("by_schedule_order", (q) => q.eq("scheduleId", scheduleId)
  ).collect();

  
}
