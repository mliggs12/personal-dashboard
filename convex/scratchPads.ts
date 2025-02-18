import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { getCurrentUserOrThrow } from "./users";

export const create = mutation({
  async handler(ctx) {
    const user = await getCurrentUserOrThrow(ctx);

    return await ctx.db.insert("scratchPads", {
      content: "",
      updated: Date.now(),
      userId: user._id,
    });
  },
});

export const getByUser = query({
  async handler(ctx) {
    const user = await getCurrentUserOrThrow(ctx);

    return await ctx.db
      .query("scratchPads")
      .withIndex("by_user", (q) =>
        q.eq("userId", user._id)
      )
      .first();
  },
});

export const update = mutation({
  args: {
    id: v.id("scratchPads"),
    content: v.string(),
   },
  async handler(ctx, { id, content }) {
    const user = await getCurrentUserOrThrow(ctx);

    return await ctx.db.patch(id, {
      content,
      updated: Date.now(),
      userId: user._id,
    });
  },
})