import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const create = mutation({
  args: {
    projectId: v.optional(v.id("projects")),
    duration: v.optional(v.number()),
    pauseDuration: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  async handler(ctx, { projectId, duration, pauseDuration, notes }) {
    try {
      const session = {
        projectId,
        duration,
        pauseDuration,
        notes,
      };
      await ctx.db.insert("sessions", session);
    } catch (error) {
      console.error(`Error creating session: ${error}`);
      throw error;
    }
  },
});

export const remove = mutation({
  args: {
    sessionId: v.id("sessions"),
  },
  async handler(ctx, { sessionId }) {
    try {
      await ctx.db.delete(sessionId);
    } catch (error) {
      console.error(`Error deleting session: ${error}`);
      throw error;
    }
  },
});
