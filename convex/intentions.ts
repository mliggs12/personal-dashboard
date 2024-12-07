import { getCurrentUserOrThrow } from "./userHelpers";

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query(async (ctx) => {
  const user = await getCurrentUserOrThrow(ctx);

  return await ctx.db
    .query("intentions")
    .withIndex("by_user", (q) => q.eq("userId", user._id))
    .collect();
});

export const get = query({
  args: {
    intentionId: v.id("intentions"),
  },
  async handler(ctx, { intentionId }) {
    return await ctx.db.get(intentionId);
  },
});

export const getByStatus = query({
  args: {
    status: v.union(
      v.literal("draft"),
      v.literal("tithe"),
      v.literal("allow"),
      v.literal("done"),
    ),
  },
  async handler(ctx, { status }) {
    const user = await getCurrentUserOrThrow(ctx);

    return await ctx.db
      .query("intentions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("status"), status))
      .collect();
  },
});

export const create = mutation({
  args: {
    title: v.optional(v.string()),
    emotionId: v.optional(v.id("emotions")),
    notes: v.optional(v.string()),
  },
  async handler(ctx, { title, emotionId, notes }) {
    const user = await getCurrentUserOrThrow(ctx);

    return await ctx.db.insert("intentions", {
      title: title || "",
      status: "draft",
      emotionId,
      notes,
      updated: Date.now(),
      userId: user._id,
    });
  },
});

export const remove = mutation({
  args: {
    id: v.id("intentions"),
  },
  async handler(ctx, { id }) {
    await ctx.db.delete(id);
  },
});

export const update = mutation({
  args: {
    id: v.id("intentions"),
    title: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("tithe"),
        v.literal("allow"),
        v.literal("done"),
      ),
    ),
    emotionId: v.optional(v.id("emotions")),
    notes: v.optional(v.string()),
  },
  async handler(ctx, { id, title, status, emotionId, notes }) {
    const existingIntention = await ctx.db.get(id);

    const updatedIntention = {
      ...existingIntention,
      title: title ?? existingIntention?.title ?? "",
      status: status ?? existingIntention?.status ?? "draft",
      emotionId: emotionId ?? existingIntention?.emotionId,
      notes: notes ?? existingIntention?.notes,
      updated: Date.now(),
    };

    await ctx.db.patch(id, updatedIntention);
  },
});
