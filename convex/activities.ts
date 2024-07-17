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
  },
  async handler(ctx, { name, scheduleId }) {
    const orderedActivities = await listBySchedule(ctx, { scheduleId });

    let newIndex = 0;
    let newStart = 0;

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
