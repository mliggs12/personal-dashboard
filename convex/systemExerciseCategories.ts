import { query } from "./_generated/server";

export const list = query({
  async handler(ctx) {
    return await ctx.db.query("systemExerciseCategories").collect();
  },
});