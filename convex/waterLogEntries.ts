import { v } from "convex/values";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

import { mutation, query } from "./_generated/server";
import { getCurrentUserOrThrow } from "./users";
import { getUserWaterEntries } from "./waterLogHelpers";

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
      amount,
      type,
      timestamp: Date.now(),
      userId: user._id,
    });
  },
});

export const dailyEntries = query({
  args: { tz: v.string() },
  async handler(ctx, { tz }) {
    const user = await getCurrentUserOrThrow(ctx);

    const dayStart = dayjs().tz(tz).startOf("day").valueOf();
    const dayEnd = dayjs().tz(tz).endOf("day").valueOf();

    return await getUserWaterEntries(ctx, user._id, dayStart, dayEnd);
  },
});

export const dailyTotal = query({
  args: { tz: v.string() },
  async handler(ctx, { tz }) {
    const user = await getCurrentUserOrThrow(ctx);

    const dayStart = dayjs().tz(tz).startOf("day").valueOf();
    const dayEnd = dayjs().tz(tz).endOf("day").valueOf();

    const entries = await getUserWaterEntries(ctx, user._id, dayStart, dayEnd);

    return entries.reduce((total, entry) => total + entry.amount, 0);
  },
});
