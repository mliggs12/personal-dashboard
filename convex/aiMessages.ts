import { ConvexError, v } from "convex/values";

import { mutation } from "./_generated/server";
import { getCurrentUserOrThrow } from "./users";

export const addMessage = mutation({
  args: {
    conversationId: v.id("aiConversations"),
    content: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
    model: v.optional(v.string()),
    duration: v.optional(v.number()),
    tokens: v.optional(v.number()),
  },
  async handler(ctx, { conversationId, content, role, model, duration, tokens }) {
    const user = await getCurrentUserOrThrow(ctx);
    
    // Verify the conversation belongs to the user
    const conversation = await ctx.db.get(conversationId);
    if (!conversation) {
      throw new ConvexError("Conversation not found");
    }

    if (conversation.userId !== user._id) {
      throw new ConvexError("Unauthorized");
    }

    const messageId = await ctx.db.insert("aiMessages", {
      conversationId,
      content,
      role,
      timestamp: Date.now(),
      model,
      duration,
      tokens,
    });

    // Update conversation timestamp
    await ctx.db.patch(conversationId, {
      updated: Date.now(),
    });

    return messageId;
  },
});


