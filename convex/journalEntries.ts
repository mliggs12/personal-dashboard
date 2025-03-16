import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { getCurrentUserOrThrow, userByExternalId } from "./users";

export const list = query(async (ctx) => {
  const user = await getCurrentUserOrThrow(ctx);

  return await ctx.db
    .query("journalEntries")
    .withIndex("by_user", (q) => q.eq("userId", user._id))
    .order("desc")
    .collect();
});

export const get = query({
  args: { id: v.id("journalEntries") },
  async handler(ctx, { id }) {
    return await ctx.db.get(id);
  }
});

export const create = mutation({
  args: {
    content: v.string(),
    userId: v.optional(v.string()),
  },
  async handler(ctx, { content, userId }) {
    let user;
    if (userId) {
      user = await userByExternalId(ctx, userId);
    } else {
      user = await getCurrentUserOrThrow(ctx);
    }

    return await ctx.db.insert("journalEntries", {
      content,
      type: "none",
      updated: Date.now(),
      userId: user!._id,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("journalEntries"),
    content: v.optional(v.string()),
    type: v.optional(v.union(v.literal("none"), v.literal("highlight"), v.literal("task"), v.literal("idea"))),
  },
  async handler(ctx, { id, content, type }) {
    const entry = await ctx.db.get(id);
    if (entry === null) throw new Error("Could not find entry");

    await ctx.db.patch(id, {
      content: content || entry.content,
      type: type || entry.type,
      updated: Date.now(),
    });
  },
});