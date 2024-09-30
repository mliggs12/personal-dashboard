import { query, mutation } from "./_generated/server";
import { ConvexError, v } from "convex/values";

export const list = query(async (ctx) => {
  return await ctx.db.query("beliefs").collect();
});

export const get = query({
  args: {
    beliefId: v.id("beliefs"),
  },
  async handler(ctx, { beliefId }) {
    const belief = await ctx.db.get(beliefId);

    return belief;
  },
});

export const activeBeliefs = query({
  async handler(ctx) {
    return await ctx.db
      .query("beliefs")
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    status: v.optional(v.union(v.literal("active"), v.literal("backlog"))),
  },
  async handler(ctx, { title, description, status }) {
    await ctx.db.insert("beliefs", {
      title,
      description,
      status: status || "backlog",
    });
  },
});

export const updateDescription = mutation({
  args: {
    beliefId: v.id("beliefs"),
    description: v.string(),
  },
  async handler(ctx, { beliefId, description }) {
    await ctx.db.patch(beliefId, { description });
  },
});

export const updateTitle = mutation({
  args: {
    beliefId: v.id("beliefs"),
    title: v.string(),
  },
  async handler(ctx, { beliefId, title }) {
    await ctx.db.patch(beliefId, { title });
  },
});

export const updateStatus = mutation({
  args: {
    beliefId: v.id("beliefs"),
    status: v.union(
      v.literal("backlog"),
      v.literal("todo"),
      v.literal("in_progress"),
      v.literal("done"),
      v.literal("archived"),
      v.literal("active"),
    ),
  },
  async handler(ctx, { beliefId, status }) {
    await ctx.db.patch(beliefId, { status });
  },
});

export const deleteBelief = mutation({
  args: {
    beliefId: v.id("beliefs"),
  },
  async handler(ctx, { beliefId }) {
    const belief = await ctx.db.get(beliefId);

    if (!belief) {
      throw new ConvexError("Note not found");
    }

    await ctx.db.delete(beliefId);
  },
});
