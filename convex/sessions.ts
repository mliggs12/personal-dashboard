import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUserOrThrow } from "./userHelpers";

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
    const user = await getCurrentUserOrThrow(ctx);

    const session = {
      duration,
      pauseDuration,
      notes: notes || "",
      what,
      why,
      intentionId,
      userId: user._id,
    };

    return await ctx.db.insert("sessions", session);
  },
});

export const remove = mutation({
  args: { sessionId: v.id("sessions") },
  async handler(ctx, { sessionId }) {
    return await ctx.db.delete(sessionId);
  },
});

export const todaySessions = query({
  args: {},
  async handler(ctx) {
    const user = await getCurrentUserOrThrow(ctx);

    const now = new Date();
    const localNow = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    const startOfDay = new Date(
      Date.UTC(localNow.getFullYear(), localNow.getMonth(), localNow.getDate()),
    );
    const endOfDay = new Date(
      Date.UTC(
        localNow.getFullYear(),
        localNow.getMonth(),
        localNow.getDate() + 1,
      ),
    );

    return await ctx.db
      .query("sessions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) =>
        q.and(
          q.gte(q.field("_creationTime"), startOfDay.getTime()),
          q.lt(q.field("_creationTime"), endOfDay.getTime()),
        ),
      )
      .order("desc")
      .collect();
  },
});
