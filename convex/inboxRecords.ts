import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { getCurrentUserOrThrow } from "./users";

export const list = query({
  async handler(ctx) {
    const user = await getCurrentUserOrThrow(ctx);

    return await ctx.db
      .query("inboxRecords")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

// Retrieves the 5 most recently created records
export const recent = query({
  async handler(ctx) {
    const user = await getCurrentUserOrThrow(ctx);

    const last5 = await ctx.db
      .query("inboxRecords")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(5);

    return last5;
  },
});

// Retrieve all unprocessed records
export const getUnprocessed = query({
  async handler(ctx) {
    const user = await getCurrentUserOrThrow(ctx);

    return await ctx.db
      .query("inboxRecords")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("processed"), false))
      .collect();
  },
});

export const create = mutation({
  args: {
    content: v.string(),
  },
  async handler(ctx, { content }) {
    const user = await getCurrentUserOrThrow(ctx);

    return await ctx.db.insert("inboxRecords", {
      content,
      processed: false,
      updated: Date.now(),
      userId: user._id,
    });
  },
});