import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query(async (ctx) => {
  return await ctx.db.query("activities").collect();
});

export const listBySchedule = query({
  args: {
    scheduleId: v.id("schedules"),
  },
  async handler(ctx, { scheduleId }) {
    const activities = await ctx.db
      .query("activities")
      .filter((q) => q.eq(q.field("scheduleId"), scheduleId))
      .collect();
    return activities.sort((a, b) => a.index - b.index);
  },
});

export const createActivity = mutation({
  args: {
    name: v.string(),
    scheduleId: v.id("schedules"),
    start: v.optional(v.number()),
  },
  async handler(ctx, { name, scheduleId, start }) {
    const orderedActivities = await listBySchedule(ctx, { scheduleId });

    let newIndex = 0;
    let newStart = start || 0;

    if (orderedActivities.length) {
      const highestIndexActivity =
        orderedActivities[orderedActivities.length - 1];

      newIndex = highestIndexActivity.index + 1;
      newStart = highestIndexActivity.start + highestIndexActivity.length;
    }

    return await ctx.db.insert("activities", {
      index: newIndex,
      name: name,
      start: newStart,
      length: 25,
      isForced: false,
      isRigid: false,
      scheduleId: scheduleId,
    });
  },
});

export const updateLength = mutation({
  args: {
    activityId: v.id("activities"),
    length: v.number(),
  },
  async handler(ctx, { activityId, length }) {
    return await ctx.db.patch(activityId, { length });
  },
});

export const updateActivities = mutation({
  args: {
    activities: v.array(
      v.object({
        _id: v.id("activities"),
        index: v.optional(v.number()),
        start: v.number(),
        length: v.number(),
        name: v.optional(v.string()),
        isForced: v.optional(v.boolean()),
        isRigid: v.optional(v.boolean()),
        scheduleId: v.id("schedules"),
      }),
    ),
  },
  async handler(ctx, { activities }) {
    for (const activity of activities) {
      await ctx.db.patch(activity._id, { ...activity });
    }
  },
});

export const updateActivity = mutation({
  args: {
    activityId: v.id("activities"),
    index: v.optional(v.number()),
    start: v.optional(v.number()),
    length: v.optional(v.number()),
    name: v.optional(v.string()),
    isForced: v.optional(v.boolean()),
    isRigid: v.optional(v.boolean()),
    scheduleId: v.optional(v.id("schedules")),
  },
  async handler(
    ctx,
    { activityId, index, start, length, name, isForced, isRigid, scheduleId },
  ) {
    return await ctx.db.patch(activityId, {
      index,
      start,
      length,
      name,
      isForced,
      isRigid,
      scheduleId,
    });
  },
});
