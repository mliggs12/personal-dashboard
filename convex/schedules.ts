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
    .query("schedules")
    .filter((q) => q.eq(q.field("userId"), user._id))
    .collect();
});

export const listTemplates = query(async (ctx) => {
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
    .query("schedules")
    .filter((q) =>
      q.and(
        q.eq(q.field("isTemplate"), true),
        q.eq(q.field("userId"), user._id),
      ),
    )
    .collect();
});

export const get = query({
  args: { scheduleId: v.id("schedules") },
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
    const schedule = await ctx.db.get(scheduleId);

    if (!schedule) {
      throw new Error("Schedule not found");
    }

    return schedule;
  },
});

export const getOrderedActivities = query({
  args: { scheduleId: v.id("schedules") },
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

    if (activities.length === 0) {
      return [];
    }

    return activities.sort((a, b) => a.index - b.index);
  },
});

export const getByDate = query({
  args: {
    date: v.string(),
  },
  async handler(ctx, { date }) {
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
      .query("schedules")
      .filter((q) =>
        q.and(q.eq("date", date), q.eq(q.field("userId"), user._id)),
      )
      .first();
  },
});

export const createSchedule = mutation({
  args: {
    name: v.string(),
    date: v.optional(v.string()),
    isTemplate: v.boolean(),
    length: v.number(),
  },
  async handler(ctx, { name, date, isTemplate, length }) {
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
    return await ctx.db.insert("schedules", {
      name: name,
      date: date,
      isTemplate: isTemplate,
      length: length,
      userId: user._id,
    });
  },
});

export const updateSchedule = mutation({
  args: {
    scheduleId: v.id("schedules"),
    name: v.optional(v.string()),
    date: v.optional(v.string()),
    isTemplate: v.optional(v.boolean()),
    length: v.optional(v.number()),
    start: v.optional(v.number()),
  },
  async handler(ctx, { scheduleId, name, date, isTemplate, length, start }) {
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
    return await ctx.db.patch(scheduleId, {
      name: name,
      date: date,
      isTemplate: isTemplate,
      length: length,
      updated: Date.now(),
      userId: user._id,
    });
  },
});

export const deleteSchedule = mutation({
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
    return await ctx.db.delete(scheduleId);
  },
});

export const templateSchedules = query({
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
    return await ctx.db
      .query("schedules")
      .filter((q) =>
        q.and(
          q.eq(q.field("isTemplate"), true),
          q.eq(q.field("userId"), user._id),
        ),
      )
      .collect();
  },
});
