import { v } from "convex/values";

import { mutation } from "./_generated/server";
import { getCurrentUserOrThrow } from "./users";

export const create = mutation({
  args: {
    content: v.string(),
  },
  async handler(ctx, { content }) {
    const user = await getCurrentUserOrThrow(ctx);

    return await ctx.db.insert("inboxRecords", {
      content,
      updated: Date.now(),
      userId: user._id,
    });
  },
});