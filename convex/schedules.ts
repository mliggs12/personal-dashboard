import { v } from "convex/values";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

import { mutation, query } from "./_generated/server";
import { getCurrentUserOrThrow } from "./users";

dayjs.extend(utc);
dayjs.extend(timezone);

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

    return activities;
  },
});

export const todaySchedule = query({
  args: {
    timezone: v.string(),
  },
  async handler(ctx, { timezone }) {
    const user = await getCurrentUserOrThrow(ctx);

    const today = dayjs().tz(timezone).format("YYYY/MM/DD");

    return await ctx.db
      .query("schedules")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("date"), today))
      .unique();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    date: v.optional(v.string()),
    length: v.optional(v.number()),
  },
  async handler(ctx, { name, date, length }) {
    const user = await getCurrentUserOrThrow(ctx);

    return await ctx.db.insert("schedules", {
      name,
      date,
      isTemplate: false,
      length: length || 16,
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
