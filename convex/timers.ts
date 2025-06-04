import { v } from "convex/values";

import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { internalMutation, mutation, query } from "./_generated/server";
import { getCurrentUserOrThrow } from "./users";

export const create = internalMutation({
  args: {
    duration: v.number(),
  },
  async handler(ctx, { duration }) {
    const user = await getCurrentUserOrThrow(ctx);

    return await ctx.db.insert("timers", {
      start: Date.now(),
      duration,
      isActive: true,
      userId: user._id,
    });
  },
});

export const start = mutation({
  args: {
    duration: v.optional(v.number()),
  },
  async handler(ctx, { duration }) {
      const user = await getCurrentUserOrThrow(ctx);

      const existing = await ctx.runQuery(api.timers.getCurrent);
      
      if (existing) {
        await ctx.db.patch(existing._id, {
          start: Date.now(),
          duration: duration ?? 5,
          isActive: true,
          userId: user._id,
        });
      } else {
        await ctx.runMutation(internal.timers.create, { duration: duration ?? 5 });
    }
  },
});

export const pause = mutation({
  args: { timerId: v.id("timers") },
  async handler(ctx, { timerId }) {
    const existing = await ctx.db.get(timerId);
    if (!existing) return null;

    const elapsed = Math.floor((Date.now() - existing.start) / 1000);
    const newDuration = Math.max(existing.duration - elapsed, 0);

    await ctx.db.patch(timerId, {
      duration: newDuration,
      isActive: false,
    });
  },
});

export const completeInterval = mutation({
  args: { timerId: v.id("timers") },
  async handler(ctx, { timerId }) {
    const existing = await ctx.db.get(timerId);
    if (!existing) return null;

    await ctx.db.patch(timerId, {
      duration: existing.duration,
      isActive: false,
    });
  },
});

export const getCurrent = query({
  async handler(ctx) {
    const user = await getCurrentUserOrThrow(ctx);

    return await ctx.db
      .query("timers")
      .withIndex("by_user", (q) =>
        q.eq("userId", user._id)
      )
      .first();
  },
});

export const deactivateTimer = internalMutation({
  args: { userId: v.string() },
  async handler(ctx, { userId }) {
    const existing = await ctx.db
      .query("timers")
      .withIndex("by_user", (q) =>
        q.eq("userId", userId as Id<"users">)
      )
      .filter(q => q.eq(q.field("isActive"), true))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { isActive: false });
    }
  },
});