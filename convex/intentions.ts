import { v } from "convex/values";

import { internalMutation, mutation, query } from "./_generated/server";
import dayjs from "./lib/dayjs.config";
import { getCurrentUserOrThrow } from "./users";

export const list = query(async (ctx) => {
  const user = await getCurrentUserOrThrow(ctx);

  return await ctx.db
    .query("intentions")
    .withIndex("by_user", (q) => q.eq("userId", user._id))
    .collect();
});

export const get = query({
  args: {
    id: v.id("intentions"),
  },
  async handler(ctx, { id }) {
    return await ctx.db.get(id);
  },
});

export const getByStatus = query({
  args: {
    status: v.union(
      v.literal("draft"),
      v.literal("tithe"),
      v.literal("allow"),
      v.literal("done"),
    ),
  },
  async handler(ctx, { status }) {
    const user = await getCurrentUserOrThrow(ctx);

    return await ctx.db
      .query("intentions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("status"), status))
      .collect();
  },
});

export const create = mutation({
  args: {
    title: v.optional(v.string()),
    emotionId: v.optional(v.id("emotions")),
    notes: v.optional(v.string()),
  },
  async handler(ctx, { title, emotionId, notes }) {
    const user = await getCurrentUserOrThrow(ctx);

    return await ctx.db.insert("intentions", {
      title: title || "",
      status: "draft",
      emotionId,
      notes,
      updated: Date.now(),
      userId: user._id,
    });
  },
});

export const remove = mutation({
  args: {
    id: v.id("intentions"),
  },
  async handler(ctx, { id }) {
    await ctx.db.delete(id);
  },
});

export const update = mutation({
  args: {
    id: v.id("intentions"),
    title: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("tithe"),
        v.literal("allow"),
        v.literal("done"),
      ),
    ),
    emotionId: v.optional(v.union(v.id("emotions"), v.null())),
    notes: v.optional(v.string()),
  },
  async handler(ctx, { id, title, status, emotionId, notes }) {
    const existingIntention = await ctx.db.get(id);
    const now = Date.now();

    const newStatus = status ?? existingIntention?.status ?? "draft";
    const oldStatus = existingIntention?.status;

    // Track when status changes to "allow" for the cron job
    let allowedAt = existingIntention?.allowedAt;
    if (status !== undefined && status !== oldStatus) {
      // Status is being changed
      if (status === "allow") {
        // Set allowedAt when status changes to "allow"
        allowedAt = now;
      } else if (oldStatus === "allow") {
        // Clear allowedAt when status changes from "allow" to something else
        allowedAt = undefined;
      }
    }

    const updatedIntention = {
      ...existingIntention,
      title: title ?? existingIntention?.title ?? "",
      status: newStatus,
      emotionId: emotionId !== undefined 
        ? (emotionId === null ? undefined : emotionId)
        : existingIntention?.emotionId,
      notes: notes ?? existingIntention?.notes,
      updated: now,
      allowedAt,
    };

    await ctx.db.patch(id, updatedIntention);
  },
});


export const search = query({
  args: { query: v.string() },
  async handler(ctx, { query }) {
    const user = await getCurrentUserOrThrow(ctx);

    if (!user) {
      return [];
    }

    return await ctx.db
      .query("intentions")
      .withSearchIndex("search_title", (q) =>
        q.search("title", query).eq("userId", user._id),
      )
      .collect();
  },
});

// Internal mutation to automatically update stale "allow" intentions to "tithe"
// This runs via a scheduled cron job hourly, but only executes at 6am local time per user
// Logic: If status changed to "allow" on day X (any time), it updates on day X+4
// Example: Changed on Jan 2nd -> Updates on Jan 6th (3 complete days: 3rd, 4th, 5th)
export const updateReadyToTitheIntentions = internalMutation({
  args: {},
  async handler(ctx) {
    const now = Date.now();

    // Get all intentions with status "allow"
    const allowIntentions = await ctx.db
      .query("intentions")
      .filter((q) => q.eq(q.field("status"), "allow"))
      .collect();

    // Group intentions by user to process per-user timezones
    const intentionsByUser = new Map<string, typeof allowIntentions>();
    for (const intention of allowIntentions) {
      if (!intention.userId) continue;
      const userId = intention.userId;
      if (!intentionsByUser.has(userId)) {
        intentionsByUser.set(userId, []);
      }
      intentionsByUser.get(userId)!.push(intention);
    }

    let updatedCount = 0;
    const skippedByTimezone: Record<string, number> = {};

    // Process each user's intentions with their timezone
    for (const [userId, userIntentions] of intentionsByUser) {
      const user = await ctx.db.get(userId as any);
      if (!user) continue;
      
      const timezone = user.timezone ?? "America/Denver";
      const localNow = dayjs().tz(timezone);
      const currentHour = localNow.hour();
      
      // Only run at 6am local time for this user's timezone
      if (currentHour !== 6) {
        skippedByTimezone[timezone] = (skippedByTimezone[timezone] || 0) + userIntentions.length;
        continue;
      }
      
      // Get start of today in user's timezone
      const todayLocal = localNow.startOf("day");
      const todayTimestamp = todayLocal.valueOf();

      // Filter and update intentions where 3+ complete calendar days have passed
      for (const intention of userIntentions) {
        // Use allowedAt if available, otherwise fall back to _creationTime
        // (for backward compatibility with old intentions that don't have allowedAt)
        const allowedTimestamp = intention.allowedAt ?? intention._creationTime;
        
        // Get start of the day when status was changed to "allow" (in user's timezone)
        const allowedDateLocal = dayjs(allowedTimestamp).tz(timezone).startOf("day");
        const allowedDateTimestamp = allowedDateLocal.valueOf();
        
        // Calculate difference in days
        const daysDifference = Math.floor(
          (todayTimestamp - allowedDateTimestamp) / (24 * 60 * 60 * 1000)
        );
        
        // Update if 4 or more days difference (3 complete days have passed)
        if (daysDifference >= 4) {
          await ctx.db.patch(intention._id, {
            status: "tithe",
            updated: now,
            allowedAt: undefined, // Clear allowedAt since status is no longer "allow"
          });
          updatedCount++;
        }
      }
    }

    console.log(
      `Updated ${updatedCount} allow intentions to tithe status. Skipped by timezone: ${JSON.stringify(skippedByTimezone)}`
    );
    return { updatedCount, skipped: false };
  },
});