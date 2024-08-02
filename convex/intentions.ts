import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query(async (ctx) => {
  return await ctx.db.query("intentions").collect();
});

export const createIntention = mutation({
  args: {
    title: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("archived"),
      v.literal("draft"),
    ),
    whatStatements: v.array(v.string()),
    whyStatements: v.array(v.string()),
    emotionIds: v.array(v.id("emotions")),
    notes: v.string(),
  },
  async handler(ctx, args) {
    await ctx.db.insert("intentions", {
      title: args.title,
      status: args.status,
      whatStatements: args.whatStatements,
      whyStatements: args.whyStatements,
      emotionIds: args.emotionIds,
      notes: args.notes,
    });
  },
});

export const getIntention = query({
  args: {
    intentionId: v.id("intentions"),
  },
  async handler(ctx, { intentionId }) {
    return await ctx.db.get(intentionId);
  },
});

export const deleteIntention = mutation({
  args: {
    id: v.id("intentions"),
  },
  async handler(ctx, { id }) {
    await ctx.db.delete(id);
  },
});
