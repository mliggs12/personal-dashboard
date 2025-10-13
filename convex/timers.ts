import { v } from "convex/values";

import { Doc } from "./_generated/dataModel";
import { mutation, MutationCtx, query, QueryCtx } from "./_generated/server";
import { getCurrentUserOrThrow } from "./users";

export const create = mutation({
  args: {
    duration: v.number(),
  },
  async handler(ctx, { duration }) {
    const user = await getCurrentUserOrThrow(ctx);

    await ctx.db.insert("timers", {
      duration,
      startTime: undefined,
      status: "idle",
      timerType: undefined,
      intentionId: undefined,
      pausedTime: undefined,
      lastPauseStart: undefined,
      userId: user._id,
    });
  }
});

async function getTimer(ctx: QueryCtx) {
  const user = await getCurrentUserOrThrow(ctx)

  return await ctx.db
    .query("timers")
    .withIndex("by_user", (q) => q.eq("userId", user._id))
    .first();
}

export const getActiveTimer = query({
  args: {},
  async handler(ctx) {
    return await getTimer(ctx);
  },
});

export async function getOrCreateTimer(ctx: MutationCtx, duration?: number): Promise<Doc<"timers"> | null> {
  const user = await getCurrentUserOrThrow(ctx);

  let timer = await ctx.db
    .query("timers")
    .withIndex("by_user", (q) => q.eq("userId", user._id))
    .first();

  if (!timer) {
    await ctx.db.insert("timers", {
      duration: duration ?? (5 * 60),
      startTime: undefined,
      status: "idle",
      timerType: undefined,
      intentionId: undefined,
      pausedTime: undefined,
      lastPauseStart: undefined,
      userId: user._id,
    });

    timer = await ctx.db
      .query("timers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();
  }

  return timer;
}

export const startTimer = mutation({
  args: {
    duration: v.number(),
    startTime: v.string(),
    timerType: v.optional(v.union(v.literal("session"), v.literal("tithe"))),
    intentionId: v.optional(v.id("intentions"))
  },
  async handler(ctx, { duration, startTime, timerType, intentionId }) {
    const timer = await getOrCreateTimer(ctx, duration);
    if (!timer) {
      console.error("Timer not found");
      return;
    }

    await ctx.db.patch(timer._id, {
      duration,
      startTime,
      status: "running",
      timerType,
      intentionId,
      pausedTime: 0, // Reset pause tracking on start
      lastPauseStart: undefined,
    });
  },
});

export const pauseTimer = mutation({
  args: {
    pauseStartTime: v.string(),
  },
  async handler(ctx, { pauseStartTime }) {
    const timer = await getTimer(ctx);
    if (!timer) {
      throw new Error("Timer not found");
    }

    await ctx.db.patch(timer._id, {
      status: "paused",
      lastPauseStart: pauseStartTime,
    });
  },
});

export const resumeTimer = mutation({
  args: {
    additionalPausedTime: v.number(),
  },
  async handler(ctx, { additionalPausedTime }) {
    const timer = await getTimer(ctx);
    if (!timer) {
      throw new Error("Timer not found");
    }

    const currentPausedTime = timer.pausedTime ?? 0;

    await ctx.db.patch(timer._id, {
      status: "running",
      pausedTime: currentPausedTime + additionalPausedTime,
      lastPauseStart: undefined,
    });
  },
});

export const finishTimer = mutation({
  args: {},
  async handler(ctx) {
    const timer = await getTimer(ctx);
    if (!timer) {
      console.warn("Timer not found when trying to finish");
      return;
    }

    await ctx.db.patch(timer._id, {
      startTime: undefined,
      status: "idle",
      timerType: undefined,
      intentionId: undefined,
      pausedTime: undefined,
      lastPauseStart: undefined,
    });
  },
});