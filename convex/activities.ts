import { v } from "convex/values";

import { Id } from "./_generated/dataModel";
import { mutation, query, QueryCtx, internalQuery } from "./_generated/server";
import { getCurrentUserOrThrow } from "./users";

export const byScheduleOrder = query({
  args: {
    scheduleId: v.id("schedules"),
  },
  async handler(ctx, { scheduleId }) {
    const schedule = await ctx.db.get(scheduleId)
    if (!schedule) throw new Error("Schedule not found");

    const activities = await ctx.db
      .query("activities")
      .withIndex("by_schedule_order", (q) =>
        q.eq("scheduleId", scheduleId)
      ).collect()

    // Calculate various stats
    const totalLength = activities.reduce((sum, activity) => sum + activity.length, 0);

    let currentStart = schedule.start ?? 0

    const result = activities.map(activity => {
      const actLen = Math.round((activity.length / totalLength) * (schedule.length * 60))

      const enriched = {
        ...activity,
        start: currentStart,
        actLen,
      }

      currentStart += actLen;
      return enriched;
    });

    return result;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    length: v.number(),
    scheduleId: v.id("schedules"),
  },
  async handler(ctx, { name, length, scheduleId }) {
    const { nextOrder, nextStart } = await getScheduleStats(ctx, scheduleId);

    await ctx.db.insert("activities", {
      name,
      length,
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

  const count = activities.length;
  let nextOrder = 0
  let nextStart = 0

  if (count > 0) {
    const lastActivity = activities[count - 1];
    nextOrder = lastActivity.order + 1
    nextStart = lastActivity.start + lastActivity.length;
  }

  return { count, nextOrder, nextStart };
}

export async function getActivityStats(ctx: QueryCtx, scheduleId: Id<"schedules">) {

  const activities = await ctx.db
    .query("activities")
    .withIndex("by_schedule_order", (q) => q.eq("scheduleId", scheduleId)
    ).collect();

  let totalLength = 0

  if (activities.length > 0) {
    for (const activity of activities) {
      totalLength += activity.length
    }
  }

  return totalLength
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
