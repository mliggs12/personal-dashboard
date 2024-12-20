import { v } from "convex/values";

import { mutation } from "./_generated/server";

export const send = mutation({
  args: { chatId: v.id("chats"), content: v.string(), authorId: v.id("users") },
  async handler(ctx, { chatId, content, authorId }) {
    await ctx.db.insert("messages", { chatId, content, authorId });
  },
});
