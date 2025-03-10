import { mutation } from "./_generated/server";
import { getCurrentUserOrThrow } from "./users";

// Retrieves the banner for a user, creating one if it doesn't exist
export const get = mutation({
  async handler(ctx) {
    const user = await getCurrentUserOrThrow(ctx);

    let banner = await ctx.db
      .query("banners")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (!banner) {
      const bannerId = await ctx.db.insert("banners", {
        content: "Click here to edit your banner",
        updated: Date.now(),
        userId: user._id,
      });
      banner = await ctx.db.get(bannerId);
    }

    return banner;
  },
});