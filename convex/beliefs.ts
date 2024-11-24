import { ConvexError, v } from "convex/values";
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
    .query("beliefs")
    .filter((q) => q.eq(q.field("userId"), user._id))
    .collect();
});

export const get = query({
  args: {
    beliefId: v.id("beliefs"),
  },
  async handler(ctx, { beliefId }) {
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
    const belief = await ctx.db.get(beliefId);

    return belief;
  },
});

export const activeBeliefs = query({
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
      .query("beliefs")
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "active"),
          q.eq(q.field("userId"), user._id),
        ),
      )
      .collect();
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    status: v.optional(v.union(v.literal("active"), v.literal("backlog"))),
    notes: v.optional(v.string()),
  },
  async handler(ctx, { title, description, status, notes }) {
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
    return await ctx.db.insert("beliefs", {
      title,
      description,
      status: status || "backlog",
      notes: notes || "",
      updated: Date.now(),
      userId: user._id,
    });
  },
});

export const updateDescription = mutation({
  args: {
    beliefId: v.id("beliefs"),
    description: v.string(),
  },
  async handler(ctx, { beliefId, description }) {
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
    await ctx.db.patch(beliefId, { description });
  },
});

export const updateTitle = mutation({
  args: {
    beliefId: v.id("beliefs"),
    title: v.string(),
  },
  async handler(ctx, { beliefId, title }) {
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
    await ctx.db.patch(beliefId, { title });
  },
});

export const updateStatus = mutation({
  args: {
    beliefId: v.id("beliefs"),
    status: v.union(
      v.literal("backlog"),
      v.literal("todo"),
      v.literal("in_progress"),
      v.literal("done"),
      v.literal("archived"),
      v.literal("active"),
    ),
  },
  async handler(ctx, { beliefId, status }) {
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
    await ctx.db.patch(beliefId, { status });
  },
});

export const deleteBelief = mutation({
  args: {
    beliefId: v.id("beliefs"),
  },
  async handler(ctx, { beliefId }) {
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
    const belief = await ctx.db.get(beliefId);

    if (!belief) {
      throw new ConvexError("Note not found");
    }

    await ctx.db.delete(beliefId);
  },
});

export const activeBeliefsToday = query({
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
    // Current UTC timestamp
    const now = Date.now();

    // Convert to local time (UTC-6) and set start of day to 3 AM
    const localOffset = -6 * 60 * 60 * 1000; // UTC-6 in milliseconds
    const localNow = new Date(now + localOffset);
    const startOfDay = new Date(localNow);
    startOfDay.setHours(3, 0, 0, 0);
    // Convert back to UTC for comparison with _creationTime
    const startOfDayUTC = new Date(startOfDay.getTime() - localOffset);

    return await ctx.db
      .query("beliefs")
      .filter((q) =>
        q.and(
          q.gte(q.field("_creationTime"), startOfDayUTC.getTime()),
          q.eq(q.field("userId"), user._id),
        ),
      )
      .collect();
  },
});
