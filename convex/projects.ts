import { query } from "./_generated/server";
import { getCurrentUserOrThrow } from "./userHelpers";

export const list = query(async (ctx) => {
  const user = await getCurrentUserOrThrow(ctx);

  return await ctx.db
    .query("projects")
    .withIndex("by_user", (q) => q.eq("userId", user._id))
    .collect();
});
