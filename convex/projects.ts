import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";

export const list = query({
  async handler(ctx) {
    return await ctx.db.query("projects").collect();
  },
});

export const get = query({
  args: {
    id: v.id("projects"),
  },
  async handler(ctx, { id }) {
    return await ctx.db.get(id);
  },
});

export const getAll = query({
  args: {},
  async handler(ctx) {
    const projects = await ctx.db.query("projects").collect();

    const results = await Promise.all(
      projects.map(async (project) => {
        const sessions = await ctx.db
          .query("sessions")
          .withIndex("by_projectId", (q) => q.eq("projectId", project._id))
          .collect();
        const totalDuration = sessions.reduce(
          (acc, session) => acc + (session.duration || 0),
          0,
        );
        return {
          ...project,
          count: sessions.length,
          totalDuration,
        };
      }),
    );

    return results;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    color: v.union(
      v.literal("red"),
      v.literal("blue"),
      v.literal("green"),
      v.literal("yellow"),
      v.literal("pink"),
      v.literal("purple"),
      v.literal("orange"),
    ),
  },
  async handler(ctx, { name, color }) {
    return await ctx.db.insert("projects", {
      name,
      color,
    });
  },
});

export const remove = mutation({
  args: {
    projectId: v.id("projects"),
  },
  async handler(ctx, { projectId }) {
    const existing = await ctx.db.get(projectId);
    if (!existing) {
      throw new ConvexError("Project not found");
    }
    await ctx.db.delete(projectId);
  },
});

export const update = mutation({
  args: {
    id: v.id("projects"),
    name: v.optional(v.string()),
    color: v.optional(
      v.union(
        v.literal("red"),
        v.literal("blue"),
        v.literal("green"),
        v.literal("yellow"),
        v.literal("pink"),
        v.literal("purple"),
        v.literal("orange"),
      ),
    ),
  },
  async handler(ctx, { id, name, color }) {
    await ctx.db.patch(id, { name, color });
  },
});
