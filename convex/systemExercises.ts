import { v } from "convex/values";

import { query } from "./_generated/server";

export const list = query({
  async handler(ctx) {
    return await ctx.db.query("systemExercises").collect();
  },
});

export const search = query({
  async handler(ctx, { name }) {
    const exercises = await ctx.db
      .query("systemExercises")
      .withSearchIndex("search_name", (q) =>
        q.search("name", name as string)
      )
      .take(5);
    return exercises
  }
});

export const getByCategory = query({
  args: { categoryId: v.id("systemExerciseCategories") },
  async handler(ctx, { categoryId }) {
    return await ctx.db
      .query("systemExercises")
      .withIndex("by_category", (q) => q.eq("categoryId", categoryId))
      .collect();
  },
});