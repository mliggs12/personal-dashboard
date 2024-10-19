import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    duration: v.optional(v.number()),
    pauseDuration: v.optional(v.number()),
    notes: v.optional(v.string()),
    intentionId: v.optional(v.id("intentions")),
    projectId: v.optional(v.id("projects")),
  },
  async handler(
    ctx,
    { duration, pauseDuration, notes, intentionId, projectId },
  ) {
    try {
      const session = {
        duration,
        pauseDuration,
        notes,
        intentionId,
        projectId,
      };
      return await ctx.db.insert("sessions", session);
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

export const todaySessions = query({
  args: {},
  async handler(ctx) {
    try {
      const now = new Date();
      const localNow = new Date(
        now.getTime() - now.getTimezoneOffset() * 60000,
      );
      const startOfDay = new Date(
        Date.UTC(
          localNow.getFullYear(),
          localNow.getMonth(),
          localNow.getDate(),
        ),
      );
      const endOfDay = new Date(
        Date.UTC(
          localNow.getFullYear(),
          localNow.getMonth(),
          localNow.getDate() + 1,
        ),
      );

      const sessions = await ctx.db
        .query("sessions")
        .filter((q) =>
          q.and(
            q.gte(q.field("_creationTime"), startOfDay.getTime()),
            q.lt(q.field("_creationTime"), endOfDay.getTime()),
          ),
        )
        .order("desc")
        .collect();

      return sessions;
    } catch (error) {
      console.error(`Error fetching today sessions: ${error}`);
      throw error;
    }
  },
});
