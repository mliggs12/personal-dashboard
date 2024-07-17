import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

import { getFormattedDate } from "../lib/utils";

export const list = query(async (ctx) => {
  return await ctx.db.query("schedules").collect();
});

export const get = query({
  args: { scheduleId: v.id("schedules") },
  async handler(ctx, { scheduleId }) {
    return await ctx.db.get(scheduleId);
  },
});

export const getByDate = query({
  args: {
    date: v.string(),
  },
  async handler(ctx, { date }) {
    return await ctx.db
      .query("schedules")
      .withIndex("by_date", (q) => q.eq("date", date))
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
    return await ctx.db.insert("schedules", {
      name: name,
      date: date,
      isTemplate: isTemplate,
      length: length,
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
  },
  async handler(ctx, { scheduleId, name, date, isTemplate, length }) {
    return await ctx.db.patch(scheduleId, {
      name: name,
      date: date,
      isTemplate: isTemplate,
      length: length,
    });
  },
});
