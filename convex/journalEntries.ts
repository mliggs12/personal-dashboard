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
      type: null,
      updated: Date.now(),
      userId: user!._id,
    });
  },
});
