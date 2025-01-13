import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { getCurrentUserOrThrow, userByExternalId } from "./userHelpers";

export const list = query(async (ctx) => {
  const user = await getCurrentUserOrThrow(ctx);

  return await ctx.db
    .query("projects")
    .withIndex("by_user", (q) => q.eq("userId", user._id))
    .collect();
});

export const create = mutation({
  args: {
    name: v.string(),
    notes: v.optional(v.string()),
    userId: v.optional(v.string()),
  },
  async handler(ctx, { name, notes, userId }) {
    let user;
    if (userId) {
      user = await userByExternalId(ctx, userId);
    } else {
      user = await getCurrentUserOrThrow(ctx);
    }

    return await ctx.db.insert("projects", {
      name,
      notes: notes || "",
      status: "active",
      userId: user!._id,
      updated: Date.now(),
    });
  },
});

export const get = query({
  args: { projectId: v.id("projects") },
  async handler(ctx, { projectId }) {
    return await ctx.db.get(projectId);
  },
});
