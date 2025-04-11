import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { getCurrentUserOrThrow } from "./users";

export const list = query({
  async handler(ctx) {
    return await ctx.db.query("focusBlocks").collect();
  },
});

export const get = query({
  args: {
    id: v.id("focusBlocks"),
  },
  async handler(ctx, { id }) {
    return await ctx.db.get(id);
  },
});

export const getStatements = query({
  args: {
    id: v.id("focusBlocks"),
  },
  async handler(ctx, { id }) {
    return await ctx.db
      .query("statements")
      .withIndex("by_focusBlockId", (q) => q.eq("focusBlockId", id))
      .collect()
  }
})

export const getByIntention = query({
  args: {
    intentionId: v.id("intentions"),
  },
  async handler(ctx, { intentionId }) {
    return await ctx.db
      .query("focusBlocks")
      .withIndex("by_intention", (q) => q.eq("intentionId", intentionId))
      .collect();
  },
});

export const create = mutation({
  args: {
    startStatement: v.optional(v.string()),
    endStatement: v.optional(v.string()),
    intentionId: v.optional(v.id("intentions")),
  },
  async handler(ctx, { startStatement, endStatement, intentionId }) {
    const user = await getCurrentUserOrThrow(ctx);

    return await ctx.db.insert("focusBlocks", {
      status: "active",
      startStatement,
      endStatement,
      intentionId,
      updated: Date.now(),
      userId: user._id,
    });
  },
});

export const addStatement = mutation({
  args: {
    id: v.id("focusBlocks"),
    text: v.string(),
  },
  async handler(ctx, { id, text }) {
    const user = await getCurrentUserOrThrow(ctx);

    return await ctx.db.insert("statements", {
      text,
      type: "fb",
      focusBlockId: id,
      updated: Date.now(),
      userId: user._id,
    });
  }
});

export const update = mutation({
  args: {
    id: v.id("focusBlocks"),
    startStatement: v.optional(v.string()),
    endStatement: v.optional(v.string()),
    status: v.optional(v.union(
      v.literal("active"),
      v.literal("inactive"),
      v.literal("completed"),
      v.literal("archived")
    )),
  },
  async handler(ctx, args) {
    const { id, ...updates } = args;
    const user = await getCurrentUserOrThrow(ctx);

    // Get the existing focus block
    const existingFocusBlock = await ctx.db.get(id);
    if (!existingFocusBlock) {
      throw new Error("Focus block not found");
    }

    // Check if the user owns this focus block
    if (existingFocusBlock.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    // Update the focus block
    await ctx.db.patch(id, {
      ...updates,
      updated: Date.now(),
    });

    return id;
  },
});
