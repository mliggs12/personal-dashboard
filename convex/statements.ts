import { v } from "convex/values";
import { mutation, MutationCtx, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const create = mutation({
  args: {
    text: v.string(),
    type: v.string(),
    intentionId: v.optional(v.id("intentions")),
  },
  async handler(ctx, { text, type, intentionId }) {
    return ctx.db.insert("statements", {
      text,
      type: type as "what" | "why" | "mind_dump",
      intentionId,
    });
  },
});

export const createMindDumpStatement = mutation({
  args: {
    text: v.string(),
  },
  async handler(ctx, { text }) {
    return await create(ctx, { text, type: "mind_dump" });
  },
});

export const todayMindDumpStatements = query({
  args: {},
  async handler(ctx) {
    const now = new Date();
    const startOfDay = new Date(
      Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 3, 0, 0),
    );
    const endOfDay = new Date(
      Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() + 1, 3, 0, 0),
    );

    return (
      (await ctx.db
        .query("statements")
        .withIndex("by_type", (q) => q.eq("type", "mind_dump"))
        .filter(
          (q) =>
            q.gte(q.field("date"), startOfDay.toISOString()) &&
            q.lt(q.field("date"), endOfDay.toISOString()),
        )
        .collect()) || []
    );
  },
});

// // New mutation to update the status of a statement
// export const updateStatus = mutation({
//   args: {
//     statementId: v.id("statements"),
//     status: v.union(v.literal("active"), v.literal("done")),
//   },
//   async handler(ctx, { statementId, status }) {
//     await ctx.db.patch(statementId, { status });
//   },
// });

// // New mutation to update the description of a statement
// export const updateDescription = mutation({
//   args: {
//     statementId: v.id("statements"),
//     description: v.string(),
//   },
//   async handler(ctx, { statementId, description }) {
//     await ctx.db.patch(statementId, { description });
//   },
// });

// New query to get a single statement by ID
export const get = query({
  args: { statementId: v.id("statements") },
  async handler(ctx, { statementId }) {
    return await ctx.db.get(statementId);
  },
});

export const remove = mutation({
  args: { id: v.id("statements") },
  async handler(ctx, { id }) {
    await ctx.db.delete(id);
  },
});

export const byIntentionId = query({
  args: { intentionId: v.id("intentions") },
  async handler(ctx, { intentionId }) {
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
    text: v.string(),
  },
  async handler(ctx, { id, text }) {
    await ctx.db.patch(id, { text });
  },
});
