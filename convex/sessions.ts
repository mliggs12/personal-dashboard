import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    duration: v.number(),
    pauseDuration: v.optional(v.number()),
    notes: v.optional(v.string()),
    what: v.optional(v.string()),
    why: v.optional(v.string()),
    intentionId: v.optional(v.id("intentions")),
  },
  async handler(
    ctx,
    { duration, pauseDuration, notes, what, why, intentionId },
  ) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated call to mutation");
    }
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
    if (!user) {
      throw new Error("Unauthenticated call to mutation");
    }
    const session = {
      duration,
      pauseDuration,
      notes,
      what,
      why,
      intentionId,
      userId: user._id,
    };

    return await ctx.db.insert("sessions", session);
  },
});

export const remove = mutation({
  args: {
    sessionId: v.id("sessions"),
  },
  async handler(ctx, { sessionId }) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated call to mutation");
    }
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
    if (!user) {
      throw new Error("Unauthenticated call to mutation");
    }
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated call to mutation");
    }
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
    if (!user) {
      throw new Error("Unauthenticated call to mutation");
    }
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
            q.eq(q.field("userId"), user._id),
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
