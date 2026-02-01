import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { getCurrentUserOrThrow } from "./users";

// ============================================================================
// QUERIES
// ============================================================================

export const list = query({
  args: {},
  async handler(ctx) {
    const user = await getCurrentUserOrThrow(ctx);
    return await ctx.db
      .query("tags")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
  },
});

export const get = query({
  args: { tagId: v.id("tags") },
  async handler(ctx, { tagId }) {
    return await ctx.db.get(tagId);
  },
});

// Get multiple tags by IDs (for resolving task.tagIds)
export const getMany = query({
  args: { tagIds: v.array(v.id("tags")) },
  async handler(ctx, { tagIds }) {
    const tags = await Promise.all(tagIds.map((id) => ctx.db.get(id)));
    return tags.filter((tag) => tag !== null);
  },
});

// Get all tags with task usage counts
export const listWithCounts = query({
  args: {},
  async handler(ctx) {
    const user = await getCurrentUserOrThrow(ctx);

    const tags = await ctx.db
      .query("tags")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return tags.map((tag) => ({
      ...tag,
      taskCount: tasks.filter((task) => task.tagIds?.includes(tag._id)).length,
    }));
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

export const create = mutation({
  args: {
    name: v.string(),
    color: v.string(),
  },
  async handler(ctx, { name, color }) {
    const user = await getCurrentUserOrThrow(ctx);

    // Check for duplicate name
    const existing = await ctx.db
      .query("tags")
      .withIndex("by_user_name", (q) =>
        q.eq("userId", user._id).eq("name", name)
      )
      .first();

    if (existing) {
      throw new Error(`Tag "${name}" already exists`);
    }

    return await ctx.db.insert("tags", {
      name,
      color,
      userId: user._id,
      updated: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    tagId: v.id("tags"),
    name: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  async handler(ctx, { tagId, name, color }) {
    const tag = await ctx.db.get(tagId);
    if (!tag) throw new Error("Tag not found");

    await ctx.db.patch(tagId, {
      ...(name !== undefined && { name }),
      ...(color !== undefined && { color }),
      updated: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { tagId: v.id("tags") },
  async handler(ctx, { tagId }) {
    const user = await getCurrentUserOrThrow(ctx);

    // Remove tagId from all tasks that have it
    const tasksWithTag = await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    for (const task of tasksWithTag) {
      if (task.tagIds?.includes(tagId)) {
        await ctx.db.patch(task._id, {
          tagIds: task.tagIds.filter((id) => id !== tagId),
          updated: Date.now(),
        });
      }
    }

    await ctx.db.delete(tagId);
  },
});
