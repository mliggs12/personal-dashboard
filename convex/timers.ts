import { v } from "convex/values";

import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { internalMutation, mutation, query, QueryCtx } from "./_generated/server";
import { getCurrentUserOrThrow } from "./users";

export const start = mutation({
  args: {
    duration: v.number(),  // s
    intentionId: v.optional(v.string())
  },
  async handler(ctx, { duration }) {
    const now = Math.floor(Date.now() / 1000)

    const timer = await getCurrentTimer(ctx)

    const timerData = {
      duration,
      startedAt: now,
      pausedAt: undefined,
      totalPauseTime: 0,
      isActive: true,
      isPaused: false,
    };

    if (timer) {
      await ctx.db.replace(timer._id, { ...timerData, userId: timer.userId });
    } else {
      const user = await getCurrentUserOrThrow(ctx)
      await ctx.db.insert("timers", { ...timerData, userId: user._id });
    }
  }
});

export const pause = mutation({
  args: {},
  async handler(ctx) {
    const timer = await getCurrentTimer(ctx)

    if (!timer || !timer.isActive || timer.isPaused) {
      throw new Error("No active timer to pause");
    }

    const now = Date.now()

    await ctx.db.patch(timer._id, {
      isPaused: true,
      pausedAt: now,
    });
  },
});

export const resume = mutation({
  args: {},
  async handler(ctx) {
    const timer = await getCurrentTimer(ctx)

    if (!timer || !timer.isActive || !timer.isPaused || !timer.pausedAt) {
      throw new Error("No paused timer to resume");
    }

    const now = Date.now()
    const pauseDuration = now - timer.pausedAt;
    const newTotalPauseTime = timer.totalPauseTime + pauseDuration

    const elapsedTime = now - timer.startedAt - newTotalPauseTime;
    const remainingTime = Math.max(timer.duration - elapsedTime, 0);

    const scheduledFunctionId = await ctx.scheduler.runAfter(
      remainingTime,
      internal.timers.complete,
      {}
    )

    await ctx.db.patch(timer._id, {
      isPaused: false,
      pausedAt: undefined,
      totalPauseTime: newTotalPauseTime,
    });
  },
});

export const stop = mutation({
  args: { intentionId: v.optional(v.string()) },
  handler: async (ctx, { intentionId }) => {
    await finishTimerLogic(ctx, intentionId, true);
  },
});

// Scheduled function
export const complete = internalMutation({
  args: {
    intentionId: v.optional(v.string()),
    wasStopped: v.optional(v.boolean())
  },
  async handler(ctx, { intentionId, wasStopped }) {
    await finishTimerLogic(ctx, intentionId, wasStopped)
  }
});

export async function finishTimerLogic(ctx: any, intentionId?: string, wasStopped?: boolean) {
  const timer = await getCurrentTimer(ctx)

  if (!timer) return

  const now = Date.now()
  let actualDuration = now - timer.startedAt - timer.totalPauseTime

  if (wasStopped) {
    const currentPauseTime = timer.isPaused && timer.pausedAt
      ? now - timer.pausedAt
      : 0;
    actualDuration = now - timer.startedAt - timer.totalPauseTime - currentPauseTime
  }

  await ctx.db.insert("sessions", {
    start: timer.startedAt,
    end: now,
    duration: actualDuration,
    intentionId: intentionId as Id<"intentions"> ?? undefined,
    updated: now,
    userId: timer.userId,
  });

  await ctx.db.patch(timer._id, {
    isActive: false,
    isPaused: false,
    pausedAt: undefined,
    totalPauseTime: 0,
    scheduledFunctionId: undefined
  })
}

export const getTimerState = query({
  args: {},
  async handler(ctx) {
    const timer = await getCurrentTimer(ctx)

    if (!timer || !timer.isActive) {
      return { duration: 0, isActive: false, isPaused: false, timeLeft: 0 };
    }

    const now = Date.now();

    if (timer.isPaused && timer.pausedAt) {
      const elapsedBeforePause = timer.pausedAt - timer.startedAt - timer.totalPauseTime;
      const timeLeft = Math.max(timer.duration - elapsedBeforePause, 0);

      return {
        duration: timer.duration,
        startedAt: timer.startedAt,
        isActive: true,
        isPaused: true,
        timeLeft,
      };
    }

    const elapsed = now - timer.startedAt - timer.totalPauseTime;
    const timeLeft = Math.max(timer.duration - elapsed, 0);

    return {
      duration: timer.duration,
      startedAt: timer.startedAt,
      isActive: true,
      isPaused: false,
      timeLeft,
    };
  },
});

async function getCurrentTimer(ctx: QueryCtx) {
  const user = await getCurrentUserOrThrow(ctx)

  return await ctx.db
    .query("timers")
    .withIndex("by_user", (q) => q.eq("userId", user._id))
    .first();
}
