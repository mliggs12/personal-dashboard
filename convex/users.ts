import { v } from "convex/values";

import { query, QueryCtx } from "./_generated/server";
import { getCurrentUser } from "./userHelpers";

export const current = query({
  async handler(ctx: QueryCtx) {
    return await getCurrentUser(ctx);
  },
});

export const get = query({
  args: { userId: v.id("users") },
  async handler(ctx, { userId }) {
    return await ctx.db.get(userId);
  },
});
