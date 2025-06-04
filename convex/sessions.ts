import { v } from "convex/values";
import dayjs from "dayjs";

import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { internalMutation, mutation, query } from "./_generated/server";
import { getCurrentUser, getCurrentUserOrThrow } from "./users";

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

export const titheSessions = query({
  args: {},
  async handler(ctx) {
    const user = await getCurrentUser(ctx);

    return await ctx.db
      .query("sessions")
      .withIndex("by_user", (q) => q.eq("userId", user?._id))
      .filter((q) => q.neq("emotionId", undefined))
      .order("desc")
      .collect();
  },
});

export const todayTitheSessions = query({
  async handler(ctx) {
    const user = await getCurrentUser(ctx);

    const todayStart = dayjs().startOf("day").valueOf();
    const todayEnd = dayjs().endOf("day").valueOf();

    return await ctx.db
      .query("sessions")
      .withIndex("by_user", (q) => q.eq("userId", user?._id))
      .filter((q) =>
        q.and(
          q.neq(q.field("emotionId"), undefined),
          q.gte(q.field("_creationTime"), todayStart),
          q.lt(q.field("_creationTime"), todayEnd),
        ),
      )
      .order("desc")
      .collect();
  },
});

export const titheSessionsByEmotion = query({
  args: { emotionId: v.id("emotions") },
  async handler(ctx, { emotionId }) {
    return await ctx.db
      .query("sessions")
      .filter((q) => q.eq(q.field("emotionId"), emotionId))
      .collect();
  },
});

// Using sleepRecords as an example
export const getActiveSession = query({
  async handler(ctx) {
    const user = await getCurrentUserOrThrow(ctx);

    return await ctx.db
      .query("sessions")
      .withIndex("by_active_user", (q) => 
        q.eq("isActive", true).eq("userId", user._id),
      )
      .unique();
  },
});

export const closeActiveSessions = internalMutation({
  args: { userId: v.string() },
  async handler(ctx, { userId }) {
    const activeSessions = await ctx.db
      .query("sessions")
      .withIndex("by_active_user", (q) =>
        q.eq("isActive", true).eq("userId", userId as Id<"users">),
      )
      .collect();

    for (const sessions of activeSessions) {
      await ctx.db.patch(sessions._id, {
        isActive: false,
        updated: Date.now(),
        userId: userId as Id<"users">,
      });
    }
  },
});

export const start = mutation({
  args: {
    startTimestamp: v.number(), // Grabs local timestamp in milliseconds
    duration: v.optional(v.number()),
  },
  async handler(ctx, { startTimestamp, duration }) {
    const user = await getCurrentUserOrThrow(ctx);

    await ctx.runMutation(internal.sessions.closeActiveSessions, { userId: user._id });

    const end = duration ? startTimestamp + duration * 1000 : undefined

    return await ctx.db.insert("sessions", {
      start: startTimestamp,
      end: end,
      isActive: true,
      duration: duration ?? undefined,
      updated: Date.now(),
      userId: user._id,
    });
  },
});

export const end = mutation({
  args: {
    sessionId: v.id("sessions"),
    endTimestamp: v.optional(v.number()), // Grabs local timestamp for when a stopwatch session is ended
  },
  async handler(ctx, { sessionId, endTimestamp }) {
    const session = await ctx.db.get(sessionId);
    if (!session) {
      throw new Error("Session not found");
    }
    
    return await ctx.db.patch(sessionId, {
      end: endTimestamp ?? session.end,
      duration: endTimestamp ? Math.floor((endTimestamp - session.start) / 1000) : session.duration,
      isActive: false,
      updated: Date.now(),
    });
  },
});