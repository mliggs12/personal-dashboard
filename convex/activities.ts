import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query(async (ctx) => {
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
  return await ctx.db
    .query("activities")
    .filter((q) => q.eq(q.field("userId"), user._id))
    .collect();
});

export const listBySchedule = query({
  args: {
    scheduleId: v.id("schedules"),
  },
  async handler(ctx, { scheduleId }) {
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
    const activities = await ctx.db
      .query("activities")
      .filter((q) =>
        q.and(
          q.eq(q.field("scheduleId"), scheduleId),
          q.eq(q.field("userId"), user._id),
        ),
      )
      .collect();
    return activities.sort((a, b) => a.index - b.index);
  },
});

export const createActivity = mutation({
  args: {
    scheduleId: v.id("schedules"),
    start: v.number(),
    length: v.number(),
  },
  async handler(ctx, { scheduleId, start, length }) {
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
    return await ctx.db.insert("activities", {
      index: 0,
      name: "",
      isForced: false,
      isRigid: false,
      scheduleId,
      start,
      length,
      userId: user._id,
    });
  },
});

export const updateLength = mutation({
  args: {
    activityId: v.id("activities"),
    length: v.number(),
  },
  async handler(ctx, { activityId, length }) {
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
    return await ctx.db.patch(activityId, { length });
  },
});

export const updateActivities = mutation({
  args: {
    activities: v.array(
      v.object({
        _id: v.id("activities"),
        index: v.optional(v.number()),
        start: v.number(),
        length: v.number(),
        name: v.optional(v.string()),
        isForced: v.optional(v.boolean()),
        isRigid: v.optional(v.boolean()),
        scheduleId: v.id("schedules"),
      }),
    ),
  },
  async handler(ctx, { activities }) {
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
    for (const activity of activities) {
      await ctx.db.patch(activity._id, { ...activity });
    }
  },
});

export const updateActivity = mutation({
  args: {
    activityId: v.id("activities"),
    index: v.optional(v.number()),
    start: v.optional(v.number()),
    length: v.optional(v.number()),
    name: v.optional(v.string()),
    isForced: v.optional(v.boolean()),
    isRigid: v.optional(v.boolean()),
    scheduleId: v.optional(v.id("schedules")),
  },
  async handler(
    ctx,
    { activityId, index, start, length, name, isForced, isRigid, scheduleId },
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
    return await ctx.db.patch(activityId, {
      index,
      start,
      length,
      name,
      isForced,
      isRigid,
      scheduleId,
    });
  },
});
