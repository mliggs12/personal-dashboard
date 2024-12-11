import { v } from "convex/values";
import dayjs from "dayjs";
import { mutation, query } from "./_generated/server";
import { getCurrentUserOrThrow } from "./userHelpers";
import { getUserWaterEntries } from "./waterLogHelpers";

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
  async handler(ctx) {
    const user = await getCurrentUserOrThrow(ctx);

    const now = Date.now();
    const dayStart = dayjs(now).startOf("day").valueOf();
    const dayEnd = dayjs(now).endOf("day").valueOf();

    return await getUserWaterEntries(ctx, user._id, dayStart, dayEnd);
  },
});

export const dailyTotal = query({
  async handler(ctx) {
    const user = await getCurrentUserOrThrow(ctx);

    const now = Date.now();
    const dayStart = dayjs(now).startOf("day").valueOf();
    const dayEnd = dayjs(now).endOf("day").valueOf();

    const entries = await getUserWaterEntries(ctx, user._id, dayStart, dayEnd);

    return entries.reduce((total, entry) => total + entry.amount, 0);
  },
});
