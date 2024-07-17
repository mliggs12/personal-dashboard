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
    return await ctx.db
      .query("activities")
      .filter((q) => q.eq(q.field("scheduleId"), scheduleId))
      .collect();
  },
});

export const addActivity = mutation({
  args: {
    name: v.string(),
    scheduleId: v.id("schedules"),
  },
  async handler(ctx, { name, scheduleId }) {
    const activityId = await ctx.db.insert("activities", {
      name: name,
      start: 0,
      length: 25,
      isForced: false,
      isRigid: false,
      order: 0,
      scheduleId: scheduleId,
    });
    return activityId;
  },
});

export const createSchedule = mutation({
  args: { name: v.string() },
  async handler(ctx, { name }) {
    const scheduleId = await ctx.db.insert("schedules", {
      name: name,
      isTemplate: false,
      length: 17.75,
    });
    return scheduleId;
  },
});
