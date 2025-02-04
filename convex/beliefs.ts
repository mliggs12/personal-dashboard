import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { getCurrentUserOrThrow } from "./users";

export const list = query(async (ctx) => {
  const user = await getCurrentUserOrThrow(ctx);

  return await ctx.db
    .query("beliefs")
    .withIndex("by_user", (q) => q.eq("userId", user._id))
    .collect();
});

export const byIntention = query({
  args: {
    intentionId: v.id("intentions"),
  },
  async handler(ctx, { intentionId }) {
    return await ctx.db
      .query("beliefs")
      .withIndex("by_intention", (q) => q.eq("intentionId", intentionId))
      .collect();
  },
});

export const get = query({
  args: {
    beliefId: v.id("beliefs"),
  },
  async handler(ctx, { beliefId }) {
    return await ctx.db.get(beliefId);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    status: v.optional(
      v.union(
        v.literal("backlog"),
        v.literal("active"),
        v.literal("done"),
        v.literal("archived"),
      ),
    ),
    notes: v.optional(v.string()),
    intentionId: v.optional(v.id("intentions")),
  },
  async handler(ctx, { title, status, notes, intentionId }) {
    const user = await getCurrentUserOrThrow(ctx);

    return await ctx.db.insert("beliefs", {
      title,
      status: status || "active",
      notes: notes || "",
      intentionId,
      updated: Date.now(),
      userId: user._id,
    });
  },
});

export const remove = mutation({
  args: {
    beliefId: v.id("beliefs"),
  },
  async handler(ctx, { beliefId }) {
    await ctx.db.delete(beliefId);
  },
});

export const activeBeliefs = query({
  async handler(ctx) {
    const user = await getCurrentUserOrThrow(ctx);

    return await ctx.db
      .query("beliefs")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();
  },
});

export const activeBeliefsToday = query({
  args: {},
  async handler(ctx) {
    const user = await getCurrentUserOrThrow(ctx);

    // Current UTC timestamp
    const now = Date.now();

    // Convert to local time (UTC-6) and set start of day to 3 AM
    const localOffset = -6 * 60 * 60 * 1000; // UTC-6 in milliseconds
    const localNow = new Date(now + localOffset);
    const startOfDay = new Date(localNow);
    startOfDay.setHours(3, 0, 0, 0);
    // Convert back to UTC for comparison with _creationTime
    const startOfDayUTC = new Date(startOfDay.getTime() - localOffset);

    return await ctx.db
      .query("beliefs")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.gte(q.field("_creationTime"), startOfDayUTC.getTime()))
      .collect();
  },
});

export const update = mutation({
  args: {
    beliefId: v.id("beliefs"),
    title: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("backlog"),
        v.literal("active"),
        v.literal("done"),
        v.literal("archived"),
      ),
    ),
    notes: v.optional(v.string()),
  },
  async handler(ctx, { beliefId, title, status, notes }) {
    const belief = await ctx.db.get(beliefId);
    if (belief === null) throw new Error("Could not find belief");

    await ctx.db.patch(beliefId, {
      title: title ?? belief.title,
      status: status ?? belief.status,
      notes: notes ?? belief.notes,
      updated: Date.now(),
    });
  },
});
