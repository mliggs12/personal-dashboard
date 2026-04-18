import { v } from "convex/values";

import { mutation } from "./_generated/server";
import { getCurrentUserOrThrow } from "./users";

/**
 * Generate a short-lived signed URL the client POSTs screenshots to.
 * The returned storageId is what the parse action consumes.
 */
export const generateUploadUrl = mutation({
  async handler(ctx) {
    await getCurrentUserOrThrow(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Look up a playable URL for a stored screenshot — used on match
 * detail views to display the original image.
 */
export const getScreenshotUrl = mutation({
  args: { storageId: v.id("_storage") },
  async handler(ctx, { storageId }) {
    await getCurrentUserOrThrow(ctx);
    return await ctx.storage.getUrl(storageId);
  },
});
