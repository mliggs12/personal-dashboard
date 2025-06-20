import { v } from "convex/values";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

import { api } from "./_generated/api";
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

export const byDate = query({
  args: {
    date: v.string(),
  },
  async handler(ctx, { date }) {
    const user = await getCurrentUserOrThrow(ctx);

    return await ctx.db
      .query("schedules")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("date"), date))
      .first();
  },
});

export const getOrCreateByDate = mutation({
  args: {
    date: v.string(),
    length: v.optional(v.number()),
    isTemplate: v.optional(v.boolean()),
  },
  async handler(ctx, { date, length, isTemplate }) {
    const user = await getCurrentUserOrThrow(ctx);

    let schedule = await ctx.db
      .query("schedules")
      .withIndex("by_user_date", (q) => q.eq("userId", user._id).eq("date", date))
      .first();

    if (!schedule) {
      const id = await ctx.db.insert("schedules", {
        date,
        length: length ?? 16.5,
        isTemplate: isTemplate ?? false,
        updated: Date.now(),
        userId: user._id,
      });
      schedule = await ctx.db.get(id);
      if (!schedule) {
        throw new Error("Failed to create schedule");
      }
    }
    return schedule;
  },
});

export const create = mutation({
  args: {
    date: v.string(),
  },
  async handler(ctx, { date }) {
    const user = await getCurrentUserOrThrow(ctx);

    return await ctx.db.insert("schedules", {
      date,
      isTemplate: false,
      length: 16.5,
      updated: Date.now(),
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
