import { v } from "convex/values";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

import { timestampToShortDateTime } from "../lib/date.utils";

import { mutation, query } from "./_generated/server";
import { getCurrentUserOrThrow } from "./users";

dayjs.extend(utc);
dayjs.extend(timezone);

export const create = mutation({
  args: {
    start: v.number(),
    end: v.number(),
    duration: v.number(), // Active focus time
    pauseDuration: v.optional(v.number()), // Total paused time
    totalElapsed: v.optional(v.number()), // Total wall-clock time
    timerType: v.optional(v.union(v.literal("session"), v.literal("tithe"))),
    intentionId: v.optional(v.id("intentions")),
    description: v.optional(v.string()),
  },
  async handler(ctx, { start, end, duration, pauseDuration, totalElapsed, timerType, intentionId, description }) {
    const user = await getCurrentUserOrThrow(ctx);

    await ctx.db.insert("sessions", {
      start,
      end,
      duration,
      pauseDuration,
      totalElapsed,
      timerType,
      description,
      updated: Date.now(),
      userId: user._id,
      intentionId,
    });
  },
});

export const getDaySessions = query({
  args: {
    timestamp: v.string(),
    userTimezone: v.string(),
  },
  async handler(ctx, { timestamp, userTimezone }) {
    const user = await getCurrentUserOrThrow(ctx);

    const dayStart = dayjs(timestamp).tz(userTimezone).startOf("day").valueOf();
    const dayEnd = dayjs(timestamp).tz(userTimezone).endOf("day").valueOf();
    console.log("Fetching sessions for user:", user._id, "from", timestampToShortDateTime(dayStart), "to", timestampToShortDateTime(dayEnd));

    return await ctx.db
      .query("sessions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) =>
        q.and(
          q.gte(q.field("start"), dayStart),
          q.lt(q.field("start"), dayEnd)
        )
      )
      .collect();
  },
});