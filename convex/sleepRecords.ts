import { v } from "convex/values";

import { Id } from "./_generated/dataModel";
import { internalMutation, mutation, query } from "./_generated/server";
import { getCurrentUserOrThrow } from "./userHelpers";

export const getActiveSleepSession = query({
  async handler(ctx) {
    const user = await getCurrentUserOrThrow(ctx);

    return await ctx.db
      .query("sleepRecords")
      .withIndex("by_active_user", (q) =>
        q.eq("isActive", true).eq("userId", user._id),
      )
      .unique();
  },
});

export const closeActiveRecords = internalMutation({
  args: { userId: v.string() },
  async handler(ctx, { userId }) {
    const activeRecords = await ctx.db
      .query("sleepRecords")
      .withIndex("by_active_user", (q) =>
        q.eq("isActive", true).eq("userId", userId as Id<"users">),
      )
      .collect();

    for (const record of activeRecords) {
      await ctx.db.patch(record._id, {
        isActive: false,
        updated: Date.now(),
        userId: userId as Id<"users">,
      });
    }
  },
});

export const recordSleepStart = mutation({
  args: { timestamp: v.number() },
  async handler(ctx, { timestamp }) {
    const user = await getCurrentUserOrThrow(ctx);

    await closeActiveRecords(ctx, { userId: user._id });

    return await ctx.db.insert("sleepRecords", {
      userId: user._id,
      sleepStart: timestamp,
      isActive: true,
      updated: Date.now(),
    });
  },
});

export const recordSleepEnd = mutation({
  args: {
    recordId: v.id("sleepRecords"),
    timestamp: v.number(),
  },
  async handler(ctx, { recordId, timestamp }) {
    return await ctx.db.patch(recordId, {
      sleepEnd: timestamp,
      isActive: false,
      updated: Date.now(),
    });
  },
});
