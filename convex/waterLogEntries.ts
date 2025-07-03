import { v } from "convex/values";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

import { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { getCurrentUserOrThrow } from "./users";

dayjs.extend(timezone);
dayjs.extend(utc);

export const create = mutation({
  args: {
    amount: v.number(),
    type: v.optional(v.string()), // eg. "coffee", "energy drink", "sports drink", "juice"
  },
  async handler(ctx, { amount, type }) {
    const user = await getCurrentUserOrThrow(ctx);

    await ctx.db.insert("waterLogEntries", {
      userId: user._id,
      amount,
      timestamp: dayjs().toISOString(),
      type,
    });
  },
});

export const dailyEntries = query({
  args: {
    timestamp: v.string(),
    userTimezone: v.string(),
  },
  async handler(ctx, { timestamp, userTimezone }) {
    const user = await getCurrentUserOrThrow(ctx);

    const dayStart = dayjs(timestamp).tz(userTimezone).startOf("day").toISOString();
    const dayEnd = dayjs(timestamp).tz(userTimezone).endOf("day").toISOString();

    const entries = await ctx.db
      .query("waterLogEntries")
      .withIndex("by_user_timestamp", (q) =>
        q
          .eq("userId", user._id as Id<"users">)
          .gte("timestamp", dayStart)
          .lt("timestamp", dayEnd),
      )
      .collect();

    const dayTotalConsumed = entries.reduce((sum, entry) => sum + (entry.amount || 0), 0);

    return {
      entries,
      dayTotalConsumed,
    };
  },
});