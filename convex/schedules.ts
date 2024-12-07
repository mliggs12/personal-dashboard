import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUserOrThrow } from "./userHelpers";

export const list = query(async (ctx) => {
  const user = await getCurrentUserOrThrow(ctx);

  return await ctx.db
    .query("schedules")
    .withIndex("by_user", (q) => q.eq("userId", user._id))
    .collect();
});

export const listTemplates = query(async (ctx) => {
  const user = await getCurrentUserOrThrow(ctx);

  return await ctx.db
    .query("schedules")
    .withIndex("by_user", (q) => q.eq("userId", user._id))
    .filter((q) => q.eq(q.field("isTemplate"), true))
    .collect();
});

export const get = query({
  args: { scheduleId: v.id("schedules") },
  async handler(ctx, { scheduleId }) {
    return await ctx.db.get(scheduleId);
  },
});

export const getOrderedActivities = query({
  args: { scheduleId: v.id("schedules") },
  async handler(ctx, { scheduleId }) {
    const activities = await ctx.db
      .query("activities")
      .filter((q) => q.eq(q.field("scheduleId"), scheduleId))
      .collect();

    if (activities.length === 0) {
      return [];
    }

    return activities.sort((a, b) => a.index - b.index);
  },
});

export const getByDate = query({
  args: {
    date: v.string(),
  },
  async handler(ctx, { date }) {
    const user = await getCurrentUserOrThrow(ctx);

    return await ctx.db
      .query("schedules")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq("date", date))
      .first();
  },
});

export const createSchedule = mutation({
  args: {
    name: v.string(),
    date: v.optional(v.string()),
    isTemplate: v.boolean(),
    length: v.number(),
  },
  async handler(ctx, { name, date, isTemplate, length }) {
    const user = await getCurrentUserOrThrow(ctx);

    return await ctx.db.insert("schedules", {
      name: name,
      date: date,
      isTemplate: isTemplate,
      length: length,
      userId: user._id,
    });
  },
});

export const updateSchedule = mutation({
  args: {
    scheduleId: v.id("schedules"),
    name: v.optional(v.string()),
    date: v.optional(v.string()),
    isTemplate: v.optional(v.boolean()),
    length: v.optional(v.number()),
    start: v.optional(v.number()),
  },
  async handler(ctx, { scheduleId, name, date, isTemplate, length, start }) {
    const user = await getCurrentUserOrThrow(ctx);

    return await ctx.db.patch(scheduleId, {
      name: name,
      date: date,
      isTemplate: isTemplate,
      length: length,
      updated: Date.now(),
      userId: user._id,
    });
  },
});

export const deleteSchedule = mutation({
  args: {
    scheduleId: v.id("schedules"),
  },
  async handler(ctx, { scheduleId }) {
    return await ctx.db.delete(scheduleId);
  },
});

export const templateSchedules = query({
  async handler(ctx) {
    const user = await getCurrentUserOrThrow(ctx);

    return await ctx.db
      .query("schedules")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("isTemplate"), true))
      .collect();
  },
});
