import { v } from "convex/values";
import { query } from "./_generated/server";

export const get = query({
  args: { taskId: v.id("recurringTasks") },
  async handler(ctx, { taskId }) {
    return await ctx.db.get(taskId);
  },
});
