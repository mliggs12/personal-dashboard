import { v } from "convex/values";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

import { internalMutation, mutation, query } from "./_generated/server";
import { getCurrentUserOrThrow } from "./users";

dayjs.extend(utc);
dayjs.extend(timezone);

const TIMEZONE = "America/Denver";

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
// This runs via a scheduled cron job hourly, but only executes at 6am local time
// Logic: If status changed to "allow" on day X (any time), it updates on day X+4
// Example: Changed on Jan 2nd -> Updates on Jan 6th (3 complete days: 3rd, 4th, 5th)
export const updateReadyToTitheIntentions = internalMutation({
  args: {},
  async handler(ctx) {
    const now = Date.now();
    
    // Check if it's currently 6am in the local timezone
    const localNow = dayjs().tz(TIMEZONE);
    const currentHour = localNow.hour();
    
    // Only run between 6am and 7am local time
    if (currentHour !== 6) {
      console.log(
        `Skipping intention update - current hour is ${currentHour}, not 6am (${TIMEZONE})`
      );
      return { updatedCount: 0, skipped: true };
    }
    
    // Get start of today in local timezone
    const todayLocal = localNow.startOf("day");
    const todayTimestamp = todayLocal.valueOf();

    // Get all intentions with status "allow"
    const allowIntentions = await ctx.db
      .query("intentions")
      .filter((q) => q.eq(q.field("status"), "allow"))
      .collect();

    // Filter and update intentions where 3+ complete calendar days have passed
    let updatedCount = 0;
    for (const intention of allowIntentions) {
      // Use allowedAt if available, otherwise fall back to _creationTime
      // (for backward compatibility with old intentions that don't have allowedAt)
      const allowedTimestamp = intention.allowedAt ?? intention._creationTime;
      
      // Get start of the day when status was changed to "allow" (in local timezone)
      const allowedDateLocal = dayjs(allowedTimestamp).tz(TIMEZONE).startOf("day");
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

    console.log(
      `Updated ${updatedCount} allow intentions to tithe status at ${localNow.format("YYYY-MM-DD HH:mm:ss z")}`
    );
    return { updatedCount, skipped: false };
  },
});