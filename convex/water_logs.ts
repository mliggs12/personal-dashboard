import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

import { getLocalDateString } from "../lib/utils";

export const list = query(async (ctx) => {
  return await ctx.db.query("water_logs").collect();
});

export const get = query({
  args: { waterLogId: v.id("water_logs") },
  async handler(ctx, { waterLogId }) {
    return await ctx.db.get(waterLogId);
  },
});

// Get the water log for a specific date
export const getWaterLogByDate = query({
  args: { date: v.string() },
  async handler(ctx, { date }) {
    return await ctx.db
      .query("water_logs")
      .withIndex("by_date", (q) => q.eq("date", date))
      .unique();
  },
});

export const todayWaterLog = mutation({
  args: { date: v.string() },
  async handler(ctx, { date }) {
    let waterLog = await ctx.db
      .query("water_logs")
      .withIndex("by_date", (q) => q.eq("date", date))
      .unique();
    if (!waterLog) {
      const waterLogId = await ctx.db.insert("water_logs", {
        date: date,
        consumed: 0,
      });
      waterLog = await ctx.db.get(waterLogId);
    }
    return waterLog;
  },
});

export const create = mutation({
  args: { date: v.string() },
  async handler(ctx, { date }) {
    return await ctx.db.insert("water_logs", {
      date: date,
      consumed: 0,
    });
  },
});

export const updateWaterLog = mutation({
  args: {
    consumed: v.number(),
    waterLogId: v.id("water_logs"),
  },
  async handler(ctx, { consumed, waterLogId }) {
    await ctx.db.patch(waterLogId, { consumed: consumed });
  },
});
