import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    text: v.string(),
    type: v.string(),
    intentionId: v.optional(v.id("intentions")),
  },
  async handler(ctx, { text, type, intentionId }) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
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
    return ctx.db.insert("statements", {
      isComplete: false,
      text,
      type: type as "what" | "why" | "mind_dump",
      intentionId,
      userId: user._id,
    });
  },
});

export const get = query({
  args: { statementId: v.id("statements") },
  async handler(ctx, { statementId }) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
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
    return await ctx.db.get(statementId);
  },
});

export const remove = mutation({
  args: { id: v.id("statements") },
  async handler(ctx, { id }) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
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
    await ctx.db.delete(id);
  },
});

export const byIntentionId = query({
  args: { intentionId: v.id("intentions") },
  async handler(ctx, { intentionId }) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
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
    return (
      (await ctx.db
        .query("statements")
        .withIndex("by_intentionId", (q) => q.eq("intentionId", intentionId))
        .collect()) || []
    );
  },
});

export const update = mutation({
  args: {
    id: v.id("statements"),
    date: v.optional(v.string()),
    text: v.optional(v.string()),
    isComplete: v.optional(v.boolean()),
  },
  async handler(ctx, { id, text, isComplete, date }) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
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
    await ctx.db.patch(id, {
      date: date || undefined,
      isComplete: isComplete || undefined,
      text: text || undefined,
    });
  },
});

export const complete = mutation({
  args: { id: v.id("statements") },
  async handler(ctx, { id }) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
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
    await ctx.db.patch(id, { isComplete: true });
  },
});

export const unComplete = mutation({
  args: { id: v.id("statements") },
  async handler(ctx, { id }) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
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
    await ctx.db.patch(id, { isComplete: false });
  },
});

export const todayMindDumpStatements = query({
  args: {},
  async handler(ctx) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
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
    const today = new Date();
    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const endOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1,
    );

    return await ctx.db
      .query("statements")
      .withIndex("by_type", (q) => q.eq("type", "mind_dump"))
      .collect();
  },
});
