import moment from "moment-timezone";

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query(async (ctx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthenticated call to mutation");
  }
  const user = await ctx.db
    .query("users")
    .withIndex("by_token", (q) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier),
    )
    .unique();
  if (!user) {
    throw new Error("Unauthenticated call to mutation");
  }

  return await ctx.db
    .query("intentions")
    .filter((q) => q.eq(q.field("userId"), user._id))
    .collect();
});

export const get = query({
  args: {
    intentionId: v.id("intentions"),
  },
  async handler(ctx, { intentionId }) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated call to mutation");
    }
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
    if (!user) {
      throw new Error("Unauthenticated call to mutation");
    }

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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated call to mutation");
    }
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
    if (!user) {
      throw new Error("Unauthenticated call to mutation");
    }
    const intentions =
      (await ctx.db
        .query("intentions")
        .filter((q) => q.eq(q.field("status"), status))
        .collect()) || [];

    return intentions;
  },
});

export const create = mutation({
  args: {
    title: v.optional(v.string()),
    emotionId: v.optional(v.id("emotions")),
    notes: v.optional(v.string()),
  },
  async handler(ctx, { title, emotionId, notes }) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
    if (!user) {
      throw new Error("Unauthenticated call to mutation");
    }

    if (title === undefined) {
      title = "";
    }

    return await ctx.db.insert("intentions", {
      title,
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
    if (!user) {
      throw new Error("Unauthenticated call to mutation");
    }
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
    if (!user) {
      throw new Error("Unauthenticated call to mutation");
    }
    try {
      const existingIntention = await ctx.db.get(id);

      const updatedIntention = {
        ...existingIntention,
        title: title ?? existingIntention?.title ?? "",
        status: status ?? existingIntention?.status ?? "draft",
        emotionId: emotionId ?? existingIntention?.emotionId,
        notes: notes ?? existingIntention?.notes,
        updated:
          status && status !== existingIntention?.status
            ? moment().tz("America/Denver").valueOf()
            : existingIntention?.updated ?? undefined,
      };

      await ctx.db.patch(id, updatedIntention);
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
});
